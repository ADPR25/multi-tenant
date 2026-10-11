<script setup lang="ts">
import { surveysService, type Survey } from "@/services";
import { onMounted, onUnmounted, ref, watch } from "vue";

defineOptions({ name: "SurveyIndexCreate" });

const props = defineProps<{
  item?: Survey | null;
}>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

interface SurveyPage { name: string; title: string; elements: Record<string, unknown>[]; }
interface SurveySchema { title: string; description?: string; pages: SurveyPage[]; timeLimit?: unknown; }

interface AuraCreator {
  schema: SurveySchema;
  root?: HTMLElement;
  setSchema?: (s: SurveySchema) => void;
  on: (event: "change" | "save", cb: (schema: SurveySchema) => void) => void;
  emit?: (event: string, schema: SurveySchema) => void;
  getSchema?: () => SurveySchema;
  persist?: () => void;
  destroy?: () => void;
}

declare global {
  interface Window {
    AuraSurveyCreator: new (el: HTMLElement, opts: { schema: SurveySchema; storageKey?: string; onSave: (s: SurveySchema) => void }) => AuraCreator;
  }
}

const mount = ref<HTMLDivElement | null>(null);
const titleInput = ref(props.item?.title || "");
const descriptionInput = ref(props.item?.description || "");
const endDate = ref<Date | null>(props.item?.endDate ? new Date(props.item.endDate) : new Date());

let creator: AuraCreator | null = null;

const isEdit = !!props.item?.id;

const schema = ref<SurveySchema>(
  ((props.item as (Survey & { survey?: SurveySchema }) | null)?.survey) || {
    title: props.item?.title || "Nueva encuesta",
    description: props.item?.description || "",
    pages: [{ name: "page1", title: "Tu opinion", elements: [] }],
  }
);

const handleSave = async (finalSchema: SurveySchema) => {
  const payload = {
    title: titleInput.value || finalSchema.title,
    description: descriptionInput.value || finalSchema.description || "",
    endDate: endDate.value ? endDate.value.toISOString() : new Date().toISOString(),
    survey: finalSchema as unknown as Record<string, unknown>,
  };

  try {
    if (isEdit && props.item?.id) {
      await surveysService.update(props.item.id, payload);
    } else {
      await surveysService.create(payload);
    }
    emit("created");
  } catch (error) {
    console.error("Failed to save survey", error);
  }
};

watch([titleInput, descriptionInput], ([newTitle, newDesc]) => {
  if (!creator?.schema) return;
  creator.schema.title = newTitle;
  creator.schema.description = newDesc;
  if (creator.root) {
    const titleField = creator.root.querySelector<HTMLInputElement>('[data-field="schema-title"]');
    if (titleField && document.activeElement !== titleField) titleField.value = newTitle;
    const heading = creator.root.querySelector<HTMLElement>(".creator-canvas-heading h1");
    if (heading) heading.textContent = newTitle || "Nueva encuesta";
  }
  creator.persist?.();
  if (creator.getSchema) creator.emit?.("change", creator.getSchema());
});

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded) { resolve(); return; }
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error(`Not found ${src}`));
    document.body.appendChild(script);
  });
};

const loadAura = async (): Promise<void> => {
  if (!document.querySelector('link[data-aura="creator"]')) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "/aura-survey/css/aura-survey-creator.css"; l.dataset.aura = "creator"; document.head.appendChild(l);
    const l2 = document.createElement("link"); l2.rel = "stylesheet"; l2.href = "/aura-survey/css/aura-survey.css"; l2.dataset.aura = "survey"; document.head.appendChild(l2);
  }
  await loadScript("/aura-survey/js/aura-survey.js");
  await loadScript("/aura-survey/js/aura-survey-creator.js");
  if (!mount.value) return;
  localStorage.removeItem("aura-demo-draft");
  localStorage.removeItem("aura-survey-draft");

  creator = new window.AuraSurveyCreator(mount.value, {
    schema: schema.value,
    storageKey: undefined,
    onSave: (s) => { void handleSave(s); },
  });

  creator.on("change", (nextSchema) => {
    schema.value = nextSchema;
    if (nextSchema.title !== titleInput.value) titleInput.value = nextSchema.title;
    if ((nextSchema.description ?? "") !== descriptionInput.value) descriptionInput.value = nextSchema.description ?? "";
  });
};

onMounted(() => { void loadAura(); });
onUnmounted(() => { creator?.destroy?.(); });
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="0" border class="rounded-lg">
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="7" md="6">
              <v-label class="mb-2 font-weight-bold">Título</v-label>
              <v-text-field v-model="titleInput" variant="outlined" density="compact" placeholder="Ej: Encuesta de satisfacción" hide-details />
            </v-col>
            <v-col cols="12" sm="5" md="6">
              <v-label class="mb-2 font-weight-bold">Fecha cierre</v-label>
              <v-date-input v-model="endDate" variant="outlined" density="compact" />
            </v-col>
            <v-col cols="12">
              <v-label class="mb-2 font-weight-bold">Descripción</v-label>
              <v-textarea v-model="descriptionInput" variant="outlined" density="compact" placeholder="Describe el objetivo de la encuesta" rows="3" hide-details />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-card elevation="0" border class="rounded-lg">
        <v-card-text class="pa-2">
          <div ref="mount" style="min-height: 650px" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
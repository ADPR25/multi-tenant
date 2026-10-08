<script setup lang="ts">
defineOptions({
  name: "DocsCreateView",
});

import { ref, onMounted } from "vue";
import {
  documentsService,
  foldersService,
  documentCategoriesService,
  documentTypesService,
} from "@/services";
import type { DocumentPayload } from "@/services/logic/document/documents.service";
import { Save, X } from "lucide-vue-next";

interface DocFormItem {
  id?: string;
  title?: string;
  description?: string;
  folderId?: string;
  categoryId?: string;
  typeId?: string;
  content?: string;
  expiresAt?: string;
}

interface SelectItem {
  id: string;
  name: string;
}

type SelectResponse = { data?: SelectItem[] } | SelectItem[];

const props = defineProps<{ item?: DocFormItem | null }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);
const folders = ref<SelectItem[]>([]);
const categories = ref<SelectItem[]>([]);
const types = ref<SelectItem[]>([]);

const form = ref({
  title: props.item?.title || "",
  description: props.item?.description || "",
  folderId: props.item?.folderId || "",
  categoryId: props.item?.categoryId || "",
  typeId: props.item?.typeId || "",
  content: props.item?.content || "",
  expiresAt: props.item?.expiresAt ? props.item.expiresAt.substring(0, 10) : "",
});

async function submit() {
  const result = await formRef.value?.validate();
  if (!result?.valid) return;
  saving.value = true;
  try {
    const payload: DocumentPayload = {
      ...form.value,
      description: form.value.description || undefined,
      content: form.value.content || undefined,
      expiresAt: form.value.expiresAt
        ? new Date(form.value.expiresAt).toISOString()
        : undefined,
    };
    if (props.item?.id) await documentsService.update(props.item.id, payload);
    else await documentsService.create(payload);
    emit("created");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al guardar";
    alert(msg);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const [f, c, t] = await Promise.all<SelectResponse>([
    foldersService
      .list({ limit: "all", find: "list" })
      .catch(() => [] as SelectItem[]),
    documentCategoriesService
      .list({ limit: "all" })
      .catch(() => [] as SelectItem[]),
    documentTypesService.list({ limit: "all" }).catch(() => [] as SelectItem[]),
  ]);

  const extract = (res: SelectResponse): SelectItem[] => {
    if (Array.isArray(res)) return res;
    return res.data ?? [];
  };

  folders.value = extract(f);
  categories.value = extract(c);
  types.value = extract(t);
});
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="8">
          <v-label>Título *</v-label>
          <v-text-field
            v-model="form.title"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Expira</v-label>
          <v-date-input
            v-model="form.expiresAt"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Carpeta *</v-label>
          <v-autocomplete
            v-model="form.folderId"
            :items="folders"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Categoría *</v-label>
          <v-autocomplete
            v-model="form.categoryId"
            :items="categories"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Tipo *</v-label>
          <v-autocomplete
            v-model="form.typeId"
            :items="types"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Descripción</v-label>
          <v-textarea
            v-model="form.description"
            rows="2"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Contenido</v-label>
          <v-textarea
            v-model="form.content"
            rows="4"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"
          ><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        >
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit">
          <Save class="h-4 w-4 mr-2" />{{ props.item ? "Actualizar" : "Crear" }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

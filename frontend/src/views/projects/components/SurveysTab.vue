<script setup lang="ts">
import { ref, onMounted } from "vue";
import { surveysService } from "@/services/logic/projects/surveys.service";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({
  name: "ProjectSurveysTab",
});

interface ProjectSurvey {
  id: string;
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  estado: string;
  isAnonima: boolean;
}

interface ListResponse<T> {
  data?: T[];
}

interface SurveyForm {
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  isAnonima: boolean;
}

const props = defineProps<{
  projectId: string;
}>();

const surveys = ref<ProjectSurvey[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<ProjectSurvey | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const saving = ref(false);

const form = ref<SurveyForm>({
  titulo: "",
  descripcion: "",
  tipo: "EVALUACION",
  estado: "BORRADOR",
  isAnonima: false,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await surveysService.listByProject(props.projectId);
    const data = res as ListResponse<ProjectSurvey> | ProjectSurvey[];
    surveys.value = Array.isArray(data) ? data : data.data || [];
  } catch {
    surveys.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = { titulo: "", descripcion: "", tipo: "EVALUACION", estado: "BORRADOR", isAnonima: false };
  showForm.value = true;
}

function openEdit(s: ProjectSurvey): void {
  editing.value = s;
  form.value = {
    titulo: s.titulo,
    descripcion: s.descripcion || "",
    tipo: s.tipo,
    estado: s.estado,
    isAnonima: !!s.isAnonima,
  };
  showForm.value = true;
}

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload = { ...form.value, projectId: props.projectId };
    if (editing.value) {
      await surveysService.update(editing.value.id, payload);
    } else {
      await surveysService.create(payload);
    }
    showForm.value = false;
    await load();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar encuesta";
    alert(message);
  } finally {
    saving.value = false;
  }
}

async function removeSurvey(s: ProjectSurvey): Promise<void> {
  if (!confirm(`Eliminar ${s.titulo}?`)) return;
  await surveysService.remove(s.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Encuestas</h3>
      <v-btn color="primary" size="small" @click="openCreate"><Plus class="h-4 w-4 mr-1"/> Nueva Encuesta</v-btn>
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div v-for="s in surveys" :key="s.id" class="border rounded-xl p-4 flex justify-between dark:border-gray-700">
        <div>
          <div class="font-medium">{{ s.titulo }} <v-chip size="x-small" class="ml-2">{{ s.tipo }} - {{ s.estado }}</v-chip></div>
          <div class="text-sm text-gray-500">{{ s.descripcion || '' }}</div>
        </div>
        <div class="flex gap-1">
          <v-btn icon size="x-small" variant="text" color="warning" @click="openEdit(s)"><Pencil class="h-4 w-4"/></v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="removeSurvey(s)"><Trash2 class="h-4 w-4"/></v-btn>
        </div>
      </div>
      <div v-if="!surveys.length" class="text-center text-gray-400 py-6">Sin encuestas</div>
    </div>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title>{{ editing ? 'Editar' : 'Crear' }} Encuesta</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12"><v-label>Título *</v-label><v-text-field v-model="form.titulo" variant="outlined" density="compact" :rules="[(v: string) => !!v || 'Req']"/></v-col>
              <v-col cols="12"><v-label>Descripción</v-label><v-textarea v-model="form.descripcion" variant="outlined" density="compact" rows="2"/></v-col>
              <v-col cols="12" md="6"><v-label>Tipo</v-label><v-select v-model="form.tipo" :items="['EVALUACION','SATISFACCION','CLIMA','OTRO']" variant="outlined" density="compact"/></v-col>
              <v-col cols="12" md="6"><v-label>Estado</v-label><v-select v-model="form.estado" :items="['BORRADOR','ACTIVA','CERRADA']" variant="outlined" density="compact"/></v-col>
              <v-col cols="12"><v-checkbox v-model="form.isAnonima" label="Es anónima" density="compact"/></v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions><v-spacer/><v-btn variant="text" @click="showForm=false">Cancelar</v-btn><v-btn color="primary" :loading="saving" @click="submit"><Save class="h-4 w-4 mr-1"/> Guardar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
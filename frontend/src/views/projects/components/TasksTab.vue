<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { tasksService, type Task } from "@/services";
import { activitiesService, type Activity } from "@/services";
import { phasesService, type Phase } from "@/services";
import { surveysService, type Survey } from "@/services";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({ name: "ProjectTasksTab" });

const estados = [
  { title: "Por hacer", value: "TODO" },
  { title: "En progreso", value: "DOING" },
  { title: "Hecho", value: "DONE" },
  { title: "Bloqueado", value: "BLOCKED" },
];

const prioridades = [
  { title: "Baja", value: "LOW" },
  { title: "Media", value: "MEDIUM" },
  { title: "Alta", value: "HIGH" },
  { title: "Urgente", value: "URGENT" },
];

interface TaskForm {
  phaseId: string;
  activityId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  estimatedHours: string;
  sortOrder: number;
  surveyId: string;
}

const props = defineProps<{ projectId: string }>();

const tasks = ref<Task[]>([]);
const assignSurvey = ref(false);
const activities = ref<Activity[]>([]);
const phases = ref<Phase[]>([]);
const surveys = ref<Survey[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<Task | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<TaskForm>({
  phaseId: "",
  activityId: "",
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  estimatedHours: "",
  sortOrder: 0,
  surveyId: "",
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [tRes, aRes, pRes, sRes] = await Promise.all([
      tasksService.listByProject(props.projectId),
      activitiesService.listByProject(props.projectId),
      phasesService.listByProject(props.projectId),
      surveysService.list({ find: "select" }),
    ]);

    tasks.value = Array.isArray(tRes)
      ? tRes
      : ((tRes as { data?: Task[] }).data ?? []);
    activities.value = Array.isArray(aRes)
      ? aRes
      : ((aRes as { data?: Activity[] }).data ?? []);
    phases.value = Array.isArray(pRes)
      ? pRes
      : ((pRes as { data?: Phase[] }).data ?? []);
    surveys.value = Array.isArray(sRes)
      ? sRes
      : ((sRes as { data?: Survey[] }).data ?? []);
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    phaseId: "",
    activityId: "",
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    estimatedHours: "",
    surveyId: "",
    sortOrder: tasks.value.length,
  };
  showForm.value = true;
}

function openEdit(t: Task): void {
  assignSurvey.value = !!t.surveyId;
  editing.value = t;
  form.value = {
    phaseId: t.phaseId || "",
    activityId: t.activityId,
    title: t.title,
    description: t.description || "",
    status: t.status,
    priority: t.priority,
    surveyId: t.surveyId || "",
    dueDate: t.dueDate ? t.dueDate.substring(0, 10) : "",
    estimatedHours: t.estimatedHours || "",
    sortOrder: t.sortOrder,
  };
  showForm.value = true;
}

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload = {
      projectId: props.projectId,
      phaseId: form.value.phaseId || null,
      activityId: form.value.activityId,
      title: form.value.title,
      description: form.value.description || null,
      status: form.value.status,
      priority: form.value.priority,
      dueDate: form.value.dueDate || null,
      estimatedHours: form.value.estimatedHours || null,
      sortOrder: Number(form.value.sortOrder),
      ...(form.value.surveyId !== ""
        ? { surveyId: form.value.surveyId }
        : null),
    };
    if (editing.value) {
      await tasksService.update(editing.value.id, payload);
    } else {
      await tasksService.create(payload);
    }
    showForm.value = false;
    await load();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al guardar tarea";
    alert(message);
  } finally {
    saving.value = false;
  }
}

async function removeTask(t: Task): Promise<void> {
  if (!confirm(`Eliminar ${t.title}?`)) return;
  await tasksService.remove(t.id);
  await load();
}

watch(
  () => form.value.activityId,
  (activityId) => {
    const activity = activities.value.find((a) => a.id === activityId);
    if (activity) {
      form.value.phaseId = activity.phaseId || "";
    }
  },
);

onMounted(load);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Tareas</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nueva Tarea</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div
        v-for="t in tasks"
        :key="t.id"
        class="border rounded-xl p-4 flex justify-between dark:border-gray-700"
      >
        <div>
          <div class="font-medium">
            {{ t.title }}
            <v-chip
              size="x-small"
              :color="
                t.status === 'DONE'
                  ? 'success'
                  : t.status === 'DOING'
                    ? 'primary'
                    : 'default'
              "
              class="ml-2"
              >{{ t.status }}</v-chip
            >
            <v-chip
              size="x-small"
              :color="
                t.priority === 'URGENT'
                  ? 'error'
                  : t.priority === 'HIGH'
                    ? 'warning'
                    : 'default'
              "
              class="ml-1"
              >{{ t.priority }}</v-chip
            >
          </div>
          <div class="text-sm text-gray-500">
            {{ t.description || "" }} | Actividad:
            {{ activities.find((a) => a.id === t.activityId)?.name || "-" }} |
            Vence: {{ t.dueDate || "-" }}
          </div>
        </div>
        <div class="flex gap-1">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="warning"
            @click="openEdit(t)"
            ><Pencil class="h-4 w-4"
          /></v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="removeTask(t)"
            ><Trash2 class="h-4 w-4"
          /></v-btn>
        </div>
      </div>
      <div v-if="!tasks.length" class="text-center text-gray-400 py-6">
        Sin tareas
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="700">
      <v-card>
        <v-card-title>{{ editing ? "Editar" : "Crear" }} Tarea</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="6"
                ><v-label>Actividad *</v-label
                ><v-autocomplete
                  v-model="form.activityId"
                  :items="activities"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12" md="6"
                ><v-label>Fase</v-label
                ><v-autocomplete
                  readonly
                  v-model="form.phaseId"
                  :items="phases"
                  item-title="name"
                  item-value="id"
                  clearable
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12"
                ><v-label>Título *</v-label
                ><v-text-field
                  v-model="form.title"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12"
                ><v-label>Descripción</v-label
                ><v-textarea
                  v-model="form.description"
                  variant="outlined"
                  density="compact"
                  rows="2"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Estado</v-label
                ><v-select
                  v-model="form.status"
                  :items="estados"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Prioridad</v-label
                ><v-select
                  v-model="form.priority"
                  :items="prioridades"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Vencimiento</v-label
                ><v-date-input
                  v-model="form.dueDate"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Horas Est.</v-label
                ><v-text-field
                  v-model="form.estimatedHours"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12">
                <v-switch
                  v-model="assignSurvey"
                  label="Asignar encuesta"
                  color="primary"
                  hide-details
                />
              </v-col>
              <v-col v-if="assignSurvey" cols="12">
                <v-label>Nombre encuesta</v-label>
                <v-autocomplete
                  v-model="form.surveyId"
                  :items="surveys"
                  :item-title="(item: Survey) => `${item.title} (${item.code})`"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions
          ><v-spacer /><v-btn variant="text" @click="showForm = false"
            >Cancelar</v-btn
          ><v-btn color="primary" :loading="saving" @click="submit"
            ><Save class="h-4 w-4 mr-1" /> Guardar</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </div>
</template>

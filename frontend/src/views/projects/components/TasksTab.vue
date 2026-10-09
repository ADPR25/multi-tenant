<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { tasksService } from "@/services/logic/projects/tasks.service";
import { activitiesService } from "@/services/logic/projects/activities.service";
import { phasesService } from "@/services/logic/projects/phases.service";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({
  name: "ProjectTasksTab",
});

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

interface ProjectTask {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  phaseId?: string | null;
  activityId: string;
  fechaVencimiento?: string | null;
  horasEstimadas?: string | null;
  orden: number;
}

interface ProjectActivity {
  id: string;
  nombre: string;
  phaseId?: string | null;
  faseId?: string | null;
}

interface ProjectPhase {
  id: string;
  nombre: string;
}

interface ListResponse<T> {
  data?: T[];
}

interface TaskForm {
  phaseId: string;
  activityId: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fechaVencimiento: string;
  horasEstimadas: string;
  orden: number;
}

const props = defineProps<{
  projectId: string;
}>();

const tasks = ref<ProjectTask[]>([]);
const activities = ref<ProjectActivity[]>([]);
const phases = ref<ProjectPhase[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<ProjectTask | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<TaskForm>({
  phaseId: "",
  activityId: "",
  titulo: "",
  descripcion: "",
  estado: "TODO",
  prioridad: "MEDIUM",
  fechaVencimiento: "",
  horasEstimadas: "",
  orden: 0,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [t, a, p] = await Promise.all([
      tasksService.listByProject(props.projectId),
      activitiesService.listByProject(props.projectId),
      phasesService.listByProject(props.projectId),
    ]);

    const tData = t as ListResponse<ProjectTask> | ProjectTask[];
    tasks.value = Array.isArray(tData) ? tData : tData.data || [];

    const aData = a as ListResponse<ProjectActivity> | ProjectActivity[];
    activities.value = Array.isArray(aData) ? aData : aData.data || [];

    const pData = p as ListResponse<ProjectPhase> | ProjectPhase[];
    phases.value = Array.isArray(pData) ? pData : pData.data || [];
  } catch {
    // no bloquea UI si falla
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    phaseId: "",
    activityId: "",
    titulo: "",
    descripcion: "",
    estado: "TODO",
    prioridad: "MEDIUM",
    fechaVencimiento: "",
    horasEstimadas: "",
    orden: tasks.value.length,
  };
  showForm.value = true;
}

function openEdit(t: ProjectTask): void {
  editing.value = t;
  form.value = {
    phaseId: t.phaseId || "",
    activityId: t.activityId,
    titulo: t.titulo,
    descripcion: t.descripcion || "",
    estado: t.estado,
    prioridad: t.prioridad,
    fechaVencimiento: t.fechaVencimiento
      ? t.fechaVencimiento.substring(0, 10)
      : "",
    horasEstimadas: t.horasEstimadas || "",
    orden: t.orden,
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
      ...form.value,
      projectId: props.projectId,
      phaseId: form.value.phaseId || null,
      fechaVencimiento: form.value.fechaVencimiento || null,
      horasEstimadas: form.value.horasEstimadas || null,
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

async function removeTask(t: ProjectTask): Promise<void> {
  if (!confirm(`Eliminar ${t.titulo}?`)) return;
  await tasksService.remove(t.id);
  await load();
}

watch(
  () => form.value.activityId,
  (activityId) => {
    const activity = activities.value.find((a) => a.id === activityId) as
      (ProjectActivity & { phaseId?: string; faseId?: string }) | undefined;
    form.value.phaseId = activity?.phaseId ?? activity?.faseId ?? "";
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
            {{ t.titulo }}
            <v-chip
              size="x-small"
              :color="
                t.estado === 'DONE'
                  ? 'success'
                  : t.estado === 'DOING'
                    ? 'primary'
                    : 'default'
              "
              class="ml-2"
              >{{ t.estado }}</v-chip
            >
            <v-chip
              size="x-small"
              :color="
                t.prioridad === 'URGENT'
                  ? 'error'
                  : t.prioridad === 'HIGH'
                    ? 'warning'
                    : 'default'
              "
              class="ml-1"
              >{{ t.prioridad }}</v-chip
            >
          </div>
          <div class="text-sm text-gray-500">
            {{ t.descripcion || "" }} | Actividad:
            {{ activities.find((a) => a.id === t.activityId)?.nombre || "-" }} |
            Vence: {{ t.fechaVencimiento || "-" }}
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
                ><v-select
                  v-model="form.activityId"
                  :items="activities"
                  item-title="nombre"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12" md="6"
                ><v-label>Fase</v-label
                ><v-select
                  readonly
                  v-model="form.phaseId"
                  :items="phases"
                  item-title="nombre"
                  item-value="id"
                  clearable
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12"
                ><v-label>Título *</v-label
                ><v-text-field
                  v-model="form.titulo"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12"
                ><v-label>Descripción</v-label
                ><v-textarea
                  v-model="form.descripcion"
                  variant="outlined"
                  density="compact"
                  rows="2"
              /></v-col>
              <v-col cols="12" md="3">
                <v-label>Estado</v-label>
                <v-select
                  v-model="form.estado"
                  :items="estados"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-label>Prioridad</v-label>
                <v-select
                  v-model="form.prioridad"
                  :items="prioridades"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="3"
                ><v-label>Vencimiento</v-label
                ><v-date-input
                  v-model="form.fechaVencimiento"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Horas Est.</v-label
                ><v-text-field
                  v-model="form.horasEstimadas"
                  variant="outlined"
                  density="compact"
              /></v-col>
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

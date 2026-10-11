<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  activitiesService,
  type Activity,
} from "@/services/logic/projects/activities.service";
import {
  phasesService,
  type Phase,
} from "@/services/logic/projects/phases.service";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({ name: "ProjectActivitiesTab" });

interface ActivityForm {
  phaseId: string;
  name: string;
  description: string;
  sortOrder: number;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
}

const props = defineProps<{ projectId: string }>();

const activities = ref<Activity[]>([]);
const phases = ref<Phase[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<Activity | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<ActivityForm>({
  phaseId: "",
  name: "",
  description: "",
  sortOrder: 0,
  status: "PLANNING",
  startDate: "",
  endDate: "",
  progress: 0,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [aRes, pRes] = await Promise.all([
      activitiesService.listByProject(props.projectId),
      phasesService.listByProject(props.projectId),
    ]);

    activities.value = Array.isArray(aRes)
      ? aRes
      : ((aRes as { data?: Activity[] }).data ?? []);
    phases.value = Array.isArray(pRes)
      ? pRes
      : ((pRes as { data?: Phase[] }).data ?? []);
  } catch {
    // no bloquea UI
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    phaseId: phases.value[0]?.id || "",
    name: "",
    description: "",
    sortOrder: activities.value.length,
    status: "PLANNING",
    startDate: "",
    endDate: "",
    progress: 0,
  };
  showForm.value = true;
}

function openEdit(it: Activity): void {
  editing.value = it;
  form.value = {
    phaseId: it.phaseId,
    name: it.name,
    description: it.description || "",
    sortOrder: it.sortOrder,
    status: it.status,
    startDate: it.startDate ? it.startDate.substring(0, 10) : "",
    endDate: it.endDate ? it.endDate.substring(0, 10) : "",
    progress: it.progress ?? 0,
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
      phaseId: form.value.phaseId,
      name: form.value.name,
      description: form.value.description || null,
      sortOrder: Number(form.value.sortOrder),
      status: form.value.status,
      startDate: form.value.startDate || null,
      endDate: form.value.endDate || null,
      progress: Number(form.value.progress),
    };
    if (editing.value) {
      await activitiesService.update(editing.value.id, payload);
    } else {
      await activitiesService.create(payload);
    }
    showForm.value = false;
    await load();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al guardar actividad";
    alert(message);
  } finally {
    saving.value = false;
  }
}

async function removeActivity(it: Activity): Promise<void> {
  if (!confirm(`Eliminar ${it.name}?`)) return;
  await activitiesService.remove(it.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Actividades</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nueva Actividad</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div
        v-for="a in activities"
        :key="a.id"
        class="border rounded-xl p-4 flex justify-between dark:border-gray-700"
      >
        <div>
          <div class="font-medium">
            {{ a.name }}
            <span class="text-xs text-gray-500"
              >[Fase:
              {{
                phases.find((p) => p.id === a.phaseId)?.name || a.phaseId
              }}]</span
            >
          </div>
          <div class="text-sm text-gray-500">
            {{ a.description || "" }} - {{ a.status }} - {{ a.progress }}%
          </div>
        </div>
        <div class="flex gap-1">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="warning"
            @click="openEdit(a)"
            ><Pencil class="h-4 w-4"
          /></v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="removeActivity(a)"
            ><Trash2 class="h-4 w-4"
          /></v-btn>
        </div>
      </div>
      <div v-if="!activities.length" class="text-center text-gray-400 py-6">
        Sin actividades
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title
          >{{ editing ? "Editar" : "Crear" }} Actividad</v-card-title
        >
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12"
                ><v-label>Fase *</v-label
                ><v-select
                  v-model="form.phaseId"
                  :items="phases"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12"
                ><v-label>Nombre *</v-label
                ><v-text-field
                  v-model="form.name"
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
              <v-col cols="12" md="4"
                ><v-label>Orden</v-label
                ><v-text-field
                  v-model="form.sortOrder"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-label>Avance %</v-label
                ><v-text-field
                  v-model="form.progress"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-label>Estado</v-label
                ><v-select
                  v-model="form.status"
                  :items="[
                    'PLANNING',
                    'IN_PROGRESS',
                    'PAUSED',
                    'COMPLETED',
                    'CANCELLED',
                  ]"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="6"
                ><v-label>Inicio</v-label
                ><v-date-input
                  v-model="form.startDate"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="6"
                ><v-label>Fin</v-label
                ><v-date-input
                  v-model="form.endDate"
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

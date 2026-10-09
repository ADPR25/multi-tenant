<script setup lang="ts">
import { ref, onMounted } from "vue";
import { activitiesService } from "@/services/logic/projects/activities.service";
import { phasesService } from "@/services/logic/projects/phases.service";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({
  name: "ProjectActivitiesTab",
});

interface ProjectActivity {
  id: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  estado: string;
  phaseId: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

interface ProjectPhase {
  id: string;
  nombre: string;
}

interface ListResponse<T> {
  data?: T[];
}

interface ActivityForm {
  phaseId: string;
  nombre: string;
  descripcion: string;
  orden: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

const props = defineProps<{
  projectId: string;
}>();

const activities = ref<ProjectActivity[]>([]);
const phases = ref<ProjectPhase[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<ProjectActivity | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<ActivityForm>({
  phaseId: "",
  nombre: "",
  descripcion: "",
  orden: 0,
  estado: "EN_PLANEACION",
  fechaInicio: "",
  fechaFin: "",
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [a, p] = await Promise.all([
      activitiesService.listByProject(props.projectId),
      phasesService.listByProject(props.projectId),
    ]);

    const aData = a as ListResponse<ProjectActivity> | ProjectActivity[];
    activities.value = Array.isArray(aData) ? aData : aData.data || [];

    const pData = p as ListResponse<ProjectPhase> | ProjectPhase[];
    phases.value = Array.isArray(pData) ? pData : pData.data || [];
  } catch {
    // no bloquea UI
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    phaseId: "",
    nombre: "",
    descripcion: "",
    orden: activities.value.length,
    estado: "EN_PLANEACION",
    fechaInicio: "",
    fechaFin: "",
  };
  showForm.value = true;
}

function openEdit(it: ProjectActivity): void {
  editing.value = it;
  form.value = {
    phaseId: it.phaseId,
    nombre: it.nombre,
    descripcion: it.descripcion || "",
    orden: it.orden,
    estado: it.estado,
    fechaInicio: it.fechaInicio ? it.fechaInicio.substring(0, 10) : "",
    fechaFin: it.fechaFin ? it.fechaFin.substring(0, 10) : "",
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
      fechaInicio: form.value.fechaInicio || null,
      fechaFin: form.value.fechaFin || null,
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

async function removeActivity(it: ProjectActivity): Promise<void> {
  if (!confirm(`Eliminar ${it.nombre}?`)) return;
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
            {{ a.nombre }}
            <span class="text-xs text-gray-500"
              >[Fase:
              {{
                phases.find((p) => p.id === a.phaseId)?.nombre || a.phaseId
              }}]</span
            >
          </div>
          <div class="text-sm text-gray-500">
            {{ a.descripcion || "" }} - {{ a.estado }}
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
                  item-title="nombre"
                  item-value="id"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12"
                ><v-label>Nombre *</v-label
                ><v-text-field
                  v-model="form.nombre"
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
              <v-col cols="12" md="4"
                ><v-label>Orden</v-label
                ><v-text-field
                  v-model="form.orden"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-label>Estado</v-label
                ><v-select
                  v-model="form.estado"
                  :items="[
                    'EN_PLANEACION',
                    'EN_EJECUCION',
                    'PAUSADO',
                    'FINALIZADO',
                    'CANCELADO',
                  ]"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-label>Inicio</v-label
                ><v-date-input
                  v-model="form.fechaInicio"
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

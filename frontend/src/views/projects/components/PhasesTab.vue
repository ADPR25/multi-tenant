<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  phasesService,
  type Phase,
} from "@/services/logic/projects/phases.service";
import { Save, Plus, Pencil, Trash2 } from "lucide-vue-next";

defineOptions({ name: "ProjectPhasesTab" });

interface PhaseForm {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  status: string;
  startDate: string;
  endDate: string;
  budget: string;
  progress: number;
}

const props = defineProps<{ projectId: string }>();

const phases = ref<Phase[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<Phase | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<PhaseForm>({
  code: "",
  name: "",
  description: "",
  sortOrder: 0,
  status: "PLANNING",
  startDate: "",
  endDate: "",
  budget: "",
  progress: 0,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const response = await phasesService.listByProject(props.projectId);
    if (Array.isArray(response)) {
      phases.value = response;
    } else {
      const wrapped = response as { data?: Phase[] };
      phases.value = wrapped.data ?? [];
    }
  } catch {
    phases.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    code: "",
    name: "",
    description: "",
    sortOrder: phases.value.length,
    status: "PLANNING",
    startDate: "",
    endDate: "",
    budget: "",
    progress: 0,
  };
  showForm.value = true;
}

function openEdit(p: Phase): void {
  editing.value = p;
  form.value = {
    code: p.code,
    name: p.name,
    description: p.description || "",
    sortOrder: p.sortOrder,
    status: p.status,
    startDate: p.startDate ? p.startDate.substring(0, 10) : "",
    endDate: p.endDate ? p.endDate.substring(0, 10) : "",
    budget: p.budget || "",
    progress: p.progress ?? 0,
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
      code: form.value.code,
      name: form.value.name,
      description: form.value.description || null,
      sortOrder: Number(form.value.sortOrder),
      status: form.value.status,
      startDate: form.value.startDate || null,
      endDate: form.value.endDate || null,
      budget: form.value.budget || null,
      progress: Number(form.value.progress),
    };
    if (editing.value) {
      await phasesService.update(editing.value.id, payload);
    } else {
      await phasesService.create(payload);
    }
    showForm.value = false;
    await load();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al guardar fase";
    alert(message);
  } finally {
    saving.value = false;
  }
}

async function removePhase(p: Phase): Promise<void> {
  if (!confirm(`Eliminar fase ${p.name}?`)) return;
  await phasesService.remove(p.id);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Fases del Proyecto</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nueva Fase</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="grid gap-3">
      <div
        v-for="ph in phases"
        :key="ph.id"
        class="border rounded-xl p-4 flex justify-between items-center dark:border-gray-700"
      >
        <div>
          <div class="font-medium">
            {{ ph.sortOrder }}. {{ ph.code }} - {{ ph.name }}
          </div>
          <div class="text-sm text-gray-500">
            {{ ph.description || "Sin descripción" }} | {{ ph.status }} |
            Avance: {{ ph.progress }}%
          </div>
        </div>
        <div class="flex gap-1">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="warning"
            @click="openEdit(ph)"
            ><Pencil class="h-4 w-4"
          /></v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="removePhase(ph)"
            ><Trash2 class="h-4 w-4"
          /></v-btn>
        </div>
      </div>
      <div v-if="!phases.length" class="text-center text-gray-400 py-6">
        No hay fases. Crea la primera.
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="700">
      <v-card>
        <v-card-title>{{ editing ? "Editar" : "Crear" }} Fase</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="4"
                ><v-label>Código *</v-label
                ><v-text-field
                  v-model="form.code"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12" md="8"
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
              <v-col cols="12" md="3"
                ><v-label>Orden</v-label
                ><v-text-field
                  v-model="form.sortOrder"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Avance %</v-label
                ><v-text-field
                  v-model="form.progress"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
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
              <v-col cols="12" md="3"
                ><v-label>Presupuesto</v-label
                ><v-text-field
                  v-model="form.budget"
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

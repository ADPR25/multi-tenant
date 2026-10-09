<script setup lang="ts">
import { ref, onMounted } from "vue";
import { phasesService } from "@/services/logic/projects/phases.service";
import { Save, Plus, Pencil, Trash2 } from "lucide-vue-next";

defineOptions({
  name: "ProjectPhasesTab",
});

interface ProjectPhase {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  estado: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  presupuesto?: string | null;
  avance?: number;
}

interface PhaseForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  presupuesto: string;
}

interface ListResponse<T> {
  data?: T[];
}

const props = defineProps<{
  projectId: string;
}>();

const phases = ref<ProjectPhase[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<ProjectPhase | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<PhaseForm>({
  codigo: "",
  nombre: "",
  descripcion: "",
  orden: 0,
  estado: "EN_PLANEACION",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await phasesService.listByProject(props.projectId);
    const list = res as ListResponse<ProjectPhase> | ProjectPhase[];
    phases.value = Array.isArray(list) ? list : list.data || [];
  } catch {
    phases.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editing.value = null;
  form.value = {
    codigo: "",
    nombre: "",
    descripcion: "",
    orden: phases.value.length,
    estado: "EN_PLANEACION",
    fechaInicio: "",
    fechaFin: "",
    presupuesto: "",
  };
  showForm.value = true;
}

function openEdit(p: ProjectPhase): void {
  editing.value = p;
  form.value = {
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion || "",
    orden: p.orden,
    estado: p.estado,
    fechaInicio: p.fechaInicio ? p.fechaInicio.substring(0, 10) : "",
    fechaFin: p.fechaFin ? p.fechaFin.substring(0, 10) : "",
    presupuesto: p.presupuesto || "",
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
      presupuesto: form.value.presupuesto || null,
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

async function removePhase(p: ProjectPhase): Promise<void> {
  if (!confirm(`Eliminar fase ${p.nombre}?`)) return;
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
            {{ ph.orden }}. {{ ph.codigo }} - {{ ph.nombre }}
          </div>
          <div class="text-sm text-gray-500">
            {{ ph.descripcion || "Sin descripción" }} | {{ ph.estado }} |
            Avance: {{ ph.avance ?? 0 }}%
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
                  v-model="form.codigo"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
              /></v-col>
              <v-col cols="12" md="8"
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
              <v-col cols="12" md="3"
                ><v-label>Orden</v-label
                ><v-text-field
                  v-model="form.orden"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
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
              <v-col cols="12" md="3"
                ><v-label>Inicio</v-label
                ><v-date-input
                  v-model="form.fechaInicio"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12" md="3"
                ><v-label>Fin</v-label
                ><v-date-input
                  v-model="form.fechaFin"
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

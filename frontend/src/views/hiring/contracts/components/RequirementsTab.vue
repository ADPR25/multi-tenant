<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  requirementsService,
  type Requirement,
} from "@/services/logic/hiring/hiring-extras.service";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Circle,
  CheckCircle2,
} from "lucide-vue-next";

defineOptions({ name: "ContractRequirementsTab" });

type FormRef = { validate: () => Promise<{ valid: boolean }> } | null;

const props = defineProps<{ contractId: string }>();
const items = ref<Requirement[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<Requirement | null>(null);
const formRef = ref<FormRef>(null);
const saving = ref(false);
const showDelete = ref(false);
const toDelete = ref<Requirement | null>(null);
const deleting = ref(false);
const form = ref({ name: "", isRequired: false, observation: "" });

async function load() {
  loading.value = true;
  try {
    items.value = await requirementsService.listByContract(props.contractId);
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  editing.value = null;
  form.value = { name: "", isRequired: false, observation: "" };
  showForm.value = true;
}
function openEdit(r: Requirement) {
  editing.value = r;
  form.value = {
    name: r.name,
    isRequired: r.isRequired,
    observation: r.observation || "",
  };
  showForm.value = true;
}
async function submit() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (editing.value) await requirementsService.remove(editing.value.id);
    await requirementsService.create({
      contractId: props.contractId,
      name: form.value.name,
      isRequired: form.value.isRequired,
      observation: form.value.observation || undefined,
    });
    showForm.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
function confirmDelete(r: Requirement) {
  toDelete.value = r;
  showDelete.value = true;
}
async function removeReq() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await requirementsService.remove(toDelete.value.id);
    showDelete.value = false;
    await load();
  } finally {
    deleting.value = false;
  }
}
async function toggle(r: Requirement) {
  await requirementsService.toggle(r.id);
  await load();
}
onMounted(load);
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Requisitos</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nuevo Requisito</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div
        v-for="r in items"
        :key="r.id"
        class="border rounded-xl p-4 flex justify-between items-center dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <v-btn icon size="x-small" variant="text" @click="toggle(r)"
            ><CheckCircle2
              v-if="r.isDelivered"
              class="h-5 w-5 text-green-600" /><Circle
              v-else
              class="h-5 w-5 text-gray-400"
          /></v-btn>
          <div>
            <div class="font-medium">
              {{ r.name }}
              <span v-if="r.isRequired" class="text-xs text-red-500 font-bold"
                >*obligatorio</span
              >
            </div>
            <div class="text-sm text-gray-500">
              {{ r.observation || "Sin observación" }} -
              {{ r.isDelivered ? "Entregado" : "Pendiente" }}
            </div>
          </div>
        </div>
        <div class="flex gap-1">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="warning"
            @click="openEdit(r)"
            ><Pencil class="h-4 w-4" /></v-btn
          ><v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="confirmDelete(r)"
            ><Trash2 class="h-4 w-4"
          /></v-btn>
        </div>
      </div>
      <div v-if="!items.length" class="text-center text-gray-400 py-6">
        Sin requisitos
      </div>
    </div>
    <v-dialog v-model="showForm" max-width="600"
      ><v-card
        ><v-card-title
          >{{ editing ? "Editar" : "Crear" }} Requisito</v-card-title
        ><v-card-text
          ><v-form ref="formRef"
            ><v-row
              ><v-col cols="12"
                ><v-label>Nombre *</v-label
                ><v-text-field
                  v-model="form.name"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']" /></v-col
              ><v-col cols="12"
                ><v-label>Observación</v-label
                ><v-textarea
                  v-model="form.observation"
                  variant="outlined"
                  density="compact"
                  rows="2" /></v-col
              ><v-col cols="12"
                ><v-switch
                  v-model="form.isRequired"
                  label="Es obligatorio"
                  color="primary"
                  hide-details /></v-col></v-row></v-form></v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn variant="text" @click="showForm = false"
            >Cancelar</v-btn
          ><v-btn color="primary" :loading="saving" @click="submit"
            ><Save class="h-4 w-4 mr-1" /> Guardar</v-btn
          ></v-card-actions
        ></v-card
      ></v-dialog
    >
    <v-dialog v-model="showDelete" max-width="420" persistent
      ><v-card class="rounded-xl"
        ><v-card-text class="text-center pt-8"
          ><h3 class="font-semibold">¿Eliminar requisito?</h3>
          <p class="text-sm text-red-600 mt-3 font-bold">
            "{{ toDelete?.name }}"
          </p></v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn variant="text" @click="showDelete = false"
            >Cancelar</v-btn
          ><v-btn color="error" :loading="deleting" @click="removeReq"
            >Eliminar</v-btn
          ></v-card-actions
        ></v-card
      ></v-dialog
    >
  </div>
</template>

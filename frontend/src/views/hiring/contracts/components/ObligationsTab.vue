<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  obligationsService,
  type Obligation,
} from "@/services/logic/hiring/hiring-extras.service";
import { Plus, Pencil, Trash2, Save } from "lucide-vue-next";

defineOptions({ name: "ContractObligationsTab" });
type FormRef = { validate: () => Promise<{ valid: boolean }> } | null;

const props = defineProps<{ contractId: string }>();
const items = ref<Obligation[]>([]);
const loading = ref(false);
const showForm = ref(false);
const editing = ref<Obligation | null>(null);
const formRef = ref<FormRef>(null);
const saving = ref(false);

const showDelete = ref(false);
const toDelete = ref<Obligation | null>(null);
const deleting = ref(false);

const form = ref({ description: "", sortOrder: 0 });

async function load() {
  loading.value = true;
  try {
    items.value = await obligationsService.listByContract(props.contractId);
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  editing.value = null;
  form.value = { description: "", sortOrder: items.value.length + 1 };
  showForm.value = true;
}
function openEdit(o: Obligation) {
  editing.value = o;
  form.value = { description: o.description, sortOrder: o.sortOrder };
  showForm.value = true;
}
async function submit() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (editing.value)
      await obligationsService.update(editing.value.id, {
        description: form.value.description,
      });
    else
      await obligationsService.create({
        contractId: props.contractId,
        description: form.value.description,
        sortOrder: Number(form.value.sortOrder),
      });
    showForm.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
function confirmDelete(o: Obligation) {
  toDelete.value = o;
  showDelete.value = true;
}
async function removeItem() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await obligationsService.remove(toDelete.value.id);
    showDelete.value = false;
    await load();
  } finally {
    deleting.value = false;
  }
}
onMounted(load);
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Obligaciones</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nueva Obligación</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div
        v-for="o in items"
        :key="o.id"
        class="border rounded-xl p-4 flex justify-between dark:border-gray-700"
      >
        <div>
          <div class="font-medium">
            <span
              class="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded-full mr-2"
              >{{ o.sortOrder }}</span
            >{{ o.description }}
          </div>
        </div>
        <div class="flex gap-1">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="warning"
            @click="openEdit(o)"
            ><Pencil class="h-4 w-4"
          /></v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="confirmDelete(o)"
            ><Trash2 class="h-4 w-4"
          /></v-btn>
        </div>
      </div>
      <div v-if="!items.length" class="text-center text-gray-400 py-6">
        Sin obligaciones
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title
          >{{ editing ? "Editar" : "Crear" }} Obligación</v-card-title
        >
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12" md="3"
                ><v-label>Orden</v-label
                ><v-text-field
                  v-model="form.sortOrder"
                  type="number"
                  variant="outlined"
                  density="compact"
              /></v-col>
              <v-col cols="12"
                ><v-label>Descripción *</v-label
                ><v-textarea
                  v-model="form.description"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  :rules="[(v: string) => !!v || 'Req']"
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

    <Teleport to="body">
      <v-dialog v-model="showDelete" max-width="420" persistent>
        <v-card class="rounded-xl">
          <v-card-text class="text-center pt-8 pb-4">
            <div
              class="mx-auto bg-red-100 dark:bg-red-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4"
            >
              <Trash2 class="h-7 w-7 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold mb-2">¿Eliminar obligación?</h3>
            <p class="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
            <p class="text-sm font-bold text-red-600 mt-3">
              "{{ toDelete?.description }}"
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6"
            ><v-spacer /><v-btn variant="text" @click="showDelete = false"
              >Cancelar</v-btn
            ><v-btn
              color="error"
              variant="flat"
              :loading="deleting"
              @click="removeItem"
              >Eliminar</v-btn
            ></v-card-actions
          >
        </v-card>
      </v-dialog>
    </Teleport>
  </div>
</template>

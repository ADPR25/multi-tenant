<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  addendumsService,
  type Addendum,
} from "@/services/logic/hiring/hiring-extras.service";
import { Plus, Trash2, Save } from "lucide-vue-next";

defineOptions({ name: "ContractAddendumsTab" });

type FormRef = { validate: () => Promise<{ valid: boolean }> } | null;

const props = defineProps<{ contractId: string }>();
const emit = defineEmits<{ (e: "updated"): void }>();

const items = ref<Addendum[]>([]);
const loading = ref(false);
const showForm = ref(false);
const formRef = ref<FormRef>(null);
const saving = ref(false);
const showDelete = ref(false);
const toDelete = ref<Addendum | null>(null);
const deleting = ref(false);

const form = ref({
  type: "ADDITION",
  description: "",
  additionalAmount: "",
  additionalDays: "",
});

async function load() {
  loading.value = true;
  try {
    items.value = await addendumsService.listByContract(props.contractId);
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  form.value = {
    type: "ADDITION",
    description: "",
    additionalAmount: "",
    additionalDays: "",
  };
  showForm.value = true;
}
async function submit() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    await addendumsService.create({
      contractId: props.contractId,
      type: form.value.type,
      description: form.value.description,
      additionalAmount: form.value.additionalAmount || undefined,
      additionalDays: form.value.additionalDays
        ? Number(form.value.additionalDays)
        : undefined,
    });
    showForm.value = false;
    await load();
    emit("updated");
  } finally {
    saving.value = false;
  }
}
function confirmDelete(a: Addendum) {
  toDelete.value = a;
  showDelete.value = true;
}
async function removeItem() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await addendumsService.remove(toDelete.value.id);
    showDelete.value = false;
    toDelete.value = null;
    await load();
    emit("updated");
  } finally {
    deleting.value = false;
  }
}
onMounted(load);
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-lg">Adendas / Otrosí</h3>
      <v-btn color="primary" size="small" @click="openCreate"
        ><Plus class="h-4 w-4 mr-1" /> Nueva Otrosí</v-btn
      >
    </div>
    <div v-if="loading" class="text-center py-6">Cargando...</div>
    <div v-else class="space-y-2">
      <div
        v-for="a in items"
        :key="a.id"
        class="border rounded-xl p-4 flex justify-between dark:border-gray-700"
      >
        <div>
          <div class="font-medium">
            <v-chip
              size="x-small"
              :color="
                a.type === 'ADDITION'
                  ? 'success'
                  : a.type === 'EXTENSION'
                    ? 'info'
                    : 'warning'
              "
              class="mr-2"
              >{{ a.type }}</v-chip
            >{{ a.description }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            <span v-if="a.additionalAmount">+ ${{ a.additionalAmount }}</span>
            <span v-if="a.additionalDays">
              • + {{ a.additionalDays }} días</span
            >
          </div>
        </div>
        <v-btn
          icon
          size="x-small"
          variant="text"
          color="error"
          @click="confirmDelete(a)"
          ><Trash2 class="h-4 w-4"
        /></v-btn>
      </div>
      <div v-if="!items.length" class="text-center text-gray-400 py-6">
        Sin adendas
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title>Crear Otrosí</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row>
              <v-col cols="12">
                <v-label>Tipo *</v-label>
                <v-select
                  v-model="form.type"
                  :items="[
                    { title: 'Adición (monto/valor)', value: 'ADDITION' },
                    { title: 'Prórroga (tiempo)', value: 'EXTENSION' },
                    { title: 'Modificación', value: 'AMENDMENT' },
                  ]"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
                />
              </v-col>
              <v-col cols="12">
                <v-label>Descripción *</v-label>
                <v-textarea
                  v-model="form.description"
                  variant="outlined"
                  density="compact"
                  :rules="[(v: string) => !!v || 'Req']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-label>Monto adicional</v-label>
                <v-text-field
                  v-model="form.additionalAmount"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-label>Días adicionales</v-label>
                <v-text-field
                  v-model="form.additionalDays"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showForm = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="submit"
            ><Save class="h-4 w-4 mr-1" /> Guardar</v-btn
          >
        </v-card-actions>
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
            <h3 class="text-lg font-semibold mb-2">¿Eliminar otrosí?</h3>
            <p class="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
            <p class="text-sm font-bold text-red-600 mt-3">
              "{{ toDelete?.description }}"
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ toDelete?.type }} -
              {{
                toDelete?.additionalAmount
                  ? "$" + toDelete.additionalAmount
                  : ""
              }}
              {{
                toDelete?.additionalDays
                  ? toDelete.additionalDays + " días"
                  : ""
              }}
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" @click="showDelete = false">Cancelar</v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="deleting"
              @click="removeItem"
              >Eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </div>
</template>

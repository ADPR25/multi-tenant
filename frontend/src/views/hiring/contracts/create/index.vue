<script setup lang="ts">
import { ref, onMounted } from "vue";
import { contractsService } from "@/services/logic/hiring/contracts.service";
import {
  thirdPartiesService,
  type ThirdParty,
} from "@/services/logic/third-parties/third-parties.service";
import { Save, X } from "lucide-vue-next";

defineOptions({
  name: "ContractCreateForm",
});

interface ContractItem {
  id?: string;
  codigo?: string;
  numeroContrato?: string;
  numero_contrato?: string;
  thirdPartyId?: string;
  third_party_id?: string;
  supervisorId?: string;
  supervisor_id?: string;
  objeto?: string;
  observacion?: string;
  montoTotal?: string;
  monto_total?: string;
  montoPrimerPago?: string;
  vecesPagadas?: number;
  fechaInicio?: string;
  fechaCierre?: string;
  proyectoNombre?: string;
  proyecto_nombre?: string;
  proyectoId?: string;
  proyecto_id?: string;
}

interface ThirdPartyListResponse {
  data?: ThirdParty[];
}

const props = defineProps<{
  item?: ContractItem;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);
const terceros = ref<ThirdParty[]>([]);

const form = ref({
  codigo: props.item?.codigo || "",
  numeroContrato:
    props.item?.numeroContrato || props.item?.numero_contrato || "",
  thirdPartyId: props.item?.thirdPartyId || props.item?.third_party_id || "",
  supervisorId: props.item?.supervisorId || props.item?.supervisor_id || "",
  objeto: props.item?.objeto || "",
  observacion: props.item?.observacion || "",
  montoTotal: props.item?.montoTotal || props.item?.monto_total || "",
  montoPrimerPago: props.item?.montoPrimerPago || "",
  vecesPagadas: props.item?.vecesPagadas || 1,
  fechaInicio: props.item?.fechaInicio
    ? props.item.fechaInicio.substring(0, 10)
    : "",
  fechaCierre: props.item?.fechaCierre
    ? props.item.fechaCierre.substring(0, 10)
    : "",
  proyectoNombre:
    props.item?.proyectoNombre || props.item?.proyecto_nombre || "",
  proyectoId: props.item?.proyectoId || props.item?.proyecto_id || "",
});

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (props.item?.id) {
      await contractsService.update(props.item.id, form.value);
    } else {
      await contractsService.create(form.value);
    }
    emit("created");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al guardar contrato";
    alert(message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await thirdPartiesService.list({
      limit: "all",
      state: true,
    });
    const list = res as ThirdPartyListResponse | ThirdParty[];
    terceros.value = Array.isArray(list) ? list : list.data || [];
  } catch {
    terceros.value = [];
  }
});
</script>

<template>
  <div
    class="rounded-2xl border bg-white p-6 dark:bg-white/5 dark:border-gray-800"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="3"
          ><v-label>Código *</v-label
          ><v-text-field
            v-model="form.codigo"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>N° Contrato</v-label
          ><v-text-field
            v-model="form.numeroContrato"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Tercero *</v-label>
          <v-autocomplete
            v-model="form.thirdPartyId"
            :items="terceros"
            item-title="razonSocial"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12"
          ><v-label>Objeto *</v-label
          ><v-textarea
            v-model="form.objeto"
            variant="outlined"
            density="comfortable"
            rows="2"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12"
          ><v-label>Observación</v-label
          ><v-textarea
            v-model="form.observacion"
            variant="outlined"
            density="comfortable"
            rows="2"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Monto Total *</v-label
          ><v-text-field
            v-model="form.montoTotal"
            type="number"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Primer Pago</v-label
          ><v-text-field
            v-model="form.montoPrimerPago"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="2"
          ><v-label>Veces Pagadas</v-label
          ><v-text-field
            v-model="form.vecesPagadas"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="2"
          ><v-label>Fecha Inicio *</v-label
          ><v-text-field
            v-model="form.fechaInicio"
            type="date"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="2"
          ><v-label>Fecha Cierre</v-label
          ><v-text-field
            v-model="form.fechaCierre"
            type="date"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Proyecto Nombre</v-label
          ><v-text-field
            v-model="form.proyectoNombre"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Proyecto ID</v-label
          ><v-text-field
            v-model="form.proyectoId"
            variant="outlined"
            density="comfortable"
            placeholder="UUID opcional"
        /></v-col>
      </v-row>
      <div class="flex justify-end gap-2 mt-4">
        <v-btn variant="outlined" @click="emit('close')"
          ><X class="h-4 w-4 mr-2" /> Cancelar</v-btn
        >
        <v-btn color="primary" type="submit" :loading="saving"
          ><Save class="h-4 w-4 mr-2" /> Guardar</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

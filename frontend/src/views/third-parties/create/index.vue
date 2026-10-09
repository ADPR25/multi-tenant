<script setup lang="ts">
import { ref } from "vue";
import {
  thirdPartiesService,
  type ThirdPartyPayload,
} from "@/services/logic/third-parties/third-parties.service";
import { Save, X } from "lucide-vue-next";

defineOptions({
  name: "ThirdPartyCreateForm",
});

interface ThirdPartyItem {
  id?: string;
  nit?: string;
  dv?: string;
  razonSocial?: string;
  razon_social?: string;
  nombreComercial?: string;
  nombre_comercial?: string;
  tipo?: string;
  tipoPersona?: string;
  tipo_persona?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  banco?: string;
  tipoCuenta?: string;
  tipo_cuenta?: string;
  cuentaBancaria?: string;
  cuenta_bancaria?: string;
  actividadEconomica?: string;
  actividad_economica?: string;
  responsableIva?: boolean;
  responsable_iva?: boolean;
  notas?: string;
}

const props = defineProps<{
  item?: ThirdPartyItem;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);

const form = ref<ThirdPartyPayload>({
  nit: props.item?.nit || "",
  dv: props.item?.dv || "",
  razonSocial: props.item?.razonSocial || props.item?.razon_social || "",
  nombreComercial:
    props.item?.nombreComercial || props.item?.nombre_comercial || "",
  tipo: (props.item?.tipo as ThirdPartyPayload["tipo"]) || "CONTRATISTA",
  tipoPersona: (props.item?.tipoPersona ||
    props.item?.tipo_persona ||
    "JURIDICA"),
  email: props.item?.email || "",
  telefono: props.item?.telefono || "",
  ciudad: props.item?.ciudad || "",
  direccion: props.item?.direccion || "",
  banco: props.item?.banco || "",
  tipoCuenta: props.item?.tipoCuenta || props.item?.tipo_cuenta || "",
  cuentaBancaria:
    props.item?.cuentaBancaria || props.item?.cuenta_bancaria || "",
  actividadEconomica:
    props.item?.actividadEconomica || props.item?.actividad_economica || "",
  responsableIva:
    props.item?.responsableIva || props.item?.responsable_iva || false,
  notas: props.item?.notas || "",
});

const tipos = ["CLIENTE", "PROVEEDOR", "CONTRATISTA", "EMPLEADO", "AMBOS"];
const tiposPersona = ["NATURAL", "JURIDICA"];

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (props.item?.id) {
      await thirdPartiesService.update(props.item.id, form.value);
    } else {
      await thirdPartiesService.create(form.value);
    }
    emit("created");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar";
    alert(message);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div
    class="rounded-2xl border bg-white p-6 dark:bg-white/5 dark:border-gray-800"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="3"
          ><v-label>NIT *</v-label
          ><v-text-field
            v-model="form.nit"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="1"
          ><v-label>DV</v-label
          ><v-text-field
            v-model="form.dv"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="5"
          ><v-label>Razón Social *</v-label
          ><v-text-field
            v-model="form.razonSocial"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Nombre Comercial</v-label
          ><v-text-field
            v-model="form.nombreComercial"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Tipo *</v-label
          ><v-select
            v-model="form.tipo"
            :items="tipos"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Tipo Persona</v-label
          ><v-select
            v-model="form.tipoPersona"
            :items="tiposPersona"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Email</v-label
          ><v-text-field
            v-model="form.email"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Teléfono</v-label
          ><v-text-field
            v-model="form.telefono"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Ciudad</v-label
          ><v-text-field
            v-model="form.ciudad"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="5"
          ><v-label>Dirección</v-label
          ><v-text-field
            v-model="form.direccion"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Actividad Económica</v-label
          ><v-text-field
            v-model="form.actividadEconomica"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Banco</v-label
          ><v-text-field
            v-model="form.banco"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Tipo Cuenta</v-label
          ><v-select
            v-model="form.tipoCuenta"
            :items="['AHORROS', 'CORRIENTE']"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Cuenta Bancaria</v-label
          ><v-text-field
            v-model="form.cuentaBancaria"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3" class="flex items-center gap-2 pt-8"
          ><v-checkbox
            v-model="form.responsableIva"
            label="Responsable IVA"
            density="compact"
        /></v-col>

        <v-col cols="12"
          ><v-label>Notas</v-label
          ><v-textarea
            v-model="form.notas"
            variant="outlined"
            density="comfortable"
            rows="2"
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

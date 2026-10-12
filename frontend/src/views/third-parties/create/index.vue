<script setup lang="ts">
import { ref } from "vue";
import {
  thirdPartiesService,
  type ThirdPartyPayload,
  type ThirdPartyType,
  type ThirdPartyPersonType,
  type ThirdParty,
} from "@/services/logic/third-parties/third-parties.service";
import { Save, X } from "lucide-vue-next";

defineOptions({ name: "ThirdPartyCreateForm" });

const props = defineProps<{
  item?: ThirdParty;
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
  taxId: props.item?.taxId || "",
  verificationDigit: props.item?.verificationDigit || null,
  legalName: props.item?.legalName || "",
  tradeName: props.item?.tradeName || null,
  type: props.item?.type || "CONTRACTOR",
  personType: props.item?.personType || "LEGAL_ENTITY",
  email: props.item?.email || null,
  phone: props.item?.phone || null,
  city: props.item?.city || null,
  address: props.item?.address || null,
  bankName: props.item?.bankName || null,
  bankAccountType: props.item?.bankAccountType || null,
  bankAccountNumber: props.item?.bankAccountNumber || null,
  economicActivity: props.item?.economicActivity || null,
  isVatResponsible: props.item?.isVatResponsible || false,
  notes: props.item?.notes || null,
});

const tipos: { title: string; value: ThirdPartyType }[] = [
  { title: "CLIENTE", value: "CLIENT" },
  { title: "PROVEEDOR", value: "SUPPLIER" },
  { title: "CONTRATISTA", value: "CONTRACTOR" },
  { title: "EMPLEADO", value: "EMPLOYEE" },
  { title: "AMBOS", value: "BOTH" },
];

const tiposPersona: { title: string; value: ThirdPartyPersonType }[] = [
  { title: "NATURAL", value: "INDIVIDUAL" },
  { title: "JURIDICA", value: "LEGAL_ENTITY" },
];

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
            v-model="form.taxId"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="1"
          ><v-label>DV</v-label
          ><v-text-field
            v-model="form.verificationDigit"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="5"
          ><v-label>Razón Social *</v-label
          ><v-text-field
            v-model="form.legalName"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Nombre Comercial</v-label
          ><v-text-field
            v-model="form.tradeName"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Tipo *</v-label
          ><v-select
            v-model="form.type"
            :items="tipos"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Tipo Persona</v-label
          ><v-select
            v-model="form.personType"
            :items="tiposPersona"
            item-title="title"
            item-value="value"
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
            v-model="form.phone"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Ciudad</v-label
          ><v-text-field
            v-model="form.city"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="5"
          ><v-label>Dirección</v-label
          ><v-text-field
            v-model="form.address"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Actividad Económica</v-label
          ><v-text-field
            v-model="form.economicActivity"
            variant="outlined"
            density="comfortable"
        /></v-col>

        <v-col cols="12" md="3"
          ><v-label>Banco</v-label
          ><v-text-field
            v-model="form.bankName"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Tipo Cuenta</v-label
          ><v-select
            v-model="form.bankAccountType"
            :items="['SAVINGS', 'CHECKING']"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Cuenta Bancaria</v-label
          ><v-text-field
            v-model="form.bankAccountNumber"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3" class="flex items-center gap-2 pt-8"
          ><v-checkbox
            v-model="form.isVatResponsible"
            label="Responsable IVA"
            density="compact"
        /></v-col>

        <v-col cols="12"
          ><v-label>Notas</v-label
          ><v-textarea
            v-model="form.notes"
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

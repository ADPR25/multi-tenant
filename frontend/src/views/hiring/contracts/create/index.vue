<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  contractsService,
  type ContractPayload,
  type Contract,
} from "@/services/logic/hiring/contracts.service";
import {
  thirdPartiesService,
  type ThirdParty,
  type ThirdPartiesResponse,
} from "@/services/logic/third-parties/third-parties.service";
import { projectsService, type Project } from "@/services";
import { Save, X } from "lucide-vue-next";

defineOptions({ name: "ContractCreateForm" });

type ContractFormItem = Partial<Contract> & {
  contract_number?: string;
  third_party_id?: string;
  objeto?: string;
  observacion?: string;
  monto_total?: string;
};

type PaginatedProjects = {
  data: Project[];
};

const props = defineProps<{
  item?: ContractFormItem;
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
const projects = ref<Project[]>([]);

const form = ref<ContractPayload>({
  code: props.item?.code || "",
  contractNumber:
    props.item?.contractNumber || props.item?.contract_number || null,
  thirdPartyId: props.item?.thirdPartyId || props.item?.third_party_id || "",
  supervisorId: props.item?.supervisorId || null,
  purpose: props.item?.purpose || props.item?.objeto || "",
  observation: props.item?.observation || props.item?.observacion || null,
  totalAmount: props.item?.totalAmount || props.item?.monto_total || "",
  firstPaymentAmount: props.item?.firstPaymentAmount || null,
  timesPaid: props.item?.timesPaid ?? 1,
  startDate: props.item?.startDate
    ? String(props.item.startDate).substring(0, 10)
    : "",
  endDate: props.item?.endDate
    ? String(props.item.endDate).substring(0, 10)
    : null,
  projectId: props.item?.projectId || null,
});

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload: ContractPayload = {
      ...form.value,
      contractNumber: form.value.contractNumber || null,
      firstPaymentAmount: form.value.firstPaymentAmount || null,
      endDate: form.value.endDate || null,
      projectId: form.value.projectId || null,
      totalAmount: String(form.value.totalAmount),
    };
    if (props.item?.id) {
      await contractsService.update(props.item.id, payload);
    } else {
      await contractsService.create(payload);
    }
    emit("created");
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : "Error al guardar contrato");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await thirdPartiesService.listSelect();
    const pRes = (await projectsService.list()) as
      Project[] | PaginatedProjects;
    projects.value = Array.isArray(pRes) ? pRes : pRes.data || [];

    const data = res as ThirdParty[] | ThirdPartiesResponse;
    terceros.value = Array.isArray(data) ? data : data.data || [];
  } catch {
    try {
      const res = await thirdPartiesService.list({
        limit: "all",
        isActive: true,
      });
      const data = res as ThirdParty[] | ThirdPartiesResponse;
      terceros.value = Array.isArray(data) ? data : data.data || [];
    } catch {
      terceros.value = [];
    }
  }
});
</script>

<template>
  <div class="rounded-2xl border bg-white p-6 dark:bg-white/5">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="3"
          ><v-label>Código *</v-label
          ><v-text-field
            v-model="form.code"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>N° Contrato</v-label
          ><v-text-field
            v-model="form.contractNumber"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6">
          <v-label>Tercero *</v-label>
          <v-autocomplete
            v-model="form.thirdPartyId"
            :items="terceros"
            item-title="legalName"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
            placeholder="Seleccione contratista"
          />
        </v-col>
        <v-col cols="12"
          ><v-label>Objeto / Purpose *</v-label
          ><v-textarea
            v-model="form.purpose"
            variant="outlined"
            rows="3"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12"
          ><v-label>Observación</v-label
          ><v-textarea v-model="form.observation" variant="outlined" rows="2"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Monto Total *</v-label
          ><v-text-field
            v-model="form.totalAmount"
            type="number"
            variant="outlined"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Primer Pago</v-label
          ><v-text-field
            v-model="form.firstPaymentAmount"
            type="number"
            variant="outlined"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Veces Pagadas</v-label
          ><v-text-field
            v-model="form.timesPaid"
            type="number"
            variant="outlined"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Fecha Inicio *</v-label
          ><v-date-input v-model="form.startDate" variant="outlined"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Fecha Fin</v-label
          ><v-date-input v-model="form.endDate" variant="outlined"
        /></v-col>
        <v-col cols="12"
          ><v-label>Proyecto</v-label
          ><v-autocomplete
            :items="projects"
            item-value="id"
            item-title="name"
            v-model="form.projectId"
            variant="outlined"
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

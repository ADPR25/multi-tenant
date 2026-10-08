<script setup lang="ts">
import { onMounted, ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable, { type FetchParams } from "@/components/common/AppDataTable.vue";
import { contractingService } from "@/services";
import type {
  ContractPayload,
  ContractQuery,
  ContractRecord,
  ContractThirdParty,
  ContractType,
  ThirdPartyPayload,
} from "@/services/logic/contracting/contracting.service";
import { usePermissions } from "@/composables/usePermissions";
import { FileSignature, Plus, X, Pencil, Users, ListChecks } from "lucide-vue-next";

defineOptions({ name: "ContractingIndexPage" });

type TabName = "contracts" | "parties" | "types";
interface ContractPageResponse<T> {
  data: T[];
  total: number;
  [key: string]: unknown;
}
type PaymentTerm = NonNullable<ContractPayload["paymentTerms"]>;
type RiskLevel = NonNullable<ThirdPartyPayload["riskLevel"]>;

interface ContractForm {
  title: string;
  contractTypeId: string;
  thirdPartyId: string;
  object: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  signatureDate: string;
  paymentTerms: PaymentTerm | "";
  status: ContractPayload["status"];
}

interface PartyForm {
  type: ThirdPartyPayload["type"];
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  riskLevel: RiskLevel;
}

const { can } = usePermissions();
const tab = ref<TabName>("contracts");
const tableRef = ref<{ reload: () => void } | null>(null);
const parties = ref<ContractThirdParty[]>([]);
const types = ref<ContractType[]>([]);
const partiesLoading = ref(false);
const typesLoading = ref(false);
const contractDialog = ref(false);
const partyDialog = ref(false);
const typeDialog = ref(false);
const saving = ref(false);
const contractError = ref("");
const partyError = ref("");
const selectedType = ref<ContractType | null>(null);
const contractForm = ref<ContractForm>({
  title: "",
  contractTypeId: "",
  thirdPartyId: "",
  object: "",
  totalValue: 0,
  startDate: "",
  endDate: "",
  signatureDate: "",
  paymentTerms: "",
  status: "BORRADOR",
});
const partyForm = ref<PartyForm>({
  type: "JURIDICA",
  name: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  contactPerson: "",
  riskLevel: "BAJO",
});
const typeForm = ref({ name: "", requiresPolicy: false, isActive: true });

const contractHeaders = [
  { title: "Número", key: "contractNumber", width: "150px" },
  { title: "Contrato", key: "title", minWidth: "220px" },
  { title: "Tercero", key: "thirdParty", sortable: false },
  { title: "Tipo", key: "contractType", sortable: false },
  { title: "Estado", key: "status", width: "140px" },
  { title: "Valor", key: "totalValue", align: "end" as const },
  { title: "Vence", key: "endDate", width: "120px" },
];

async function fetchContracts(params: FetchParams): Promise<ContractPageResponse<ContractRecord>> {
  const query: ContractQuery = {
    search: params.search,
    page: params.page,
    limit: params.limit,
  };
  return contractingService.listContracts(query);
}

async function loadOptions() {
  partiesLoading.value = true;
  typesLoading.value = true;
  const [partyResult, typeResult] = await Promise.allSettled([
    contractingService.listThirdParties({ limit: "all" }),
    contractingService.listTypes(),
  ]);
  if (partyResult.status === "fulfilled") parties.value = partyResult.value.data;
  if (typeResult.status === "fulfilled") types.value = typeResult.value;
  partiesLoading.value = false;
  typesLoading.value = false;
}

function openContractDialog() {
  contractError.value = "";
  contractForm.value = {
    title: "",
    contractTypeId: types.value.find((type) => type.isActive)?.id ?? "",
    thirdPartyId: "",
    object: "",
    totalValue: 0,
    startDate: "",
    endDate: "",
    signatureDate: "",
    paymentTerms: "",
    status: "BORRADOR",
  };
  contractDialog.value = true;
}

async function createContract() {
  contractError.value = "";
  if (contractForm.value.endDate < contractForm.value.startDate) {
    contractError.value = "La fecha final debe ser igual o posterior al inicio.";
    return;
  }
  saving.value = true;
  try {
    const payload: ContractPayload = {
      ...contractForm.value,
      totalValue: Number(contractForm.value.totalValue),
      paymentTerms: contractForm.value.paymentTerms || undefined,
      signatureDate: contractForm.value.signatureDate || undefined,
    };
    await contractingService.createContract(payload);
    contractDialog.value = false;
    tableRef.value?.reload();
  } catch (error: unknown) {
    contractError.value = error instanceof Error ? error.message : "No se pudo crear el contrato.";
  } finally {
    saving.value = false;
  }
}

function openPartyDialog() {
  partyError.value = "";
  partyForm.value = {
    type: "JURIDICA",
    name: "",
    legalName: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    riskLevel: "BAJO",
  };
  partyDialog.value = true;
}

async function createParty() {
  partyError.value = "";
  saving.value = true;
  try {
    await contractingService.createThirdParty({
      ...partyForm.value,
      legalName: partyForm.value.legalName || undefined,
      email: partyForm.value.email || undefined,
      phone: partyForm.value.phone || undefined,
      address: partyForm.value.address || undefined,
      contactPerson: partyForm.value.contactPerson || undefined,
    });
    partyDialog.value = false;
    await loadOptions();
  } catch (error: unknown) {
    partyError.value = error instanceof Error ? error.message : "No se pudo crear el tercero.";
  } finally {
    saving.value = false;
  }
}

function openTypeDialog(type: ContractType) {
  selectedType.value = type;
  typeForm.value = {
    name: type.name,
    requiresPolicy: type.requiresPolicy,
    isActive: type.isActive,
  };
  typeDialog.value = true;
}

async function updateType() {
  if (!selectedType.value) return;
  saving.value = true;
  try {
    await contractingService.updateType(selectedType.value.id, typeForm.value);
    typeDialog.value = false;
    await loadOptions();
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : "No se pudo actualizar el tipo.");
  } finally {
    saving.value = false;
  }
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

onMounted(loadOptions);
</script>

<template>
  <AdminLayout>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white/90">
        <FileSignature class="h-6 w-6" /> Contratación
      </h1>
      <v-btn
        v-if="tab === 'contracts' && can('contracting:write')"
        color="primary"
        @click="openContractDialog"
      >
        <Plus class="mr-2 h-4 w-4" /> Nuevo contrato
      </v-btn>
      <v-btn
        v-else-if="tab === 'parties' && can('contracting:write')"
        color="primary"
        @click="openPartyDialog"
      >
        <Plus class="mr-2 h-4 w-4" /> Nuevo tercero
      </v-btn>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="contracts"><FileSignature class="mr-2 h-4 w-4" />Contratos</v-tab>
      <v-tab value="parties"><Users class="mr-2 h-4 w-4" />Terceros</v-tab>
      <v-tab value="types"><ListChecks class="mr-2 h-4 w-4" />Tipos</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="contracts">
        <AppDataTable
          ref="tableRef"
          :headers="contractHeaders"
          :fetch-fn="fetchContracts"
          search-placeholder="Buscar por número, título o tercero..."
        >
          <template #[`item.thirdParty`]="{ item }">
            <div>
              <div class="font-medium">{{ item.thirdParty?.name || "-" }}</div>
              <div class="text-xs text-gray-500">{{ item.thirdParty?.taxId }}</div>
            </div>
          </template>
          <template #[`item.contractType`]="{ item }">
            {{ item.contractType?.name || "-" }}
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip size="small" variant="tonal" :color="item.status === 'VIGENTE' ? 'success' : item.status === 'VENCIDO' ? 'error' : 'secondary'">
              {{ item.status }}
            </v-chip>
          </template>
          <template #[`item.totalValue`]="{ item }">
            {{ formatCurrency(item.totalValue) }}
          </template>
          <template #[`item.endDate`]="{ item }">
            {{ new Date(`${item.endDate}T00:00:00`).toLocaleDateString("es-CO") }}
          </template>
        </AppDataTable>
      </v-window-item>

      <v-window-item value="parties">
        <v-data-table
          :headers="[
            { title: 'Nombre', key: 'name' },
            { title: 'NIT / CC', key: 'taxId' },
            { title: 'Tipo', key: 'type' },
            { title: 'Contacto', key: 'contactPerson' },
            { title: 'Correo', key: 'email' },
            { title: 'Riesgo', key: 'riskLevel' },
            { title: 'Estado', key: 'isActive' },
          ]"
          :items="parties"
          :loading="partiesLoading"
          item-value="id"
          density="comfortable"
        >
          <template #[`item.isActive`]="{ item }">
            <v-chip size="small" :color="item.isActive ? 'success' : 'error'" variant="tonal">
              {{ item.isActive ? "Activo" : "Inactivo" }}
            </v-chip>
          </template>
        </v-data-table>
      </v-window-item>

      <v-window-item value="types">
        <v-data-table
          :headers="[
            { title: 'Código', key: 'code' },
            { title: 'Nombre', key: 'name' },
            { title: 'Exige póliza', key: 'requiresPolicy' },
            { title: 'Estado', key: 'isActive' },
            { title: '', key: 'actions', sortable: false, align: 'end' },
          ]"
          :items="types"
          :loading="typesLoading"
          item-value="id"
          density="comfortable"
        >
          <template #[`item.requiresPolicy`]="{ item }">
            {{ item.requiresPolicy ? "Sí" : "No" }}
          </template>
          <template #[`item.isActive`]="{ item }">
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn v-if="can('contracting:admin')" icon size="small" variant="text" @click="openTypeDialog(item)">
              <Pencil class="h-4 w-4" />
            </v-btn>
          </template>
        </v-data-table>
      </v-window-item>
    </v-window>

    <v-dialog v-model="contractDialog" max-width="760" scrollable>
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Nuevo contrato</span>
          <v-btn icon variant="text" @click="contractDialog = false"><X class="h-4 w-4" /></v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="contractError" type="error" variant="tonal" class="mb-4">{{ contractError }}</v-alert>
          <v-row>
            <v-col cols="12"><v-text-field v-model="contractForm.title" label="Título *" required /></v-col>
            <v-col cols="12" md="6">
              <v-select v-model="contractForm.contractTypeId" :items="types.filter((type) => type.isActive)" item-title="name" item-value="id" label="Tipo de contrato *" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="contractForm.thirdPartyId" :items="parties.filter((party) => party.isActive)" item-title="name" item-value="id" label="Tercero *" required />
            </v-col>
            <v-col cols="12"><v-textarea v-model="contractForm.object" label="Objeto *" rows="3" required /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.number="contractForm.totalValue" type="number" min="0.01" step="0.01" label="Valor total (COP) *" required /></v-col>
            <v-col cols="12" md="6">
              <v-select v-model="contractForm.paymentTerms" :items="[
                { title: 'Mensual', value: 'MENSUAL' },
                { title: 'Pago único', value: 'UNICO' },
                { title: 'Por hitos', value: 'POR_HITOS' },
                { title: 'Trimestral', value: 'TRIMESTRAL' },
              ]" label="Forma de pago" clearable />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="contractForm.status" :items="[
                { title: 'Borrador', value: 'BORRADOR' },
                { title: 'Vigente', value: 'VIGENTE' },
              ]" label="Estado inicial" />
            </v-col>
            <v-col cols="12" md="4"><v-text-field v-model="contractForm.startDate" type="date" label="Fecha inicial *" required /></v-col>
            <v-col cols="12" md="4"><v-text-field v-model="contractForm.endDate" type="date" label="Fecha final *" required /></v-col>
            <v-col cols="12" md="4"><v-text-field v-model="contractForm.signatureDate" type="date" label="Fecha de firma" /></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="contractDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!contractForm.title || !contractForm.contractTypeId || !contractForm.thirdPartyId || !contractForm.object || !contractForm.startDate || !contractForm.endDate || Number(contractForm.totalValue) <= 0" @click="createContract">Crear borrador</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="partyDialog" max-width="700" scrollable>
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Nuevo tercero</span>
          <v-btn icon variant="text" @click="partyDialog = false"><X class="h-4 w-4" /></v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="partyError" type="error" variant="tonal" class="mb-4">{{ partyError }}</v-alert>
          <v-row>
            <v-col cols="12" md="6"><v-select v-model="partyForm.type" :items="[
              { title: 'Persona natural', value: 'NATURAL' },
              { title: 'Persona jurídica', value: 'JURIDICA' },
              { title: 'Empleado', value: 'EMPLEADO' },
            ]" label="Tipo *" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.taxId" label="NIT / CC *" required /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.name" label="Nombre *" required /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.legalName" label="Razón social" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.email" type="email" label="Correo" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.phone" label="Teléfono" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="partyForm.contactPerson" label="Persona de contacto" /></v-col>
            <v-col cols="12" md="6"><v-select v-model="partyForm.riskLevel" :items="['BAJO', 'MEDIO', 'ALTO']" label="Nivel de riesgo" /></v-col>
            <v-col cols="12"><v-text-field v-model="partyForm.address" label="Dirección" /></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="partyDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!partyForm.name || !partyForm.taxId" @click="createParty">Guardar tercero</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="typeDialog" max-width="500">
      <v-card>
        <v-card-title>Configurar tipo de contrato</v-card-title>
        <v-card-text>
          <v-text-field v-model="typeForm.name" label="Nombre" />
          <v-switch v-model="typeForm.requiresPolicy" label="Exige póliza" color="primary" />
          <v-switch v-model="typeForm.isActive" label="Activo" color="primary" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="typeDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="updateType">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>
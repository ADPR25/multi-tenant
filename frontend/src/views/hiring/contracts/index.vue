<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import EditView from "./edit/index.vue";
import {
  contractsService,
  type Contract,
} from "@/services/logic/hiring/contracts.service";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, Pencil, Power, Trash2, FileText, X } from "lucide-vue-next";
import { ref, computed } from "vue";

defineOptions({ name: "ContractsIndexPage" });

interface ThirdPartyRef {
  legalName?: string;
}
interface ContractItem {
  id: string;
  code: string;
  contractNumber?: string | null;
  totalAmount: string;
  totalAmountBase?: string;
  additionsTotal?: string;
  totalAmountReal?: string;
  extensionDaysTotal?: number;
  status: string;
  isActive?: boolean;
  thirdParty?: ThirdPartyRef | null;
}

const { can } = usePermissions();
const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<Contract | null>(null);
const selectedId = ref<string | null>(null);
const tableRef = ref<InstanceType<typeof AppDataTable>>();
const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<ContractItem | null>(null);
const isSelectedActive = computed(() => !!itemToToggle.value?.isActive);
const showDelete = ref(false);
const itemToDelete = ref<ContractItem | null>(null);
const deleting = ref(false);

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "default" },
  READY_TO_SIGN: { label: "Listo para Firma", color: "info" },
  SIGNED: { label: "Firmado", color: "success" },
  OFFICIAL: { label: "Oficializado", color: "primary" },
  CANCELLED: { label: "Cancelado", color: "error" },
};

function translateStatus(status: string) {
  return statusMap[status]?.label || status;
}
function statusColor(status: string) {
  return statusMap[status]?.color || "default";
}

const headers = [
  { title: "N° Contrato", key: "contractNumber" },
  { title: "Tercero", key: "thirdParty", sortable: false },
  { title: "Monto total", key: "totalAmountReal", align: "end" as const },
  { title: "Estado", key: "status", align: "center" as const },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function fetchContracts() {
  return contractsService.list({ find: "list" });
}

function openCreate(): void {
  selected.value = null;
  selectedId.value = null;
  mode.value = "create";
}
const openEdit = async (item: ContractItem) => {
  const data = await contractsService.getById(item.id);
  selected.value = data;
  selectedId.value = data.id;
  mode.value = "edit";
};
function closeList(): void {
  mode.value = "list";
  selected.value = null;
  selectedId.value = null;
  tableRef.value?.reload();
}
function handleCreated(p: Contract): void {
  selected.value = p;
  selectedId.value = p.id;
  mode.value = "edit";
  tableRef.value?.reload();
}

function confirmToggle(item: ContractItem): void {
  itemToToggle.value = item;
  dialogActive.value = true;
}
async function toggle(): Promise<void> {
  if (!itemToToggle.value) return;
  toggling.value = true;
  try {
    await contractsService.toggleActive(itemToToggle.value.id);
    dialogActive.value = false;
    itemToToggle.value = null;
    tableRef.value?.reload();
  } finally {
    toggling.value = false;
  }
}

function confirmDelete(item: ContractItem): void {
  itemToDelete.value = item;
  showDelete.value = true;
}
async function removeContract(): Promise<void> {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await contractsService.remove(itemToDelete.value.id);
    showDelete.value = false;
    itemToDelete.value = null;
    tableRef.value?.reload();
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <FileText class="h-6 w-6" /> Contratos
        </h1>
        <v-btn
          v-if="can('hiring:contract:create')"
          color="primary"
          @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="fetchContracts"
        search-placeholder="Buscar código, objeto..."
      >
        <template #[`item.thirdParty`]="{ item }">{{
          item.thirdParty?.legalName || "-"
        }}</template>

        <template #[`item.totalAmountReal`]="{ item }">
          <div class="text-right leading-tight">
            <div class="font-medium">
              ${{
                Number(item.totalAmountReal || item.totalAmount).toLocaleString(
                  "es-CO",
                )
              }}
            </div>
            <div
              v-if="Number(item.additionsTotal) > 0"
              class="text- text-green-600"
            >
              +{{ Number(item.additionsTotal).toLocaleString("es-CO") }} adición
            </div>
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            size="small"
            variant="tonal"
            >{{ translateStatus(item.status) }}</v-chip
          >
        </template>
        <template #[`item.isActive`]="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
            >{{ item.isActive ? "Activo" : "Inactivo" }}</v-chip
          >
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
              ><Pencil class="h-4 w-4"
            /></v-btn>
            <v-btn
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="confirmToggle(item)"
              ><Power class="h-4 w-4"
            /></v-btn>
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else-if="mode === 'create'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Crear Contrato</h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CreateView @close="closeList" @created="handleCreated" />
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          Editar {{ selected?.contractNumber || selected?.code }}
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <EditView
        :contract-id="selectedId!"
        :item="selected || undefined"
        @close="closeList"
      />
    </div>

    <Teleport to="body">
      <v-dialog v-model="dialogActive" max-width="420" persistent>
        <v-card class="rounded-xl">
          <v-card-text class="text-center pt-8 pb-4">
            <div
              :class="
                isSelectedActive
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-green-100 dark:bg-green-900/30'
              "
              class="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
            >
              <Power
                :class="isSelectedActive ? 'text-orange-600' : 'text-green-600'"
                class="h-7 w-7"
              />
            </div>
            <h3 class="text-lg font-semibold mb-2">
              {{
                isSelectedActive
                  ? "¿Desactivar contrato?"
                  : "¿Activar contrato?"
              }}
            </h3>
            <p class="text-sm text-gray-500">
              El contrato
              <span class="font-bold">{{
                itemToToggle?.contractNumber || itemToToggle?.code
              }}</span>
              pasará a estado
              <span class="font-bold">{{
                isSelectedActive ? "inactivo" : "activo"
              }}</span
              >.
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6"
            ><v-spacer />
            <v-btn variant="text" @click="dialogActive = false">Cancelar</v-btn>
            <v-btn
              :color="isSelectedActive ? 'warning' : 'success'"
              variant="flat"
              :loading="toggling"
              @click="toggle"
              >{{ isSelectedActive ? "Desactivar" : "Activar" }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>

    <Teleport to="body">
      <v-dialog v-model="showDelete" max-width="420" persistent>
        <v-card class="rounded-xl">
          <v-card-text class="text-center pt-8 pb-4">
            <div
              class="mx-auto bg-red-100 dark:bg-red-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4"
            >
              <Trash2 class="h-7 w-7 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold mb-2">¿Eliminar contrato?</h3>
            <p class="text-sm text-gray-500">
              Esta acción no se puede deshacer. Se eliminará permanentemente
            </p>
            <p class="text-sm font-bold text-red-600 mt-3">
              "{{ itemToDelete?.contractNumber || itemToDelete?.code }}"
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6"
            ><v-spacer />
            <v-btn variant="text" @click="showDelete = false">Cancelar</v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="deleting"
              @click="removeContract"
              >Eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </AdminLayout>
</template>

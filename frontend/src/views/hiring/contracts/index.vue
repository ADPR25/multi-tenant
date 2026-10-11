<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { contractsService } from "@/services/logic/hiring/contracts.service";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, Pencil, Power, Trash2, FileText, X } from "lucide-vue-next";
import { ref, computed } from "vue";

defineOptions({ name: "ContractsIndexPage" });

interface ThirdPartyRef {
  razonSocial?: string;
}

interface ContractItem {
  id: string;
  codigo: string;
  numeroContrato?: string;
  objeto: string;
  montoTotal: string;
  estado: string;
  isActive?: boolean;
  thirdParty?: ThirdPartyRef | null;
}

const { can } = usePermissions();
const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<ContractItem | null>(null);
const tableRef = ref<InstanceType<typeof AppDataTable>>();
const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<ContractItem | null>(null);
const isSelectedActive = computed(() => !!itemToToggle.value?.isActive);

const headers = [
  { title: "Código", key: "codigo" },
  { title: "N° Contrato", key: "numeroContrato" },
  { title: "Tercero", key: "thirdParty", sortable: false },
  { title: "Objeto", key: "objeto" },
  { title: "Monto", key: "montoTotal", align: "end" as const },
  { title: "Estado", key: "estado" },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate(): void {
  selected.value = null;
  mode.value = "create";
}
function openEdit(item: ContractItem): void {
  selected.value = item;
  mode.value = "edit";
}
function closeList(): void {
  mode.value = "list";
  selected.value = null;
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
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al cambiar estado";
    alert(message);
  } finally {
    toggling.value = false;
  }
}
async function removeContract(item: ContractItem): Promise<void> {
  if (!confirm(`Eliminar contrato ${item.codigo}?`)) return;
  await contractsService.remove(item.id);
  tableRef.value?.reload();
}
</script>
<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <FileText class="h-6 w-6" /> Contratos
        </h1>
        <v-btn v-if="can('hiring:contract:create')" color="primary" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>
      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="contractsService.list"
        search-placeholder="Buscar código, objeto..."
      >
        <template #[`item.thirdParty`]="{ item }">{{
          item.thirdParty?.razonSocial || "-"
        }}</template>
        <template #[`item.montoTotal`]="{ item }"
          >${{ Number(item.montoTotal).toLocaleString() }}</template
        >
        <template #[`item.estado`]="{ item }"
          ><v-chip size="small" variant="tonal">{{
            item.estado
          }}</v-chip></template
        >
        <template #[`item.isActive`]="{ item }"
          ><v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
            >{{ item.isActive ? "Activo" : "Inactivo" }}</v-chip
          ></template
        >
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
              @click="removeContract(item)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          {{ mode === "edit" ? "Editar" : "Crear" }} Contrato
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CreateView
        :item="selected || undefined"
        @close="closeList"
        @created="closeList"
      />
    </div>

    <v-dialog v-model="dialogActive" max-width="420">
      <v-card
        ><v-card-title>Cambiar estado</v-card-title
        ><v-card-text
          >¿{{
            isSelectedActive ? "Desactivar" : "Activar"
          }}
          contrato?</v-card-text
        >
        <v-card-actions
          ><v-spacer /><v-btn variant="text" @click="dialogActive = false"
            >Cancelar</v-btn
          ><v-btn color="primary" :loading="toggling" @click="toggle"
            >Confirmar</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import type { FetchParams } from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { documentsService } from "@/services";
import type { DocumentQuery } from "@/services/logic/document/documents.service";
import { usePermissions } from "@/composables/usePermissions";
import { Files, Pencil, Plus, Power, RotateCcw, Trash2, X } from "lucide-vue-next";

defineOptions({ name: "DocsIndexView" });

interface DocItem {
  id: string;
  title: string;
  folder?: { name: string } | null;
  category?: { name: string } | null;
  type?: { name: string } | null;
  isActive: boolean;
  expiresAt?: string;
  deletedAt?: string | null;
}

const { can } = usePermissions();
const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<DocItem | null>(null);
const tableRef = ref<{ reload: () => void } | null>(null);
const showTrash = ref(false);
const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<DocItem | null>(null);
const isSelectedActive = computed(() => !!itemToToggle.value?.isActive);

const headers = computed(() => [
  { title: "Título", key: "title", minWidth: "200px" },
  { title: "Carpeta", key: "folder", minWidth: "140px", sortable: false },
  { title: "Categoría", key: "category", minWidth: "140px", sortable: false },
  { title: "Tipo", key: "type", minWidth: "120px", sortable: false },
  { title: "Activo", key: "isActive", align: "center" as const, width: "110px" },
  { title: "Expira", key: "expiresAt", width: "120px" },
  ...(showTrash.value
    ? [{ title: "Eliminado", key: "deletedAt", width: "140px" }]
    : []),
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false, width: "150px" },
]);

function fetchDocuments(params: FetchParams) {
  const query: DocumentQuery = {
    search: params.search,
    page: params.page,
    limit: params.limit,
  };
  return showTrash.value
    ? documentsService.trash(query)
    : documentsService.list(query);
}

function openCreate() {
  selected.value = null;
  mode.value = "create";
}

function openEdit(item: DocItem) {
  selected.value = item;
  mode.value = "edit";
}

function closeList() {
  mode.value = "list";
  selected.value = null;
  tableRef.value?.reload();
}

function toggleTrash() {
  showTrash.value = !showTrash.value;
  tableRef.value?.reload();
}

async function remove(item: DocItem) {
  if (!window.confirm(`Mover "${item.title}" a la papelera?`)) return;
  try {
    await documentsService.delete(item.id);
    tableRef.value?.reload();
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : "No se pudo eliminar");
  }
}

async function restore(item: DocItem) {
  try {
    await documentsService.restore(item.id);
    tableRef.value?.reload();
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : "No se pudo restaurar");
  }
}

function confirmToggle(item: DocItem) {
  itemToToggle.value = item;
  dialogActive.value = true;
}

async function toggle() {
  if (!itemToToggle.value) return;
  toggling.value = true;
  try {
    await documentsService.toggleActive(itemToToggle.value.id);
    dialogActive.value = false;
    itemToToggle.value = null;
    tableRef.value?.reload();
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : "No se pudo cambiar el estado");
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white/90">
          <Files class="h-6 w-6" /> {{ showTrash ? "Papelera" : "Documentos" }}
        </h1>
        <div class="flex gap-2">
          <v-btn
            v-if="can('documents:docs:read') && (can('documents:docs:delete') || can('documents:docs:restore'))"
            variant="tonal"
            @click="toggleTrash"
          >
            <Trash2 v-if="!showTrash" class="mr-2 h-4 w-4" />
            <Files v-else class="mr-2 h-4 w-4" />
            {{ showTrash ? "Documentos" : "Papelera" }}
          </v-btn>
          <v-btn
            v-if="!showTrash && can('documents:docs:create')"
            color="primary"
            @click="openCreate"
          >
            <Plus class="mr-2 h-4 w-4" /> Crear
          </v-btn>
        </div>
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="fetchDocuments"
        search-placeholder="Buscar por título..."
      >
        <template #[`item.folder`]="{ item }">
          <span class="text-sm">{{ item.folder?.name || "-" }}</span>
        </template>
        <template #[`item.category`]="{ item }">
          <span class="text-sm">{{ item.category?.name || "-" }}</span>
        </template>
        <template #[`item.type`]="{ item }">
          <span class="text-sm">{{ item.type?.name || "-" }}</span>
        </template>
        <template #[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </v-chip>
        </template>
        <template #[`item.expiresAt`]="{ item }">
          {{ item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "-" }}
        </template>
        <template #[`item.deletedAt`]="{ item }">
          {{ item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : "-" }}
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="!showTrash && can('documents:docs:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              aria-label="Editar documento"
              @click="openEdit(item)"
            >
              <Pencil class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="!showTrash && can('documents:docs:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              aria-label="Cambiar estado"
              @click="confirmToggle(item)"
            >
              <Power class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="!showTrash && can('documents:docs:delete')"
              icon
              size="x-small"
              variant="text"
              color="error"
              aria-label="Mover a papelera"
              @click="remove(item)"
            >
              <Trash2 class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="showTrash && can('documents:docs:restore')"
              icon
              size="x-small"
              variant="text"
              color="success"
              aria-label="Restaurar documento"
              @click="restore(item)"
            >
              <RotateCcw class="h-4 w-4" />
            </v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === "edit" ? "Editar" : "Crear" }} Documento
        </h1>
        <v-btn variant="text" icon aria-label="Cerrar" @click="closeList">
          <X class="h-5 w-5" />
        </v-btn>
      </div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>

    <v-dialog v-model="dialogActive" max-width="450" persistent>
      <v-card>
        <v-card-title>
          {{ isSelectedActive ? "¿Inactivar documento?" : "¿Activar documento?" }}
        </v-card-title>
        <v-card-text>
          {{ itemToToggle?.title }}
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" :disabled="toggling" @click="dialogActive = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn :color="isSelectedActive ? 'error' : 'success'" :loading="toggling" @click="toggle">
            {{ isSelectedActive ? "Inactivar" : "Activar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>
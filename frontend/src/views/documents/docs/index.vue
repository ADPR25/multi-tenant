<script setup lang="ts">
defineOptions({
  name: "DocsIndexView",
});

import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { documentsService } from "@/services";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, Pencil, Power, Files, X } from "lucide-vue-next";
import { ref, computed } from "vue";

interface DocItem {
  id: string;
  title: string;
  folder?: { name: string } | null;
  category?: { name: string } | null;
  type?: { name: string } | null;
  isActive: boolean;
  expiresAt?: string | null;
}

const { can } = usePermissions();
const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<DocItem | null>(null);
const tableRef = ref<{ reload: () => void } | null>(null);

const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<DocItem | null>(null);
const isSelectedActive = computed(() => !!itemToToggle.value?.isActive);

const headers = [
  { title: "Título", key: "title", minWidth: "200px" },
  { title: "Carpeta", key: "folder", minWidth: "140px", sortable: false },
  { title: "Categoría", key: "category", minWidth: "140px", sortable: false },
  { title: "Tipo", key: "type", minWidth: "120px", sortable: false },
  {
    title: "Activo",
    key: "isActive",
    align: "center" as const,
    width: "110px",
  },
  { title: "Expira", key: "expiresAt", width: "120px" },
  {
    title: "Opciones",
    key: "actions",
    align: "end" as const,
    sortable: false,
    width: "120px",
  },
];

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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo cambiar el estado";
    alert(msg);
  } finally {
    toggling.value = false;
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1
          class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"
        >
          <Files class="h-6 w-6" /> Documentos
        </h1>
        <v-btn
          v-if="can('documents:docs:create')"
          color="primary"
          @click="openCreate"
        >
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="documentsService.list"
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
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </v-chip>
        </template>
        <template #[`item.expiresAt`]="{ item }">
          <span class="text-sm text-gray-500">
            {{
              item.expiresAt
                ? new Date(item.expiresAt).toLocaleDateString()
                : "-"
            }}
          </span>
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="can('documents:docs:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
            >
              <Pencil class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="can('documents:docs:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="confirmToggle(item)"
            >
              <Power class="h-4 w-4" />
            </v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === "edit" ? "Editar" : "Crear" }} Documento
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>

    <v-dialog v-model="dialogActive" max-width="450" persistent>
      <v-card class="rounded-2xl">
        <v-card-title class="flex items-center gap-3 pt-6 px-6">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              isSelectedActive
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600',
            ]"
          >
            <Power class="h-5 w-5" />
          </div>
          <span class="text-lg font-bold">
            {{
              isSelectedActive ? "¿Inactivar documento?" : "¿Activar documento?"
            }}
          </span>
        </v-card-title>
        <v-card-text class="px-6 pb-2 text-gray-600">
          <p>
            Estás a punto de
            <strong
              :class="isSelectedActive ? 'text-red-600' : 'text-green-600'"
            >
              {{ isSelectedActive ? "inactivar" : "activar" }}
            </strong>
            el documento <strong>{{ itemToToggle?.title }}</strong
            >.
          </p>
          <p class="mt-3 text-sm">¿Deseas continuar?</p>
        </v-card-text>
        <v-card-actions class="p-6 pt-4">
          <v-btn
            variant="text"
            :disabled="toggling"
            @click="dialogActive = false"
            >Cancelar</v-btn
          >
          <v-spacer />
          <v-btn
            :color="isSelectedActive ? 'error' : 'success'"
            variant="flat"
            :loading="toggling"
            @click="toggle"
          >
            {{ isSelectedActive ? "Sí, inactivar" : "Sí, activar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

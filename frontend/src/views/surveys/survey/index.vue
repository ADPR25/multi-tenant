<script setup lang="ts">
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { surveysService, type Survey } from "@/services";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, Pencil, Power, ClipboardList, X } from "lucide-vue-next";

defineOptions({ name: "SurveyIndexView" });

const { can } = usePermissions();

const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<Survey | null>(null);
const tableRef = ref<{ reload: () => void } | null>(null);

const headers = [
  { title: "Título", key: "title" },
  { title: "Descripción", key: "description" },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate() {
  selected.value = null;
  mode.value = "create";
}

async function openEdit(item: Survey) {
  try {
    const data = await surveysService.getById(item.id);
    selected.value = data;
    mode.value = "edit";
  } catch (e) {
    console.error(e);
  }
}

function closeList() {
  mode.value = "list";
  selected.value = null;
  tableRef.value?.reload();
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1
          class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"
        >
          <ClipboardList class="h-6 w-6" /> Encuestas
        </h1>
        <v-btn v-if="can('survey:create')" color="primary" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="surveysService.list"
        search-placeholder="Buscar por título..."
      >
        <template #[`item.isActive`]="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="can('survey:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
              ><Pencil class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('survey:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              ><Power class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          {{ mode === "edit" ? "Editar" : "Crear" }} Encuesta
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CreateView
        :key="selected?.id || 'create'"
        :item="selected"
        @close="closeList"
        @created="closeList"
      />
    </div>
  </AdminLayout>
</template>

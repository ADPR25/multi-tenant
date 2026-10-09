<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import EditView from "./edit/index.vue";
import {
  projectsService,
  type Project,
} from "@/services/logic/projects/projects.service";
import { usePermissions } from "@/composables/usePermissions";
import {
  Plus,
  Pencil,
  Power,
  Trash2,
  FolderKanban,
  X,
} from "lucide-vue-next";
import { ref, computed } from "vue";

defineOptions({ name: "ProjectsIndexPage" });

interface ProjectItem {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  avance: number;
  presupuesto?: string;
  cliente?: { razonSocial?: string };
  isActive?: boolean;
}

interface CreatedProject {
  id?: string | null;
}

const { can } = usePermissions();
const mode = ref<"list" | "create" | "edit" | "view">("list");
const selected = ref<ProjectItem | null>(null);
const selectedId = ref<string | null>(null);
const tableRef = ref<InstanceType<typeof AppDataTable>>();
const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<ProjectItem | null>(null);
const isSelectedActive = computed(() => !!itemToToggle.value?.isActive);

const headers = [
  { title: "Código", key: "codigo" },
  { title: "Nombre", key: "nombre" },
  { title: "Cliente", key: "cliente", sortable: false },
  { title: "Estado", key: "estado" },
  { title: "Avance", key: "avance" },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate(): void {
  selected.value = null;
  mode.value = "create";
}
function openEdit(item: ProjectItem): void {
  selected.value = item;
  selectedId.value = item.id;
  mode.value = "edit";
}
function closeList(): void {
  mode.value = "list";
  selected.value = null;
  selectedId.value = null;
  tableRef.value?.reload();
}
function confirmToggle(item: ProjectItem): void {
  itemToToggle.value = item;
  dialogActive.value = true;
}
function handleCreated(p: CreatedProject | Project): void {
  selectedId.value = p?.id || null;
  mode.value = "edit";
  tableRef.value?.reload();
  if (!selectedId.value) closeList();
}
async function toggle(): Promise<void> {
  if (!itemToToggle.value) return;
  toggling.value = true;
  try {
    await projectsService.toggleActive(itemToToggle.value.id);
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
async function remove(item: ProjectItem): Promise<void> {
  if (!confirm(`Eliminar proyecto ${item.codigo}?`)) return;
  try {
    await projectsService.remove(item.id);
    tableRef.value?.reload();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar";
    alert(message);
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
          <FolderKanban class="h-6 w-6" /> Proyectos
        </h1>
        <v-btn v-if="can('projects:create')" color="primary" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear Proyecto</v-btn
        >
      </div>
      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="projectsService.list"
        search-placeholder="Buscar código o nombre..."
      >
        <template #[`item.cliente`]="{ item }">{{
          item.cliente?.razonSocial || "-"
        }}</template>
        <template #[`item.estado`]="{ item }"
          ><v-chip size="small" variant="tonal" color="primary">{{
            item.estado
          }}</v-chip></template
        >
        <template #[`item.avance`]="{ item }"
          ><v-progress-linear
            :model-value="item.avance"
            height="6"
            rounded
            color="primary"
            style="width: 80px"
          />{{ item.avance }}%</template
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
              v-if="can('projects:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
              ><Pencil class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('projects:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="confirmToggle(item)"
              ><Power class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('projects:delete')"
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="remove(item)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>
    <div v-else-if="mode === 'create'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Crear Proyecto</h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CreateView @close="closeList" @created="handleCreated" />
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          Editar Proyecto {{ selected?.codigo }}
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <EditView
        :project-id="selectedId!"
        :item="selected || undefined"
        @close="closeList"
      />
    </div>

    <v-dialog v-model="dialogActive" max-width="420">
      <v-card
        ><v-card-title>Cambiar estado</v-card-title
        ><v-card-text
          >¿{{
            isSelectedActive ? "Desactivar" : "Activar"
          }}
          proyecto?</v-card-text
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

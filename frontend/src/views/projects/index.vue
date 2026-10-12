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
import { Plus, Pencil, Power, Trash2, FolderKanban, X } from "lucide-vue-next";
import { ref, computed } from "vue";

defineOptions({ name: "ProjectsIndexPage" });

interface ProjectItem {
  id: string;
  code: string;
  name: string;
  progress: number;
  clientId: string | null;
  isActive: boolean;
  createdAt?: string;
  client?: {
    razonSocial?: string;
    businessName?: string;
    name?: string;
  } | null;
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
const showDelete = ref(false);
const itemToDelete = ref<ProjectItem | null>(null);
const deleting = ref(false);

const headers = [
  { title: "Código", key: "code" },
  { title: "Nombre", key: "name" },
  { title: "Avance", key: "progress" },
  { title: "Estado", key: "isActive" },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate(): void {
  selected.value = null;
  mode.value = "create";
}
const openEdit = async (item: ProjectItem) => {
  const itemEdit = await projectsService.getById(item.id);
  selected.value = itemEdit;
  selectedId.value = itemEdit.id;
  mode.value = "edit";
};
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
  selectedId.value = (p)?.id || null;
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
  } finally {
    toggling.value = false;
  }
}

function confirmDelete(item: ProjectItem): void {
  itemToDelete.value = item;
  showDelete.value = true;
}
async function removeProject(): Promise<void> {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await projectsService.remove(itemToDelete.value.id);
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
        <template #[`item.progress`]="{ item }">
          <div class="flex items-center gap-2">
            <v-progress-linear
              :model-value="item.progress"
              height="6"
              rounded
              color="primary"
              style="width: 80px"
            />
            <span class="text-sm">{{ item.progress }}%</span>
          </div>
        </template>
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
              @click="confirmDelete(item)"
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
        <h1 class="text-2xl font-bold">Editar Proyecto {{ selected?.code }}</h1>
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

    <!-- Dialog Activar / Desactivar -->
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
                  ? "¿Desactivar proyecto?"
                  : "¿Activar proyecto?"
              }}
            </h3>
            <p class="text-sm text-gray-500">
              El proyecto
              <span class="font-bold">{{ itemToToggle?.code }}</span> -
              {{ itemToToggle?.name }} pasará a
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
            <h3 class="text-lg font-semibold mb-2">¿Eliminar proyecto?</h3>
            <p class="text-sm text-gray-500">
              Esta acción no se puede deshacer. Se eliminará permanentemente
            </p>
            <p class="text-sm font-bold text-red-600 mt-3">
              "{{ itemToDelete?.name }}"
            </p>
            <p v-if="itemToDelete?.code" class="text-xs text-gray-400 mt-1">
              {{ itemToDelete.code }}
            </p>
          </v-card-text>
          <v-card-actions class="px-6 pb-6"
            ><v-spacer />
            <v-btn variant="text" @click="showDelete = false">Cancelar</v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="deleting"
              @click="removeProject"
              >Eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </AdminLayout>
</template>

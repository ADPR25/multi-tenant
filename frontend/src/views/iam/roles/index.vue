<script setup lang="ts">
defineOptions({
  name: "RolesIndexView",
});

import { ref, computed } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import { get } from "@/store/authstore";
import { rolesService } from "@/services";
import { Plus, Pencil, X, Power, ShieldCheck, KeyRound } from "lucide-vue-next";
import CreateComponent from "./create/index.vue";
import PermissionsView from "./permissions/index.vue";
import { usePermissions } from "@/composables/usePermissions.ts";

interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isPrincipal?: boolean;
}

const user = get.useAuth("user");
const { can } = usePermissions();

const mode = ref<"list" | "create" | "edit" | "permissions">("list");
const selectedRole = ref<RoleItem | null>(null);
const dialogActive = ref(false);
const toggling = ref(false);
const tableRef = ref<{ reload: () => void } | null>(null);

const isSelectedActive = computed(() => !!selectedRole.value?.isActive);

const headers = [
  { title: "Rol", key: "name", minWidth: "180px" },
  {
    title: "Descripcion",
    key: "description",
    minWidth: "180px",
    sortable: false,
  },
  { title: "Estado", key: "isActive", minWidth: "110px", align: "center" },
  {
    title: "Opciones",
    key: "actions",
    minWidth: "120px",
    align: "end",
    sortable: false,
  },
];

const truncate = (text: string | null | undefined, max = 25) => {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
};

function openCreate() {
  selectedRole.value = null;
  mode.value = "create";
}

function openEdit(role: RoleItem) {
  selectedRole.value = role;
  mode.value = "edit";
}

function openPermission(role: RoleItem) {
  selectedRole.value = role;
  mode.value = "permissions";
}

function openActive(role: RoleItem) {
  selectedRole.value = role;
  dialogActive.value = true;
}

async function toggleActiveStatus() {
  if (!selectedRole.value) return;
  toggling.value = true;
  try {
    await rolesService.toggleActive(
      selectedRole.value.id,
      !selectedRole.value.isActive,
    );
    dialogActive.value = false;
    tableRef.value?.reload();
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "No se pudo cambiar el estado";
    alert(msg);
  } finally {
    toggling.value = false;
  }
}

function close() {
  mode.value = "list";
  selectedRole.value = null;
}

function onSaved() {
  close();
  tableRef.value?.reload();
}

function onPermissionsSaved() {
  close();
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
          <ShieldCheck class="h-6 w-6 text-gray-500" /> Roles
        </h1>
        <v-btn
          v-if="can('iam:roles:create')"
          color="success"
          @click="openCreate"
        >
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="rolesService.list"
        search-placeholder="Buscar por nombre, descripción..."
      >
        <template #[`item.name`]="{ item }">
          <span class="font-medium whitespace-nowrap flex items-center gap-2">
            <ShieldCheck class="h-4 w-4 text-gray-400" /> {{ item.name }}
          </span>
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

        <template #[`item.description`]="{ item }">
          <v-tooltip
            v-if="item.description && item.description.length > 25"
            :text="item.description"
            location="top"
          >
            <template #activator="{ props }">
              <span
                v-bind="props"
                class="text-sm text-gray-600 whitespace-nowrap cursor-help"
              >
                {{ truncate(item.description, 25) }}
              </span>
            </template>
          </v-tooltip>
          <span v-else class="text-sm text-gray-600 whitespace-nowrap">
            {{ truncate(item.description, 25) }}
          </span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="
                can('iam:roles:assignment') &&
                (user.roleCode === 'SUPER_ADMIN' || item.isPrincipal === false)
              "
              icon
              size="x-small"
              variant="text"
              color="primary"
              title="Permisos"
              @click="openPermission(item)"
            >
              <KeyRound class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="
                can('iam:roles:update') &&
                (user.roleCode === 'SUPER_ADMIN' || item.isPrincipal === false)
              "
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
            >
              <Pencil class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="
                can('iam:roles:state') &&
                (user.roleCode === 'SUPER_ADMIN' || item.isPrincipal === false)
              "
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="openActive(item)"
            >
              <Power class="h-4 w-4" />
            </v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else-if="mode === 'create' || mode === 'edit'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === "edit" ? "Editar rol" : "Crear rol" }}
        </h1>
        <v-btn variant="text" icon @click="close"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateComponent
        :role="mode === 'edit' ? selectedRole : null"
        :is-edit="mode === 'edit'"
        @close="close"
        @created="onSaved"
        @updated="onSaved"
      />
    </div>

    <div v-else-if="mode === 'permissions'">
      <div class="flex items-center justify-between mb-6">
        <h1
          class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"
        >
          <KeyRound class="h-6 w-6 text-gray-500" /> Permisos de
          {{ selectedRole?.name }}
        </h1>
        <v-btn variant="text" icon @click="close"><X class="h-5 w-5" /></v-btn>
      </div>
      <PermissionsView
        :role="selectedRole"
        @close="close"
        @saved="onPermissionsSaved"
        @back="close"
      />
    </div>
  </AdminLayout>

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
        <span class="text-lg font-bold">{{
          isSelectedActive ? "¿Inactivar rol?" : "¿Activar rol?"
        }}</span>
      </v-card-title>
      <v-card-text class="px-6 pb-2 text-gray-600">
        <p>
          Estás a punto de
          <strong
            :class="isSelectedActive ? 'text-red-600' : 'text-green-600'"
            >{{ isSelectedActive ? "inactivar" : "activar" }}</strong
          >
          el rol <strong>{{ selectedRole?.name }}</strong
          >.
        </p>
        <p class="mt-3 text-sm">¿Deseas continuar?</p>
      </v-card-text>
      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" :disabled="toggling" @click="dialogActive = false"
          >Cancelar</v-btn
        >
        <v-spacer />
        <v-btn
          :color="isSelectedActive ? 'error' : 'success'"
          variant="flat"
          :loading="toggling"
          @click="toggleActiveStatus"
        >
          {{ isSelectedActive ? "Sí, inactivar" : "Sí, activar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

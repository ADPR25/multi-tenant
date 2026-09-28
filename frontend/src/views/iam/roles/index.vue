<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { get } from '@/store/authstore'
import { rolesService } from '@/services'
import { Plus, Pencil, X, Power, ShieldCheck, KeyRound } from 'lucide-vue-next'
import CreateComponent from './create/index.vue'
import PermissionsView from './permissions/index.vue'
import { usePermissions } from '@/composables/usePermissions.ts'

const user = get.useAuth('user')
const { can } = usePermissions()

const roles = ref([])
const search = ref('')
const loading = ref(false)
const mode = ref('list')
const selectedRole = ref(null)
const dialogActive = ref(false)
const toggling = ref(false)

const isSelectedActive = computed(() => !!selectedRole.value?.isActive)

const traer = async () => {
  loading.value = true
  try {
    const data = await rolesService.list()
    roles.value = Array.isArray(data) ? data : data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const truncate = (text, max = 25) => {
  if (!text) return '-'
  return text.length > max ? text.slice(0, max) + '...' : text
}

const openCreate = () => {
  selectedRole.value = null
  mode.value = 'create'
}

const openEdit = (role) => {
  selectedRole.value = role
  mode.value = 'edit'
}

const openPermission = (role) => {
  selectedRole.value = role
  mode.value = 'permissions'
}

const openActive = (role) => {
  selectedRole.value = role
  dialogActive.value = true
}

const toggleActiveStatus = async () => {
  if (!selectedRole.value) return
  toggling.value = true
  try {
    await rolesService.toggleActive(selectedRole.value.id, !selectedRole.value.isActive)
    dialogActive.value = false
    await traer()
  } catch (e) {
    console.error(e)
    alert(e.message || 'No se pudo cambiar el estado')
  } finally {
    toggling.value = false
  }
}

const close = () => {
  mode.value = 'list'
  selectedRole.value = null
}

const onSaved = async () => {
  close()
  await traer()
}

const onPermissionsSaved = async () => {
  close()
  await traer()
}

const headers = [
  { title: 'Rol', key: 'name', minWidth: '180px' },
  { title: 'Descripcion', key: 'description', minWidth: '180px' },
  { title: 'Estado', key: 'isActive', minWidth: '110px', align: 'center' },
  { title: 'Opciones', key: 'actions', minWidth: '120px', align: 'end', sortable: false },
]

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-'

onMounted(() => {
  traer()
})
</script>

<template>
  <AdminLayout>
    <!-- LIST -->
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <ShieldCheck class="h-6 w-6 text-gray-500" /> Roles
        </h1>
        <v-btn v-if="can('iam:roles:create')" color="success" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5 xl:p-7"
      >
        <v-text-field
          v-model="search"
          placeholder="Buscar por nombre, descripción..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6 w-full sm:max-w-sm"
        />
        <div class="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <v-data-table
            :headers="headers"
            :items="roles"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            :mobile-breakpoint="768"
            density="comfortable"
            class="companies-table bg-transparent"
            item-value="id"
          >
            <template v-slot:item.name="{ item }">
              <span class="font-medium whitespace-nowrap flex items-center gap-2">
                <ShieldCheck class="h-4 w-4 text-gray-400" /> {{ item.name }}
              </span>
            </template>

            <template v-slot:item.isActive="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal">
                {{ item.isActive ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </template>

            <template v-slot:item.createdAt="{ item }">
              <span class="text-sm text-gray-500 whitespace-nowrap">{{
                formatDate(item.createdAt)
              }}</span>
            </template>

            <template v-slot:item.description="{ item }">
              <v-tooltip
                :text="item.description"
                location="top"
                v-if="item.description && item.description.length > 25"
              >
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="text-sm text-gray-600 whitespace-nowrap cursor-help">
                    {{ truncate(item.description, 25) }}
                  </span>
                </template>
              </v-tooltip>
              <span v-else class="text-sm text-gray-600 whitespace-nowrap">
                {{ truncate(item.description, 25) }}
              </span>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('iam:roles:assign-permissions') && (user.roleName === 'SUPER_ADMIN' || item.isPrincipal === false)"
                  icon
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="openPermission(item)"
                  title="Permisos"
                >
                  <KeyRound class="h-4 w-4" />
                </v-btn>
                <v-btn
                  v-if="
                    can('iam:roles:update') &&
                    (user.roleName === 'SUPER_ADMIN' || item.isPrincipal === false)
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
                    can('iam:roles:inactive') && (user.roleName === 'SUPER_ADMIN' ||
                    item.isPrincipal === false)
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
          </v-data-table>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT -->
    <div v-else-if="mode === 'create' || mode === 'edit'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar rol' : 'Crear rol' }}
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

    <!-- PERMISSIONS -->
    <div v-else-if="mode === 'permissions'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <KeyRound class="h-6 w-6 text-gray-500" /> Permisos de {{ selectedRole?.name }}
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
            isSelectedActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
          ]"
        >
          <Power class="h-5 w-5" />
        </div>
        <span class="text-lg font-bold">
          {{ isSelectedActive ? '¿Inactivar rol?' : '¿Activar rol?' }}
        </span>
      </v-card-title>
      <v-card-text class="px-6 pb-2 text-gray-600">
        <p>
          Estás a punto de
          <strong :class="isSelectedActive ? 'text-red-600' : 'text-green-600'">
            {{ isSelectedActive ? 'inactivar' : 'activar' }}
          </strong>
          el rol <strong>{{ selectedRole?.name }}</strong
          >.
        </p>
        <p class="mt-3 text-sm">¿Deseas continuar?</p>
      </v-card-text>
      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" @click="dialogActive = false" :disabled="toggling">Cancelar</v-btn>
        <v-spacer />
        <v-btn
          :color="isSelectedActive ? 'error' : 'success'"
          variant="flat"
          :loading="toggling"
          @click="toggleActiveStatus"
        >
          {{ isSelectedActive ? 'Sí, inactivar' : 'Sí, activar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
:deep(.companies-table.v-data-table__tr) {
  border-bottom: 1px solid #e5e7eb !important;
}
:deep(.companies-table.v-data-table__mobile-table-row) {
  border-bottom: 2px solid #e5e7eb !important;
  padding: 12px 0 !important;
}
:deep(.companies-table.v-data-table__mobile-row) {
  border-bottom: 1px dashed #f3f4f6 !important;
  padding: 8px 16px !important;
  min-height: 45px;
}
</style>
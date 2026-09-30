<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import AppDataTable from '@/components/common/AppDataTable.vue'
import { usersService } from '@/services'
import { Plus, Pencil, X, Power, ShieldCheck } from 'lucide-vue-next'
import CreateComponent from './create/index.vue'
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()

const mode = ref('list')
const selectedItem = ref(null)
const tableRef = ref(null)

const headers = [
  { title: 'Numero de documento', key: 'document_number', minWidth: '180px' },
  { title: 'Nombre', key: 'fullName', minWidth: '220px', sortable: false },
  { title: 'Rol', key: 'role.name', minWidth: '180px', sortable: false },
  { title: 'Estado', key: 'isActive', minWidth: '110px', align: 'center' },
  { title: 'Opciones', key: 'actions', minWidth: '120px', align: 'end', sortable: false },
]

function openCreate() {
  selectedItem.value = null
  mode.value = 'create'
}

function openEdit(item) {
  selectedItem.value = item
  mode.value = 'edit'
}

function close() {
  mode.value = 'list'
  selectedItem.value = null
}

const porConfirmar = (val) => val || 'por confirmar'

async function onSaved() {
  close()
  tableRef.value?.reload()
}

async function toggleActive(item) {
  try {
    await usersService.toggleActive(item.id, !item.isActive)
    tableRef.value?.reload()
  } catch (e) {
    alert(e.message || 'No se pudo cambiar el estado')
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <ShieldCheck class="h-6 w-6 text-gray-500" /> Usuarios
        </h1>
        <v-btn v-if="can('iam:users:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>

      <AppDataTable ref="tableRef" :headers="headers" :fetch-fn="usersService.list" search-placeholder="Buscar por nombre, documento...">
        <template #item.fullName="{ item }">
          {{ item.first_name }} {{ item.last_name }}
        </template>

        <template #item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.isActive ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template #item.document_number="{ item }">
          {{ porConfirmar(item.document_number) }}
        </template>

        <template #item.actions="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="can('iam:users:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
            >
              <Pencil class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="can('iam:users:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="toggleActive(item)"
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
          {{ mode === 'edit' ? 'Editar usuario' : 'Crear usuario' }}
        </h1>
        <v-btn variant="text" icon @click="close"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateComponent
        :item="mode === 'edit' ? selectedItem : null"
        :is-edit="mode === 'edit'"
        @close="close"
        @created="onSaved"
        @updated="onSaved"
      />
    </div>
  </AdminLayout>
</template>
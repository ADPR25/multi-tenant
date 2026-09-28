<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateBranch from './create/index.vue'
import { branchesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Trash2, Building2, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<any>(null)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Dirección', key: 'address' },
  { title: 'Teléfono', key: 'phoneNumber' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await branchesService.list()
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function openCreate() {
  selected.value = null
  mode.value = 'create'
}
function openEdit(item: any) {
  selected.value = item
  mode.value = 'edit'
}
function closeList() {
  mode.value = 'list'
  selected.value = null
  traer()
}
async function removeItem(item: any) {
  if (confirm(`¿Eliminar sucursal ${item.name}?`)) {
    await branchesService.remove(item.id)
    traer()
  }
}
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Building2 class="h-6 w-6 text-gray-500" /> Sucursales
        </h1>
        <v-btn v-if="can('inventory:branches:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar por nombre..."
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6 w-full sm:max-w-sm"
        />
        <div class="w-full overflow-x-auto rounded-xl border">
          <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            density="comfortable"
            class="bg-transparent"
            item-value="id"
          >
            <template #item.phoneNumber="{ item }">{{
              item.phoneNumber || item.phone_number || '-'
            }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('inventory:branches:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                  ><Pencil class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="can('inventory:branches:delete')"
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeItem(item)"
                  ><Trash2 class="h-4 w-4"
                /></v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar Sucursal' : 'Nueva Sucursal' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateBranch :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

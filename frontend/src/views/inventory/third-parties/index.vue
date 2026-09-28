<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted, watch } from 'vue'
import CreateThirdParty from './create/index.vue'
import { thirdPartiesService, type ThirdPartyKind } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Trash2, Users, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<any>(null)
const kindFilter = ref<ThirdPartyKind | ''>('')

const kindTabs = [
  { label: 'Todos', value: '' },
  { label: 'Clientes', value: 'CLIENTE' },
  { label: 'Proveedores', value: 'PROVEEDOR' },
  { label: 'Empleados', value: 'EMPLEADO' },
] as const

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Documento', key: 'documentNumber' },
  { title: 'Tipo', key: 'type', align: 'center' as const },
  { title: 'Roles', key: 'kinds', align: 'center' as const },
  { title: 'Email', key: 'email' },
  { title: 'Tel', key: 'phone' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await thirdPartiesService.list({
      kind: (kindFilter.value || undefined) as ThirdPartyKind | undefined,
    })
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
  traer()
}
async function removeItem(item: any) {
  if (confirm(`¿Eliminar tercero ${item.name}?`)) {
    await thirdPartiesService.remove(item.id)
    traer()
  }
}

watch(kindFilter, traer)
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Users class="h-6 w-6 text-gray-500" /> Terceros
        </h1>
        <v-btn v-if="can('inventory:third_parties:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex flex-wrap gap-3 mb-6">
          <v-select
            v-model="kindFilter"
            :items="kindTabs"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            class="w-full sm:max-w-"
            label="Filtrar por rol"
          />
          <v-text-field
            v-model="search"
            placeholder="Buscar por nombre o documento..."
            variant="outlined"
            density="compact"
            hide-details
            class="w-full sm:max-w-sm ml-auto"
          />
        </div>
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
            <template #item.kinds="{ item }">
              <div class="flex gap-1 justify-center">
                <v-chip
                  v-for="k in item.kinds"
                  :key="k"
                  size="x-small"
                  variant="tonal"
                  :color="k === 'CLIENTE' ? 'primary' : k === 'PROVEEDOR' ? 'success' : 'default'"
                >
                  {{ k }}
                </v-chip>
              </div>
            </template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('inventory:third_parties:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                >
                  <Pencil class="h-4 w-4" />
                </v-btn>
                <v-btn
                  v-if="can('inventory:third_parties:delete')"
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeItem(item)"
                >
                  <Trash2 class="h-4 w-4" />
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar Tercero' : 'Nuevo Tercero' }}
        </h1>
        <v-btn variant="text" icon @click="closeList">
          <X class="h-5 w-5" />
        </v-btn>
      </div>
      <CreateThirdParty
        :item="selected"
        :kind="kindFilter as any"
        @close="closeList"
        @created="closeList"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import AppDataTable from '@/components/common/AppDataTable.vue'
import CreateView from './create/index.vue'
import { brandsService } from '@/services'
import { ref } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Power, Tag, X } from 'lucide-vue-next'

defineOptions({
  name: 'InventoryBrandsPage',
})

interface BrandItem {
  id: string
  name?: string
  isActive?: boolean
  createdAt?: string
  [key: string]: unknown
}

const { can } = usePermissions()
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<BrandItem | null>(null)
const tableRef = ref<InstanceType<typeof AppDataTable> | null>(null)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Activo', key: 'isActive', align: 'center' as const },
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

function openCreate() {
  selected.value = null
  mode.value = 'create'
}
function openEdit(item: BrandItem) {
  selected.value = item
  mode.value = 'edit'
}
function closeList() {
  mode.value = 'list'
  selected.value = null
  tableRef.value?.reload()
}
async function toggle(item: BrandItem) {
  try {
    await brandsService.toggleActive(item.id)
    tableRef.value?.reload()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al cambiar estado'
    alert(msg)
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2"><Tag class="h-6 w-6" /> Marcas</h1>
        <v-btn v-if="can('inventory:brands:create')" color="primary" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <AppDataTable ref="tableRef" :headers="headers" :fetch-fn="brandsService.list">
        <template #[`item.isActive`]="{ item }"
          ><v-chip :color="item.isActive ? 'success' : 'error'" size="small">{{
            item.isActive ? 'Activo' : 'Inactivo'
          }}</v-chip></template
        >
        <template #[`item.createdAt`]="{ item }">{{
          item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'
        }}</template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="can('inventory:brands:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
              ><Pencil class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('inventory:brands:state')"
              icon
              size="x-small"
              variant="text"
              @click="toggle(item)"
              ><Power class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ mode === 'edit' ? 'Editar' : 'Crear' }} Marcas</h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

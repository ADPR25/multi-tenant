<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateAdjustment from './create/index.vue'
import { adjustmentsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Check, Ban, Trash2, SlidersHorizontal, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create'>('list')
const statusFilter = ref('')
const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobado', value: 'approved' },
  { label: 'Anulado', value: 'voided' },
]

const headers = [
  { title: 'Producto', key: 'product' },
  { title: 'Bodega', key: 'warehouse' },
  { title: 'Tipo', key: 'type', align: 'center' as const },
  { title: 'Cantidad', key: 'quantity', align: 'center' as const },
  { title: 'Estado', key: 'status', align: 'center' as const },
  { title: 'Razón', key: 'reason' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try { const res = await adjustmentsService.list({ status: statusFilter.value || undefined }); items.value = Array.isArray(res)? res : (res as any).data || [] } finally { loading.value = false }
}
function openCreate() { mode.value = 'create' }
async function approve(item: any) { if (confirm('¿Aprobar ajuste? Afectará kardex e inventario')) { await adjustmentsService.approve(item.id); traer() } }
async function voidItem(item: any) { if (confirm('¿Anular ajuste?')) { await adjustmentsService.void(item.id); traer() } }
async function removeItem(item: any) { if (confirm('¿Eliminar?')) { await adjustmentsService.remove(item.id); traer() } }
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <SlidersHorizontal class="h-6 w-6 text-gray-500" /> Ajustes
        </h1>
        <v-btn v-if="can('inventory:adjustments:create')" color="success" @click="openCreate"><Plus class="h-4 w-4 mr-2" /> Crear</v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex flex-wrap gap-3 mb-6">
          <v-select v-model="statusFilter" :items="statusOptions" item-title="label" item-value="value" density="compact" variant="outlined" hide-details class="w-full sm:max-w-" label="Estado" @update:modelValue="traer" />
          <v-text-field v-model="search" placeholder="Buscar..." variant="outlined" density="compact" hide-details class="w-full sm:max-w-sm ml-auto" />
        </div>
        <div class="w-full overflow-x-auto rounded-xl border">
          <v-data-table :headers="headers" :items="items" :search="search" :loading="loading" :items-per-page="10" density="comfortable" class="bg-transparent" item-value="id">
            <template #item.type="{ item }"><v-chip :color="item.type==='overage'?'info':item.type==='shortage'?'warning': 'error'" size="small" variant="tonal">{{ item.type }}</v-chip></template>
            <template #item.status="{ item }"><v-chip :color="item.status==='pending'?'warning':item.status==='approved'?'success':'default'" size="small" variant="tonal">{{ item.status }}</v-chip></template>
            <template #item.product="{ item }">{{ item.product?.name || item.productId }}</template>
            <template #item.warehouse="{ item }">{{ item.warehouse?.name || item.warehouseId }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn v-if="can('inventory:adjustments:update') && item.status === 'pending'" icon size="x-small" variant="text" color="success" @click="approve(item)"><Check class="h-4 w-4" /></v-btn>
                <v-btn v-if="can('inventory:adjustments:update') && item.status === 'pending'" icon size="x-small" variant="text" color="warning" @click="voidItem(item)"><Ban class="h-4 w-4" /></v-btn>
                <v-btn v-if="can('inventory:adjustments:delete')" icon size="x-small" variant="text" color="error" @click="removeItem(item)"><Trash2 class="h-4 w-4" /></v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">Nuevo Ajuste</h1>
        <v-btn variant="text" icon @click="mode = 'list'"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateAdjustment @close="mode = 'list'; traer()" @created="mode = 'list'; traer()" />
    </div>
  </AdminLayout>
</template>
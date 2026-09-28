<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateSale from './create/index.vue'
import { salesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Eye, Check, Ban, Trash2, TrendingUp, Plus, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'detail'>('list')
const selected = ref<any>(null)
const headers = [
  { title: 'Número', key: 'number' },
  { title: 'Cliente', key: 'customer' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'status', align: 'center' as const },
  { title: 'Fecha', key: 'date' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]
async function traer() {
  loading.value = true
  try {
    const res = await salesService.list()
    items.value = Array.isArray(res)? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function closeList() {
  mode.value = 'list'
  traer()
}
function openDetail(item: any) {
  selected.value = item
  mode.value = 'detail'
}
async function complete(item: any) {
  if (confirm('¿Completar venta?')) {
    await salesService.complete(item.id)
    traer()
  }
}
async function cancel(item: any) {
  if (confirm('¿Cancelar venta?')) {
    await salesService.cancel(item.id)
    traer()
  }
}
async function removeItem(item: any) {
  if (confirm('¿Eliminar?')) {
    await salesService.remove(item.id)
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
          <TrendingUp class="h-6 w-6 text-gray-500" /> Ventas
        </h1>
        <v-btn v-if="can('inventory:sales:create')" color="success" @click="mode = 'create'">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar..."
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
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'completed'? 'success' : item.status === 'draft'? 'default' : 'error'"
                size="small"
                variant="tonal"
              >{{ item.status }}</v-chip>
            </template>
            <template #item.customer="{ item }">{{ item.customer?.name }}</template>
            <template #item.total="{ item }">{{ Number(item.total).toLocaleString() }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn icon size="x-small" variant="text" @click="openDetail(item)"><Eye class="h-4 w-4" /></v-btn>
                <v-btn
                  v-if="item.status === 'draft' && can('inventory:sales:update')"
                  icon size="x-small" variant="text" color="success"
                  @click="complete(item)"
                ><Check class="h-4 w-4" /></v-btn>
                <v-btn
                  v-if="item.status !== 'cancelled' && can('inventory:sales:update')"
                  icon size="x-small" variant="text" color="warning"
                  @click="cancel(item)"
                ><Ban class="h-4 w-4" /></v-btn>
                <v-btn
                  v-if="item.status !== 'completed' && can('inventory:sales:delete')"
                  icon size="x-small" variant="text" color="error"
                  @click="removeItem(item)"
                ><Trash2 class="h-4 w-4" /></v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'detail'? 'Detalle Venta' : 'Nueva Venta' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateSale
        :item="selected"
        :mode="mode"
        @close="closeList"
        @created="closeList"
      />
    </div>
  </AdminLayout>
</template>
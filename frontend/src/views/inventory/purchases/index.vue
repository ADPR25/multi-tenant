<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreatePurchase from './create/index.vue'
import { purchasesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Eye, Check, Trash2, ShoppingCart, Plus, X, Ban } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'detail'>('list')
const selected = ref<any>(null)
const headers = [
  { title: 'Número', key: 'number' },
  { title: 'Proveedor', key: 'provider' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'status', align: 'center' as const },
  { title: 'Fecha', key: 'date' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]
async function traer() {
  loading.value = true
  try {
    const res = await purchasesService.list()
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function closeList() {
  mode.value = 'list'
  traer()
}
async function cancel(item: any) {
  if (confirm('¿Cancelar compra?')) {
    await purchasesService.cancel(item.id)
    traer()
  }
}
function openDetail(item: any) {
  selected.value = item
  mode.value = 'detail'
}
async function receive(item: any) {
  if (confirm('¿Recibir compra? Sumará stock')) {
    await purchasesService.receive(item.id)
    traer()
  }
}
async function removeItem(item: any) {
  if (confirm('¿Eliminar?')) {
    await purchasesService.remove(item.id)
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
          <ShoppingCart class="h-6 w-6 text-gray-500" /> Compras
        </h1>
        <v-btn v-if="can('inventory:purchases:create')" color="success" @click="mode = 'create'">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar por número..."
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
                :color="
                  item.status === 'received'
                    ? 'success'
                    : item.status === 'draft'
                      ? 'default'
                      : 'error'
                "
                size="small"
                variant="tonal"
                >{{ item.status }}</v-chip
              >
            </template>
            <template #item.provider="{ item }">{{ item.provider?.name }}</template>
            <template #item.total="{ item }">{{ Number(item.total).toLocaleString() }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn icon size="x-small" variant="text" @click="openDetail(item)"
                  ><Eye class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="item.status === 'draft' && can('inventory:purchases:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="success"
                  @click="receive(item)"
                  ><Check class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="item.status === 'draft' && can('inventory:purchases:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="cancel(item)"
                  ><Ban class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="item.status !== 'received' && can('inventory:purchases:delete')"
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
          {{ mode === 'detail' ? 'Detalle Compra' : 'Nueva Compra' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreatePurchase :item="selected" :mode="mode" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

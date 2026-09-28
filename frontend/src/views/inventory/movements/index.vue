<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateMovement from './create/index.vue'
import { movementsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Eye, Check, Trash2, ArrowLeftRight, Plus, X, Ban } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'detail'>('list')
const selected = ref<any>(null)
const headers = [
  { title: 'Número', key: 'number' },
  { title: 'Origen', key: 'sourceWarehouse' },
  { title: 'Destino', key: 'destinationWarehouse' },
  { title: 'Estado', key: 'status', align: 'center' as const },
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]
async function traer() {
  loading.value = true
  try {
    const res = await movementsService.list()
    items.value = Array.isArray(res) ? res : (res as any).data || []
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
async function approve(item: any) {
  if (confirm('¿Aprobar traslado?')) {
    await movementsService.approve(item.id)
    traer()
  }
}
async function cancel(item: any) {
  if (confirm('¿Cancelar traslado?')) {
    await movementsService.cancel(item.id)
    traer()
  }
}
async function removeItem(item: any) {
  if (confirm('¿Eliminar?')) {
    await movementsService.remove(item.id)
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
          <ArrowLeftRight class="h-6 w-6 text-gray-500" /> Movimientos
        </h1>
        <v-btn v-if="can('inventory:movements:create')" color="success" @click="mode = 'create'">
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
                  item.status === 'approved'
                    ? 'success'
                    : item.status === 'draft'
                      ? 'default'
                      : 'warning'
                "
                size="small"
                variant="tonal"
                >{{ item.status }}</v-chip
              >
            </template>
            <template #item.sourceWarehouse="{ item }">{{ item.sourceWarehouse?.name }}</template>
            <template #item.destinationWarehouse="{ item }">{{
              item.destinationWarehouse?.name
            }}</template>
            <template #item.createdAt="{ item }">{{
              new Date(item.createdAt).toLocaleDateString()
            }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn icon size="x-small" variant="text" @click="openDetail(item)"
                  ><Eye class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="item.status === 'draft' && can('inventory:movements:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="success"
                  @click="approve(item)"
                  ><Check class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="
                    item.status !== 'approved' &&
                    item.status !== 'cancelled' &&
                    can('inventory:movements:update')
                  "
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="cancel(item)"
                  ><Ban class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="item.status !== 'approved' && can('inventory:movements:delete')"
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
          {{ mode === 'detail' ? 'Detalle Traslado' : 'Nuevo Traslado' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateMovement :item="selected" :mode="mode" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

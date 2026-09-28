<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted, reactive } from 'vue'
import { inventoryService } from '@/services'
import { productsService, wineriesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Pencil, Trash2, Package, Filter, X, Plus } from 'lucide-vue-next'
import CreateStock from './create/index.vue'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create'>('list')
const filters = reactive({ bodegaId: null as any, productId: null as any, lote: '' })
const warehouses = ref<any[]>([])
const products = ref<any[]>([])
const editItem = ref<any>(null)
const editForm = ref<any>({ lote: '', serie: '', ubicacionFisica: '' })

const headers = [
  { title: 'Bodega', key: 'bodega' },
  { title: 'Producto', key: 'product' },
  { title: 'Variante', key: 'variant' },
  { title: 'Lote', key: 'lote' },
  { title: 'Cantidad', key: 'cantidad', align: 'center' as const },
  { title: 'Ubicación', key: 'ubicacionFisica' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await inventoryService.list({
      bodegaId: filters.bodegaId || undefined,
      productId: filters.productId || undefined,
      lote: filters.lote || undefined,
    })
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function closeList() {
  mode.value = 'list'
  traer()
}
function openEdit(item: any) {
  editItem.value = item
  editForm.value = {
    lote: item.lote || '',
    serie: item.serie || '',
    ubicacionFisica: item.ubicacionFisica || '',
  }
}
async function saveEdit() {
  try {
    await inventoryService.update(editItem.value.id, editForm.value)
    editItem.value = null
    traer()
  } catch (e: any) {
    alert(e.message)
  }
}
async function removeItem(item: any) {
  if (confirm(`¿Borrar stock con ${item.cantidad} unidades? Solo si es 0`)) {
    try {
      await inventoryService.remove(item.id)
      traer()
    } catch (e: any) {
      alert(e.message)
    }
  }
}
onMounted(async () => {
  traer()
  try {
    const w = await wineriesService.list()
    warehouses.value = Array.isArray(w) ? w : (w as any).data || []
  } catch {}
  try {
    const p = await productsService.list()
    products.value = Array.isArray(p) ? p : (p as any).data || []
  } catch {}
})
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Package class="h-6 w-6 text-gray-500" /> Stock
        </h1>
        <v-btn v-if="can('inventory:inventory:create')" color="success" @click="mode = 'create'">
          <Plus class="h-4 w-4 mr-2" /> Crear Stock Inicial
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex flex-wrap gap-3 mb-6">
          <v-autocomplete
            v-model="filters.bodegaId"
            :items="warehouses"
            item-title="name"
            item-value="id"
            placeholder="Bodega"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="w-full sm:max-w-"
            @update:modelValue="traer"
          />
          <v-autocomplete
            v-model="filters.productId"
            :items="products"
            item-title="name"
            item-value="id"
            placeholder="Producto"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="w-full sm:max-w-"
            @update:modelValue="traer"
          />
          <v-text-field
            v-model="filters.lote"
            placeholder="Lote"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="w-full sm:max-w-"
            @keyup.enter="traer"
          />
          <v-btn color="secondary" variant="tonal" @click="traer">
            <Filter class="h-4 w-4 mr-2" />Filtrar
          </v-btn>
          <v-text-field
            v-model="search"
            placeholder="Buscar..."
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
            <template #item.product="{ item }">{{ item.product?.name }}</template>
            <template #item.bodega="{ item }">{{ item.bodega?.name }}</template>
            <template #item.variant="{ item }">{{ item.variant?.sku || '-' }}</template>
            <template #item.cantidad="{ item }">
              <v-chip color="primary" size="small" variant="tonal">{{ item.cantidad }}</v-chip>
            </template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('inventory:inventory:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                >
                  <Pencil class="h-4 w-4" />
                </v-btn>
                <v-btn
                  v-if="can('inventory:inventory:delete')"
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
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">Nuevo Stock</h1>
        <v-btn variant="text" icon @click="closeList">
          <X class="h-5 w-5" />
        </v-btn>
      </div>
      <CreateStock @close="closeList" @created="closeList" />
    </div>

    <div
      v-if="editItem"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold">Editar Stock - {{ editItem.product?.name }}</h3>
          <v-btn icon size="small" variant="text" @click="editItem = null">
            <X class="h-4 w-4" />
          </v-btn>
        </div>
        <v-form @submit.prevent="saveEdit">
          <v-text-field
            v-model="editForm.lote"
            label="Lote"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model="editForm.serie"
            label="Serie"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model="editForm.ubicacionFisica"
            label="Ubicación Física"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <div class="flex justify-end gap-2 mt-4">
            <v-btn variant="text" @click="editItem = null">Cancelar</v-btn>
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </AdminLayout>
</template>

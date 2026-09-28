<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateVariant from './create/index.vue'
import { productVariantsService, productsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Trash2, Layers, X, Filter } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const products = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const productFilter = ref('')
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<any>(null)

const headers = [
  { title: 'Producto', key: 'product' },
  { title: 'SKU', key: 'sku' },
  { title: 'Talla / Color', key: 'attrs' },
  { title: 'Presentación', key: 'presentation' },
  { title: 'P. Compra', key: 'purchasePrice', align: 'end' as const },
  { title: 'P. Venta', key: 'salePrice', align: 'end' as const },
  { title: 'Stock Min', key: 'minStock', align: 'center' as const },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await productVariantsService.list({
      productId: productFilter.value || undefined,
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
  selected.value = null
  traer()
}
async function removeItem(item: any) {
  if (confirm(`¿Eliminar variante ${item.sku}?`)) {
    try {
      await productVariantsService.remove(item.id)
      traer()
    } catch (e: any) {
      alert(e.message)
    }
  }
}
onMounted(async () => {
  traer()
  try {
    const r = await productsService.list()
    products.value = Array.isArray(r) ? r : (r as any).data || []
  } catch {}
})
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Layers class="h-6 w-6 text-gray-500" /> Variantes
        </h1>
        <v-btn v-if="can('inventory:product_variants:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex flex-wrap gap-3 mb-6">
          <v-autocomplete
            v-model="productFilter"
            :items="products"
            item-title="name"
            item-value="id"
            placeholder="Filtrar por producto"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="w-full sm:max-w-xs"
            @update:modelValue="traer"
          />
          <v-btn variant="tonal" @click="traer"><Filter class="h-4 w-4 mr-2" />Filtrar</v-btn>
          <v-text-field
            v-model="search"
            placeholder="Buscar por SKU, color, talla..."
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
            <template #item.product="{ item }">{{ item.product?.name || item.productId }}</template>
            <template #item.attrs="{ item }">{{
              [item.size, item.color].filter(Boolean).join(' / ') || '-'
            }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('inventory:product_variants:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                  ><Pencil class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="can('inventory:product_variants:delete')"
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
          {{ mode === 'edit' ? 'Editar Variante' : 'Nueva Variante' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateVariant :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

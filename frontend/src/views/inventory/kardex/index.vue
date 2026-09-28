<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted, reactive } from 'vue'
import { kardexService, wineriesService, productsService } from '@/services'
import { ClipboardList } from 'lucide-vue-next'

const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filters = reactive({ bodegaId: null as any, productId: null as any, tipo: null as any })
const warehouses = ref<any[]>([])
const products = ref<any[]>([])
const tipoOptions = [
  { title: 'Entrada', value: 'inbound' },
  { title: 'Salida', value: 'outbound' },
]
const headers = [
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Bodega', key: 'bodega' },
  { title: 'Producto', key: 'product' },
  { title: 'Tipo', key: 'movementType', align: 'center' as const },
  { title: 'Cant', key: 'cantidad', align: 'center' as const },
  { title: 'Saldo', key: 'saldo', align: 'center' as const },
  { title: 'Documento', key: 'documentoRef' },
  { title: 'Observación', key: 'observacion' },
]
async function traer() {
  loading.value = true
  try {
    const res = await kardexService.list({
      bodegaId: filters.bodegaId || undefined,
      productId: filters.productId || undefined,
      tipo: filters.tipo || undefined,
    })
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  traer()
  try {
    const r = await wineriesService.list()
    warehouses.value = Array.isArray(r) ? r : (r as any).data || []
  } catch {}
  try {
    const r = await productsService.list()
    products.value = Array.isArray(r) ? r : (r as any).data || []
  } catch {}
})
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <ClipboardList class="h-6 w-6 text-gray-500" /> Kardex
      </h1>
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <div class="flex flex-wrap gap-3 mb-6">
        <v-autocomplete
          v-model="filters.bodegaId"
          :items="warehouses"
          item-title="name"
          item-value="id"
          label="Bodega"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="w-full sm:max-w-[200px]"
          @update:modelValue="traer"
        />
        <v-autocomplete
          v-model="filters.productId"
          :items="products"
          item-title="name"
          item-value="id"
          label="Producto"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="w-full sm:max-w-[200px]"
          @update:modelValue="traer"
        />
        <v-select
          v-model="filters.tipo"
          :items="tipoOptions"
          label="Tipo"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="w-full sm:max-w-[150px]"
          @update:modelValue="traer"
        />
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
        >
          <template #item.movementType="{ item }"
            ><v-chip
              :color="item.movementType === 'inbound' ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              >{{ item.movementType }}</v-chip
            ></template
          >
          <template #item.product="{ item }">{{ item.product?.name || item.productId }}</template>
          <template #item.bodega="{ item }">{{ item.bodega?.name || item.bodegaId }}</template>
          <template #item.createdAt="{ item }">{{
            new Date(item.createdAt).toLocaleString()
          }}</template>
        </v-data-table>
      </div>
    </div>
  </AdminLayout>
</template>

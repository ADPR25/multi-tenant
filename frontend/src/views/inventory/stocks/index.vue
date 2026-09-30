<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import AppDataTable from '@/components/common/AppDataTable.vue'
import { stocksService } from '@/services'
import { Boxes, Eye, X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { ref, computed } from 'vue'

const tableRef = ref<InstanceType<typeof AppDataTable>>()
const detailOpen = ref(false)
const detailItem = ref<any>(null)
const lastItems = ref<any[]>([])

function getStockStatus(item: any) {
  const qty = Number(item.quantity)
  const min = Number(item.product?.min_stock ?? 0)
  if (qty <= 0) return { label: 'Agotado', color: 'error', icon: AlertCircle, level: 3 }
  if (qty <= min) return { label: 'Stock Bajo', color: 'error', icon: AlertTriangle, level: 2 }
  if (min > 0 && qty <= min * 1.2)
    return { label: 'Por Agotar', color: 'warning', icon: AlertTriangle, level: 1 }
  return { label: 'OK', color: 'success', icon: CheckCircle, level: 0 }
}

const lowCount = computed(
  () =>
    lastItems.value.filter((i) => {
      const s = getStockStatus(i)
      return s.level >= 1
    }).length,
)

const criticalCount = computed(
  () =>
    lastItems.value.filter((i) => {
      const s = getStockStatus(i)
      return s.level >= 2
    }).length,
)

async function fetchWrapper(params: any) {
  const res: any = await stocksService.list(params)
  const data = res.data || res || []
  lastItems.value = data
  return res
}

function openDetail(item: any) {
  detailItem.value = item
  detailOpen.value = true
}

const headers = [
  { title: 'Producto', key: 'product', sortable: false },
  { title: 'Bodega', key: 'warehouse', sortable: false },
  { title: 'Cantidad', key: 'quantity', align: 'center' as const, width: '110px' },
  { title: 'Minimo', key: 'min_stock', align: 'center' as const, width: '110px' },
  { title: 'Estado', key: 'status', align: 'center' as const, sortable: false, width: '130px' },
  { title: '', key: 'actions', align: 'end' as const, sortable: false, width: '60px' },
]
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <Boxes class="h-6 w-6" /> Stock Actual
      </h1>
    </div>

    <div v-if="lastItems.length" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <div
        v-if="criticalCount > 0"
        class="flex items-center gap-3 p-4 rounded-2xl border bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300"
      >
        <div
          class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center"
        >
          <AlertCircle class="h-5 w-5" />
        </div>
        <div>
          <p class="font-bold">{{ criticalCount }} productos críticos</p>
          <p class="text-xs opacity-80">Por debajo del mínimo o agotados</p>
        </div>
      </div>
      <div
        v-if="lowCount - criticalCount > 0"
        class="flex items-center gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
      >
        <div
          class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center"
        >
          <AlertTriangle class="h-5 w-5" />
        </div>
        <div>
          <p class="font-bold">{{ lowCount - criticalCount }} por agotarse</p>
          <p class="text-xs opacity-80">A menos del 20% sobre el mínimo</p>
        </div>
      </div>
      <div
        v-if="lowCount === 0"
        class="flex items-center gap-3 p-4 rounded-2xl border bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-300"
      >
        <div
          class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle class="h-5 w-5" />
        </div>
        <div>
          <p class="font-bold">Stock estable</p>
          <p class="text-xs opacity-80">Todo por encima del mínimo</p>
        </div>
      </div>
    </div>

    <AppDataTable
      ref="tableRef"
      :headers="headers"
      :fetch-fn="fetchWrapper"
      search-placeholder="Buscar producto, bodega..."
    >
      <template #item.product="{ item }">
        <div class="leading-tight">
          <p class="font-medium text-gray-800 dark:text-white/90">
            {{ item.product?.name || item.productId }}
          </p>
          <p class="text-xs text-gray-500">
            {{ item.product?.sku }} • Min: {{ item.product?.min_stock }}
          </p>
        </div>
      </template>
      <template #item.warehouse="{ item }">
        <div class="leading-tight">
          <p class="text-sm">{{ item.warehouse?.name || item.warehouseId }}</p>
          <p class="text-xs text-gray-500">{{ item.warehouse?.code }}</p>
        </div>
      </template>
      <template #item.quantity="{ item }">
        <span
          class="font-bold text-base"
          :class="{ 'text-red-600': Number(item.quantity) <= Number(item.product?.min_stock) }"
        >
          {{ Number(item.quantity).toString() }}
        </span>
      </template>
      <template #item.min_stock="{ item }">
        <span class="font-bold text-base">
          {{ Number(item.product.min_stock).toString() }}
        </span>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="getStockStatus(item).color" size="small" variant="tonal">
          {{ getStockStatus(item).label }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon size="x-small" variant="text" color="primary" @click="openDetail(item)">
          <Eye class="h-4 w-4" />
        </v-btn>
      </template>
    </AppDataTable>

    <v-dialog v-model="detailOpen" max-width="600" scrollable>
      <v-card v-if="detailItem" class="rounded-2xl">
        <v-card-title class="flex items-center justify-between p-6 pb-2">
          <span class="text-lg font-bold flex items-center gap-2">
            <Boxes class="h-5 w-5" /> Detalle Stock
          </span>
          <v-btn variant="text" icon size="small" @click="detailOpen = false"
            ><X class="h-4 w-4"
          /></v-btn>
        </v-card-title>
        <v-card-text class="p-6 pt-2">
          <div class="space-y-4">
            <div
              v-if="getStockStatus(detailItem).level >= 2"
              class="p-3 rounded-xl flex gap-2 bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              <AlertCircle class="h-5 w-5 shrink-0" />
              <span
                >Este producto está
                <strong>{{ getStockStatus(detailItem).label.toLowerCase() }}</strong
                >. Cantidad actual {{ detailItem.quantity }} es menor o igual al mínimo
                {{ detailItem.product?.min_stock }}.</span
              >
            </div>
            <div
              v-else-if="getStockStatus(detailItem).level === 1"
              class="p-3 rounded-xl flex gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm"
            >
              <AlertTriangle class="h-5 w-5 shrink-0" />
              <span
                >Este producto está <strong>por agotarse</strong>. Quedan
                {{ detailItem.quantity }} y el mínimo es {{ detailItem.product?.min_stock }}.</span
              >
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.05] border">
                <p class="text-xs text-gray-500 uppercase">Producto</p>
                <p class="font-semibold text-base">{{ detailItem.product?.name }}</p>
                <p class="text-xs text-gray-500">
                  SKU: {{ detailItem.product?.sku }} | {{ detailItem.product?.description }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Costo / Precio</p>
                <p class="font-medium">
                  ${{ detailItem.product?.cost }} / ${{ detailItem.product?.price }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Bodega</p>
                <p class="font-medium">
                  {{ detailItem.warehouse?.name }} ({{ detailItem.warehouse?.code }})
                </p>
                <p class="text-xs text-gray-500">{{ detailItem.warehouse?.address }}</p>
              </div>
              <div class="col-span-2 grid grid-cols-3 gap-2 p-3 rounded-xl border text-center">
                <div>
                  <p class="text-xs text-gray-500">Actual</p>
                  <p class="font-bold text-xl">{{ detailItem.quantity }}</p>
                </div>
                <div class="flex items-center justify-center text-gray-300">/</div>
                <div>
                  <p class="text-xs text-gray-500">Mínimo</p>
                  <p class="font-bold text-xl">{{ detailItem.product?.min_stock }}</p>
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Estado</p>
                <v-chip :color="getStockStatus(detailItem).color" size="small" class="mt-1">{{
                  getStockStatus(detailItem).label
                }}</v-chip>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Actualizado</p>
                <p>{{ new Date(detailItem.updatedAt).toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="p-4">
          <v-spacer />
          <v-btn variant="tonal" @click="detailOpen = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

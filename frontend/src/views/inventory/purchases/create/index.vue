<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  purchasesService,
  thirdPartiesService,
  wineriesService,
  branchesService,
  productsService,
  productVariantsService,
} from '@/services'
import { Save, X, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{ item?: any; mode?: string }>()
const emit = defineEmits(['close', 'created'])
const formRef = ref()
const saving = ref(false)
const providers = ref<any[]>([])
const warehouses = ref<any[]>([])
const branches = ref<any[]>([])
const products = ref<any[]>([])
const variantsMap = ref<Record<string, any[]>>({})

const form = ref<any>({
  providerId: '',
  branchId: null,
  warehouseId: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
  items: [{ productId: '', variantId: null, quantity: 1, unitPrice: 0, tax: 0, lot: '' }],
})

function addItem() {
  form.value.items.push({
    productId: '',
    variantId: null,
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    lot: '',
  })
}
function getVariants(pid: string) {
  return variantsMap.value[pid] || []
}
function getProduct(pid: string) {
  return products.value.find((p: any) => p.id === pid)
}

async function loadVar(item: any) {
  const pid = item.productId
  if (!pid) return
  item.variantId = null
  // AUTO-FILL desde producto
  const prod = getProduct(pid)
  if (prod) {
    item.unitPrice = prod.purchase_price || 0
    item.tax = prod.tax || 0
    // lote automatico sugerido si está vacío
    if (!item.lot)
      item.lot = `LOTE-${prod.sku || 'GEN'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  }
  if (variantsMap.value[pid]) return
  try {
    const res = await productVariantsService.list({ productId: pid })
    variantsMap.value[pid] = Array.isArray(res) ? res : (res as any).data || []
  } catch {}
}

function onVariantChange(item: any) {
  if (!item.variantId) {
    const prod = getProduct(item.productId)
    if (prod) {
      item.unitPrice = prod.purchase_price
      item.tax = prod.tax
    }
    return
  }
  // Si tiene variante, usa precio de variante
  const variant = getVariants(item.productId).find((v: any) => v.id === item.variantId)
  if (variant) {
    if (variant.purchasePrice) item.unitPrice = variant.purchasePrice
    if (variant.tax !== undefined) item.tax = variant.tax
    if (variant.barcode && !item.lot) item.lot = variant.sku
  }
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      ...form.value,
      branchId: form.value.branchId || undefined,
      items: form.value.items.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId || undefined,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        tax: Number(i.tax || 0),
        lot: i.lot || undefined,
      })),
    }
    await purchasesService.create(payload)
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
async function receiveDetail() {
  if (confirm('¿Recibir compra? Sumará stock')) {
    await purchasesService.receive(props.item.id)
    emit('close')
  }
}
onMounted(async () => {
  try {
    const res = await thirdPartiesService.list({ kind: 'PROVEEDOR' })
    providers.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    try {
      const res2 = await thirdPartiesService.list()
      providers.value = (Array.isArray(res2) ? res2 : (res2 as any).data || []).filter((p: any) =>
        p.kinds?.includes('PROVEEDOR'),
      )
    } catch {}
  }
  try {
    const w = await wineriesService.list()
    warehouses.value = Array.isArray(w) ? w : (w as any).data || []
  } catch {}
  try {
    const b = await branchesService.list()
    branches.value = Array.isArray(b) ? b : (b as any).data || []
  } catch {}
  try {
    const p = await productsService.list()
    products.value = Array.isArray(p) ? p : (p as any).data || []
  } catch {}
})
</script>

<template>
  <div v-if="mode === 'detail' && item" class="rounded-2xl border bg-white p-6">
    <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
      <div><b>Proveedor:</b> {{ item.provider?.name }}</div>
      <div><b>Bodega:</b> {{ item.warehouse?.name }}</div>
      <div><b>Total:</b> {{ item.total }}</div>
      <div>
        <b>Estado:</b> <v-chip size="small" variant="tonal">{{ item.status }}</v-chip>
      </div>
    </div>
    <div class="w-full overflow-x-auto rounded-xl border">
      <v-data-table
        :headers="[
          { title: 'Prod', key: 'product.name' },
          { title: 'Cant', key: 'quantity' },
          { title: 'P.Unit', key: 'unitPrice' },
          { title: 'Total', key: 'total' },
        ]"
        :items="item.details || []"
        density="compact"
        class="bg-transparent"
      />
    </div>
    <div v-if="item.status === 'draft'" class="mt-4 flex justify-end">
      <v-btn color="success" @click="receiveDetail">Recibir y sumar stock</v-btn>
    </div>
  </div>
  <div
    v-else
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" sm="6" md="4"
          ><v-label>Proveedor *</v-label
          ><v-autocomplete
            v-model="form.providerId"
            :items="providers"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
        /></v-col>
        <v-col cols="12" sm="6" md="4"
          ><v-label>Bodega *</v-label
          ><v-autocomplete
            v-model="form.warehouseId"
            :items="warehouses"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
        /></v-col>
        <v-col cols="12" sm="6" md="2"
          ><v-label>Sucursal</v-label
          ><v-autocomplete
            v-model="form.branchId"
            :items="branches"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            clearable
        /></v-col>
        <v-col cols="12" sm="6" md="2"
          ><v-label>Fecha</v-label
          ><v-text-field v-model="form.date" type="date" density="comfortable" variant="outlined"
        /></v-col>
        <v-col cols="12"
          ><v-label>Notas</v-label
          ><v-textarea v-model="form.notes" density="comfortable" variant="outlined" rows="2"
        /></v-col>
      </v-row>
      <div class="mt-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold">Productos (precio e impuesto se autollenan)</h4>
          <v-btn size="small" variant="tonal" @click="addItem"
            ><Plus class="h-4 w-4 mr-1" /> Item</v-btn
          >
        </div>
        <div
          v-for="(it, idx) in form.items"
          :key="idx"
          class="grid grid-cols-12 gap-2 mb-3 items-end"
        >
          <div class="col-span-3">
            <v-label>Producto</v-label
            ><v-autocomplete
              v-model="it.productId"
              :items="products"
              item-title="name"
              item-value="id"
              density="comfortable"
              variant="outlined"
              hide-details
              @update:modelValue="loadVar(it)"
            />
          </div>
          <div class="col-span-2">
            <v-label>Variante</v-label
            ><v-autocomplete
              v-model="it.variantId"
              :items="getVariants(it.productId)"
              item-title="sku"
              item-value="id"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
              :disabled="!it.productId"
              @update:modelValue="onVariantChange(it)"
            />
          </div>
          <div class="col-span-1">
            <v-label>Cant</v-label
            ><v-text-field
              v-model.number="it.quantity"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-label>P.Unit (auto)</v-label
            ><v-text-field
              v-model.number="it.unitPrice"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-1">
            <v-label>Imp% (auto)</v-label
            ><v-text-field
              v-model.number="it.tax"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-label>Lote (auto)</v-label
            ><v-text-field v-model="it.lot" density="comfortable" variant="outlined" hide-details />
          </div>
          <div class="col-span-1">
            <v-btn icon size="small" variant="text" color="error" @click="form.items.splice(idx, 1)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </div>
      </div>
      <div class="flex mt-6">
        <v-btn color="warning" @click="$emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        ><v-spacer /><v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />Crear</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

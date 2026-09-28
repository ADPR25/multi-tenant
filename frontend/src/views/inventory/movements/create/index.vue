<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  movementsService,
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
const branches = ref<any[]>([])
const warehouses = ref<any[]>([])
const products = ref<any[]>([])
const variantsMap = ref<Record<string, any[]>>({})

const form = ref<any>({
  sourceBranchId: null,
  destinationBranchId: null,
  sourceWarehouseId: '',
  destinationWarehouseId: '',
  notes: '',
  items: [{ productId: '', variantId: null, quantity: 1 }],
})

const sourceWarehouses = computed(() => {
  if (!form.value.sourceBranchId) return warehouses.value
  return warehouses.value.filter(
    (w: any) =>
      !w.branchId ||
      w.branchId === form.value.sourceBranchId ||
      w.branch?.id === form.value.sourceBranchId,
  )
})
const destWarehouses = computed(() => {
  if (!form.value.destinationBranchId) return warehouses.value
  return warehouses.value.filter(
    (w: any) =>
      !w.branchId ||
      w.branchId === form.value.destinationBranchId ||
      w.branch?.id === form.value.destinationBranchId,
  )
})

function addItem() {
  form.value.items.push({ productId: '', variantId: null, quantity: 1 })
}
function getVariants(pid: string) {
  return variantsMap.value[pid] || []
}
async function loadVariantsForProduct(pid: string) {
  if (!pid || variantsMap.value[pid]) return
  try {
    const res = await productVariantsService.list({ productId: pid })
    variantsMap.value[pid] = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    variantsMap.value[pid] = []
  }
}
function onProductChange(item: any) {
  item.variantId = null
  loadVariantsForProduct(item.productId)
}
async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  if (form.value.sourceWarehouseId === form.value.destinationWarehouseId) {
    alert('Bodega origen y destino debe ser diferente')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      items: form.value.items.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId || undefined,
        quantity: Number(i.quantity),
      })),
    }
    await movementsService.create(payload)
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
async function approveDetail() {
  if (confirm('¿Aprobar traslado? Descontará de origen y sumará en destino')) {
    await movementsService.approve(props.item.id)
    emit('close')
  }
}

onMounted(async () => {
  try {
    const b = await branchesService.list()
    branches.value = Array.isArray(b) ? b : (b as any).data || []
  } catch {}
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
  <div v-if="mode === 'detail' && item">
    <div class="rounded-2xl border bg-white p-6">
      <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div><b>Número:</b> {{ item.number }}</div>
        <div>
          <b>Estado:</b> <v-chip size="small" variant="tonal">{{ item.status }}</v-chip>
        </div>
        <div><b>Origen:</b> {{ item.sourceWarehouse?.name }}</div>
        <div><b>Destino:</b> {{ item.destinationWarehouse?.name }}</div>
      </div>
      <div class="w-full overflow-x-auto rounded-xl border">
        <v-data-table
          :headers="[
            { title: 'Producto', key: 'product.name' },
            { title: 'Variante', key: 'variant.sku' },
            { title: 'Cantidad', key: 'quantity' },
          ]"
          :items="item.details || []"
          density="compact"
          class="bg-transparent"
        />
      </div>
      <div v-if="item.status === 'draft'" class="mt-4 flex justify-end gap-2">
        <v-btn variant="tonal" @click="$emit('close')">Cerrar</v-btn>
        <v-btn color="success" @click="approveDetail">Aprobar Traslado</v-btn>
      </div>
    </div>
  </div>
  <div
    v-else
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" sm="6"
          ><v-label>Sucursal Origen</v-label
          ><v-autocomplete
            v-model="form.sourceBranchId"
            :items="branches"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            clearable
        /></v-col>
        <v-col cols="12" sm="6"
          ><v-label>Sucursal Destino</v-label
          ><v-autocomplete
            v-model="form.destinationBranchId"
            :items="branches"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            clearable
        /></v-col>
        <v-col cols="12" sm="6"
          ><v-label>Bodega Origen *</v-label
          ><v-autocomplete
            v-model="form.sourceWarehouseId"
            :items="sourceWarehouses"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
        /></v-col>
        <v-col cols="12" sm="6"
          ><v-label>Bodega Destino *</v-label
          ><v-autocomplete
            v-model="form.destinationWarehouseId"
            :items="destWarehouses"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[
              (v: any) => !!v || 'Requerido',
              (v: any) => v !== form.sourceWarehouseId || 'Debe ser diferente',
            ]"
        /></v-col>
        <v-col cols="12"
          ><v-label>Notas</v-label
          ><v-textarea v-model="form.notes" density="comfortable" variant="outlined" rows="2"
        /></v-col>
      </v-row>
      <div class="mt-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-semibold">Items</h4>
          <v-btn size="small" variant="tonal" @click="addItem"
            ><Plus class="h-4 w-4 mr-1" /> Item</v-btn
          >
        </div>
        <div
          v-for="(it, idx) in form.items"
          :key="idx"
          class="grid grid-cols-12 gap-2 mb-2 items-end"
        >
          <div class="col-span-5">
            <v-label>Producto</v-label
            ><v-autocomplete
              v-model="it.productId"
              :items="products"
              item-title="name"
              item-value="id"
              density="comfortable"
              variant="outlined"
              hide-details
              @update:modelValue="onProductChange(it)"
            />
          </div>
          <div class="col-span-3">
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
            />
          </div>
          <div class="col-span-2">
            <v-label>Cant</v-label
            ><v-text-field
              v-model.number="it.quantity"
              type="number"
              :min="1"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-btn icon size="small" variant="text" color="error" @click="form.items.splice(idx, 1)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </div>
      </div>
      <div class="flex mt-6">
        <v-btn color="warning" @click="$emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />Crear Borrador</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

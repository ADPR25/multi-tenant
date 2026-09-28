<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  adjustmentsService,
  productVariantsService,
  wineriesService,
  productsService,
} from '@/services'
import { Save, X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'created'])
const formRef = ref()
const saving = ref(false)
const warehouses = ref<any[]>([])
const products = ref<any[]>([])
const variants = ref<any[]>([])

const form = ref<any>({
  warehouseId: '',
  productId: '',
  variantId: null,
  type: 'overage',
  quantity: 1,
  lote: '',
  serie: '',
  reason: '',
  notes: '',
})

const typeOptions = [
  { title: 'Sobrante (suma stock)', value: 'overage' },
  { title: 'Faltante (resta stock)', value: 'shortage' },
  { title: 'Dañado (resta stock)', value: 'damaged' },
  { title: 'Vencido (resta stock)', value: 'expired' },
]

async function loadWarehouses() {
  try {
    const res = await wineriesService.list()
    warehouses.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {}
}
async function loadProducts() {
  try {
    const res = await productsService.list()
    products.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {}
}
async function loadVariants() {
  if (!form.value.productId) {
    variants.value = []
    form.value.variantId = null
    return
  }
  try {
    const res = await productVariantsService.list({ productId: form.value.productId })
    variants.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {
    variants.value = []
  }
}

watch(
  () => form.value.productId,
  () => {
    form.value.variantId = null
    loadVariants()
  },
)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      warehouseId: form.value.warehouseId,
      productId: form.value.productId,
      variantId: form.value.variantId || undefined,
      type: form.value.type,
      quantity: Number(form.value.quantity),
      lote: form.value.lote || undefined,
      serie: form.value.serie || undefined,
      reason: form.value.reason,
      notes: form.value.notes || undefined,
    }
    await adjustmentsService.create(payload)
    form.value = {
      warehouseId: '',
      productId: '',
      variantId: null,
      type: 'overage',
      quantity: 1,
      lote: '',
      serie: '',
      reason: '',
      notes: '',
    }
    emit('created')
  } catch (e: any) {
    alert(e.message || 'Error')
  } finally {
    saving.value = false
  }
}
onMounted(async () => {
  await Promise.all([loadWarehouses(), loadProducts()])
})
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-label>Bodega *</v-label>
          <v-autocomplete
            v-model="form.warehouseId"
            :items="warehouses"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" sm="6" md="6">
          <v-label>Producto *</v-label>
          <v-autocomplete
            v-model="form.productId"
            :items="products"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-label>Variante (opcional)</v-label>
          <v-autocomplete
            v-model="form.variantId"
            :items="variants"
            item-title="sku"
            item-value="id"
            density="comfortable"
            variant="outlined"
            clearable
            :disabled="!form.productId"
          >
            <template #item="{ props, item }"
              ><v-list-item
                v-bind="props"
                :title="item.raw.sku || item.raw.id"
                :subtitle="`${item.raw.size || ''} ${item.raw.color || ''}`"
            /></template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-label>Tipo *</v-label>
          <v-select
            v-model="form.type"
            :items="typeOptions"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-label>Cantidad *</v-label>
          <v-text-field
            v-model.number="form.quantity"
            type="number"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido', (v: any) => v >= 1 || '>=1']"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-label>Lote</v-label>
          <v-text-field v-model="form.lote" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-label>Serie</v-label>
          <v-text-field v-model="form.serie" density="comfortable" variant="outlined" />
        </v-col>
        <v-col cols="12" md="8">
          <v-label>Motivo *</v-label>
          <v-text-field
            v-model="form.reason"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Notas</v-label>
          <v-textarea v-model="form.notes" density="comfortable" variant="outlined" rows="2" />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />Crear Ajuste</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

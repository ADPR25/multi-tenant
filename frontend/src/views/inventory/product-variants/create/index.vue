<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productVariantsService, productsService } from '@/services'
import { Save, X } from 'lucide-vue-next'

const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])

const formRef = ref()
const saving = ref(false)
const products = ref<any[]>([])

const form = ref<any>({
  productId: props.item?.productId || '',
  size: props.item?.size || '',
  color: props.item?.color || '',
  presentation: props.item?.presentation || '',
  sku: props.item?.sku || '',
  barcode: props.item?.barcode || '',
  purchasePrice: props.item?.purchasePrice || 0,
  salePrice: props.item?.salePrice || 0,
  tax: props.item?.tax ?? 0,
  minStock: props.item?.minStock || 0,
  maxStock: props.item?.maxStock || null,
})

function getProduct(pid: string) {
  return products.value.find((p: any) => p.id === pid)
}

function onProductSelected(pid: string) {
  if (!pid) return
  const prod = getProduct(pid)
  if (!prod) return

  // Solo autollenar si es creación o si los campos están vacíos
  const isNew = !props.item

  if (isNew || !form.value.purchasePrice) {
    form.value.purchasePrice = prod.purchase_price || prod.purchasePrice || 0
  }
  if (isNew || !form.value.salePrice) {
    form.value.salePrice = prod.selling_price || prod.salePrice || 0
  }
  if (isNew || !form.value.tax) {
    form.value.tax = prod.tax || 19
  }
  // SKU automático: SKU-PRODUCTO + TALLA/COLOR
  if (isNew && !form.value.sku) {
    const base = (prod.sku || prod.name || 'PROD')
      .toString()
      .toUpperCase()
      .slice(0, 10)
      .replace(/\s+/g, '-')
    const suffix = Math.floor(100 + Math.random() * 900)
    form.value.sku = `${base}-VAR-${suffix}`
  }
  // Barcode sugerido si no tiene
  if (isNew && !form.value.barcode && prod.sku) {
    form.value.barcode = `${prod.sku}${Date.now().toString().slice(-4)}`
  }
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      productId: form.value.productId,
      size: form.value.size || undefined,
      color: form.value.color || undefined,
      presentation: form.value.presentation || undefined,
      sku: form.value.sku || undefined,
      barcode: form.value.barcode || undefined,
      purchasePrice: form.value.purchasePrice ? Number(form.value.purchasePrice) : undefined,
      salePrice: form.value.salePrice ? Number(form.value.salePrice) : undefined,
      tax: form.value.tax ? Number(form.value.tax) : 0,
      minStock: Number(form.value.minStock) || 0,
      maxStock: form.value.maxStock ? Number(form.value.maxStock) : undefined,
    }
    if (props.item) {
      await productVariantsService.update(props.item.id, payload)
    } else {
      await productVariantsService.create(payload)
    }
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await productsService.list()
    products.value = Array.isArray(res) ? res : (res as any).data || []
  } catch {}
})
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6">
          <v-label>Producto * (al seleccionar autollena precios)</v-label>
          <v-autocomplete
            v-model="form.productId"
            :items="products"
            item-title="name"
            item-value="id"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
            @update:modelValue="onProductSelected"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>SKU * (auto)</v-label>
          <v-text-field
            v-model="form.sku"
            density="comfortable"
            variant="outlined"
            placeholder="Se genera automático"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Código Barras (auto)</v-label>
          <v-text-field
            v-model="form.barcode"
            density="comfortable"
            variant="outlined"
            placeholder="Auto"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-label>Talla</v-label>
          <v-text-field
            v-model="form.size"
            density="comfortable"
            variant="outlined"
            placeholder="M, L, XL"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Color</v-label>
          <v-text-field
            v-model="form.color"
            density="comfortable"
            variant="outlined"
            placeholder="Rojo, Azul..."
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Presentación</v-label>
          <v-text-field
            v-model="form.presentation"
            density="comfortable"
            variant="outlined"
            placeholder="Caja x 12, Botella 500ml"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-label>P. Compra (auto del producto)</v-label>
          <v-text-field
            v-model.number="form.purchasePrice"
            type="number"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>P. Venta (auto del producto)</v-label>
          <v-text-field
            v-model.number="form.salePrice"
            type="number"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-label>Impuesto % (auto)</v-label>
          <v-text-field
            v-model.number="form.tax"
            type="number"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-label>Stock Mín</v-label>
          <v-text-field
            v-model.number="form.minStock"
            type="number"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-label>Stock Máx</v-label>
          <v-text-field
            v-model.number="form.maxStock"
            type="number"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ item ? 'Actualizar' : 'Crear' }} Variante</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

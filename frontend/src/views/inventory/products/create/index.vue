<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { productsService, brandsService, categoriesService } from '@/services'
import { Save, X } from 'lucide-vue-next'

const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])

const formRef = ref()
const saving = ref(false)
const brands = ref<any[]>([])
const categories = ref<any[]>([])

const form = ref<any>({
  brandId: props.item?.brandId || '',
  categoryId: props.item?.categoryId || '',
  name: props.item?.name || '',
  sku: props.item?.sku || '',
  purchase_price: props.item?.purchase_price || 0,
  selling_price: props.item?.selling_price || 0,
  tax: props.item?.tax ?? 19,
  unit_measurement: props.item?.unit_measurement || 'UND',
  image: props.item?.image || '',
  state: props.item?.state ?? true,
})

// AUTO SKU: si es nuevo y escribes nombre, te genera el SKU
watch(
  () => form.value.name,
  (newName) => {
    if (props.item) return // no auto-generar cuando editas
    if (!newName) return
    if (form.value.sku && form.value.sku.length > 2) return // si ya escribió SKU manual, no pisar
    const clean = newName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 12)
    const rand = Math.floor(100 + Math.random() * 900)
    form.value.sku = `${clean}-${rand}`
  },
)

// AUTO MARGEN: si pones compra y venta está en 0, sugiere venta +35%
watch(
  () => form.value.purchase_price,
  (newPrice) => {
    if (props.item) return
    if (!newPrice) return
    if (form.value.selling_price && form.value.selling_price > 0) return
    form.value.selling_price = Math.round(Number(newPrice) * 1.35)
  },
)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      ...form.value,
      purchase_price: Number(form.value.purchase_price),
      selling_price: Number(form.value.selling_price),
      tax: Number(form.value.tax),
    }
    if (props.item) await productsService.update(props.item.id, payload)
    else await productsService.create(payload)
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [b, c] = await Promise.all([
    brandsService.list().catch(() => []),
    categoriesService.list().catch(() => []),
  ])
  brands.value = Array.isArray(b) ? b : (b as any).data || []
  categories.value = Array.isArray(c) ? c : (c as any).data || []
})
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="4"
          ><v-label>Marca *</v-label
          ><v-autocomplete
            v-model="form.brandId"
            :items="brands"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Categoría *</v-label
          ><v-autocomplete
            v-model="form.categoryId"
            :items="categories"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>SKU (auto)</v-label
          ><v-text-field
            v-model="form.sku"
            variant="outlined"
            density="comfortable"
            hint="Se genera solo al escribir el nombre"
            persistent-hint
        /></v-col>
        <v-col cols="12" md="8"
          ><v-label>Nombre *</v-label
          ><v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            placeholder="Ej: Leche Alpina 1L"
            :rules="[(v: any) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>U. Medida *</v-label
          ><v-select
            v-model="form.unit_measurement"
            :items="['UND', 'KG', 'LT', 'M', 'CAJA']"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>P. Compra *</v-label
          ><v-text-field
            v-model.number="form.purchase_price"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>P. Venta * (auto +35%)</v-label
          ><v-text-field
            v-model.number="form.selling_price"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Impuesto % *</v-label
          ><v-text-field
            v-model.number="form.tax"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="8"
          ><v-label>Imagen URL</v-label
          ><v-text-field v-model="form.image" variant="outlined" density="comfortable"
        /></v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="$emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        ><v-spacer /><v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ item ? 'Actualizar' : 'Crear' }}</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

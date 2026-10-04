<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productsService, brandsService, categoriesService, uomService } from '@/services'
import { Save, X } from 'lucide-vue-next'

const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])

const formRef = ref()
const saving = ref(false)
const brands = ref<any[]>([])
const categories = ref<any[]>([])
const uoms = ref<any[]>([])

const form = ref({
  sku: props.item?.sku || '',
  name: props.item?.name || '',
  description: props.item?.description || '',
  brandId: props.item?.brandId || props.item?.brand?.id || '',
  categoryId: props.item?.categoryId || props.item?.category?.id || '',
  uomId: props.item?.uomId || props.item?.uom?.id || '',
  cost: props.item?.cost ?? 0,
  price: props.item?.price ?? 0,
  min_stock: props.item?.min_stock ?? 0,
})

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload = {
      ...form.value,
      cost: Number(form.value.cost),
      price: Number(form.value.price),
      min_stock: Number(form.value.min_stock),
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
  const [b, c, u] = await Promise.all([
    brandsService.list({ find: 'select', state: true, limit: 'all' }).catch(() => []),
    categoriesService.list({ find: 'select', state: true, limit: 'all' }).catch(() => []),
    uomService.list({ find: 'select', state: true, limit: 'all' }).catch(() => []),
  ])
  brands.value = b.data || b || []
  categories.value = c.data || c || []
  uoms.value = u.data || u || []
})
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="3">
          <v-label>SKU *</v-label>
          <v-text-field
            v-model="form.sku"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="9">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Descripción</v-label>
          <v-textarea
            v-model="form.description"
            variant="outlined"
            density="comfortable"
            rows="2"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Marca *</v-label>
          <v-autocomplete
            v-model="form.brandId"
            :items="brands"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Categoría *</v-label>
          <v-autocomplete
            v-model="form.categoryId"
            :items="categories"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Unidad Medida *</v-label>
          <v-autocomplete
            v-model="form.uomId"
            :items="uoms"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Costo *</v-label>
          <v-text-field
            v-model="form.cost"
            type="number"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => (v !== '' && v !== null) || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Precio Venta *</v-label>
          <v-text-field
            v-model="form.price"
            type="number"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => (v !== '' && v !== null) || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Stock Mínimo</v-label>
          <v-text-field
            v-model="form.min_stock"
            type="number"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ props.item ? 'Actualizar' : 'Crear' }}</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

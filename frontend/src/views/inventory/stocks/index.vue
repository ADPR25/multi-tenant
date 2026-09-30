<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { stocksService } from '@/services'
import { Boxes } from 'lucide-vue-next'
const items = ref<any[]>([])
const loading = ref(false)
const headers = [
  {title:'Producto',key:'product'},
  {title:'Bodega',key:'warehouse'},
  {title:'Cantidad',key:'quantity',align:'end'},
  {title:'Fecha',key:'createdAt'},
]
async function traer(){
  loading.value=true
  try{
    const res:any = await stocksService.list({limit:100})
    items.value = res.data || res || []
  } finally{ loading.value=false }
}
onMounted(traer)
</script>
<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2"><Boxes class="h-6 w-6"/> Stock Actual</h1>
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" class="bg-transparent">
        <template #item.product="{item}">{{ item.product?.name || item.productId }}</template>
        <template #item.warehouse="{item}">{{ item.warehouse?.name || item.warehouseId }}</template>
        <template #item.createdAt="{item}">{{ new Date(item.createdAt).toLocaleDateString() }}</template>
      </v-data-table>
    </div>
  </AdminLayout>
</template>
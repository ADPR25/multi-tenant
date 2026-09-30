<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateView from './create/index.vue'
import { stockMovementsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, ArrowLeftRight, X } from 'lucide-vue-next'
const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const mode = ref<'list'|'create'>('list')
const headers = [
  {title:'Producto',key:'product'},
  {title:'Bodega',key:'warehouse'},
  {title:'Tipo',key:'type'},
  {title:'Cantidad',key:'quantity'},
  {title:'Anterior',key:'previousQuantity'},
  {title:'Nuevo',key:'newQuantity'},
  {title:'Razón',key:'reason'},
  {title:'Fecha',key:'createdAt'},
]
async function traer(){
  loading.value=true
  try{
    const res:any = await stockMovementsService.list({limit:100})
    items.value = res.data || res || []
  } finally{ loading.value=false }
}
onMounted(traer)
</script>
<template>
  <AdminLayout>
    <div v-if="mode==='list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2"><ArrowLeftRight class="h-6 w-6"/> Movimientos de Stock</h1>
        <v-btn v-if="can('inventory:movements:create')" color="primary" @click="mode='create'"><Plus class="h-4 w-4 mr-2"/> Nuevo Movimiento</v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" class="bg-transparent">
          <template #item.product="{item}">{{ item.product?.name || '-' }}</template>
          <template #item.warehouse="{item}">{{ item.warehouse?.name || '-' }}</template>
          <template #item.type="{item}"><v-chip size="small" :color="item.type==='IN'?'success':item.type==='OUT'?'error':'info'">{{ item.type }}</v-chip></template>
          <template #item.createdAt="{item}">{{ new Date(item.createdAt).toLocaleString() }}</template>
        </v-data-table>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6"><h1 class="text-2xl font-bold">Nuevo Movimiento</h1><v-btn variant="text" icon @click="mode='list'"><X class="h-5 w-5"/></v-btn></div>
      <CreateView @close="mode='list'; traer()" @created="mode='list'; traer()" />
    </div>
  </AdminLayout>
</template>
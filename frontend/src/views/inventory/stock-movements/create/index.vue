<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { stockMovementsService, productsService, warehousesService } from '@/services'
import { Save, X } from 'lucide-vue-next'
const emit = defineEmits(['close','created'])
const formRef = ref()
const saving = ref(false)
const products = ref<any[]>([])
const warehouses = ref<any[]>([])
const form = ref({
  productId: '',
  warehouseId: '',
  type: 'IN',
  quantity: 0,
  reason: '',
})
async function submit(){
  const {valid} = await formRef.value.validate()
  if(!valid) return
  saving.value=true
  try{
    await stockMovementsService.create({...form.value, quantity: Number(form.value.quantity)})
    emit('created')
  } catch(e:any){ alert(e.message) } finally{ saving.value=false }
}
onMounted(async()=>{
  const [p,w] = await Promise.all([
    productsService.list({limit:100}).catch(()=>[]),
    warehousesService.list({limit:100}).catch(()=>[]),
  ])
  products.value = (p as any).data || p || []
  warehouses.value = (w as any).data || w || []
})
</script>
<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6"><v-label>Producto *</v-label><v-autocomplete v-model="form.productId" :items="products" item-title="name" item-value="id" variant="outlined" density="comfortable" :rules="[v=>!!v||'Req']"/></v-col>
        <v-col cols="12" md="6"><v-label>Bodega *</v-label><v-autocomplete v-model="form.warehouseId" :items="warehouses" item-title="name" item-value="id" variant="outlined" density="comfortable" :rules="[v=>!!v||'Req']"/></v-col>
        <v-col cols="12" md="4"><v-label>Tipo *</v-label><v-select v-model="form.type" :items="[{title:'Entrada IN',value:'IN'},{title:'Salida OUT',value:'OUT'},{title:'Ajuste',value:'ADJUSTMENT'},{title:'Transferencia',value:'TRANSFER_OUT'}]" variant="outlined" density="comfortable"/></v-col>
        <v-col cols="12" md="4"><v-label>Cantidad *</v-label><v-text-field v-model="form.quantity" type="number" variant="outlined" density="comfortable" :rules="[v=>!!v||'Req']"/></v-col>
        <v-col cols="12" md="4"><v-label>Razón</v-label><v-text-field v-model="form.reason" placeholder="Compra, Venta, Ajuste" variant="outlined" density="comfortable"/></v-col>
      </v-row>
      <div class="flex mt-6"><v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2"/>Cancelar</v-btn><v-spacer/><v-btn color="primary" :loading="saving" @click="submit"><Save class="h-4 w-4 mr-2"/>Crear Movimiento</v-btn></div>
    </v-form>
  </div>
</template>
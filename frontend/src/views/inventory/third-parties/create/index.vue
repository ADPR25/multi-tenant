<script setup lang="ts">
import { ref } from 'vue'
import { thirdPartiesService } from '@/services'
import { Save, X } from 'lucide-vue-next'

const emit = defineEmits(['close','created'])
const props = defineProps<{ kind?: string, item?: any }>()
const formRef = ref()
const saving = ref(false)

const typeOptions = [{ title: 'PERSONA', value: 'PERSONA' }, { title: 'EMPRESA', value: 'EMPRESA' }]
const kindOptions = [
  { title: 'Cliente', value: 'CLIENTE' },
  { title: 'Proveedor', value: 'PROVEEDOR' },
  { title: 'Empleado', value: 'EMPLEADO' },
  { title: 'Contratista', value: 'CONTRATISTA' },
]

const form = ref<any>({
  type: 'PERSONA',
  kinds: props.kind? [props.kind] : ['CLIENTE'],
  documentType: 'CC',
  documentNumber: '',
  name: '',
  email: '',
  phone: '',
  address: ''
})

if(props.item){
  form.value = {
    type: props.item.type,
    kinds: props.item.kinds,
    documentType: props.item.documentType,
    documentNumber: props.item.documentNumber,
    name: props.item.name,
    email: props.item.email || '',
    phone: props.item.phone || '',
    address: props.item.address || ''
  }
}

async function submit(){
  const { valid } = await formRef.value.validate()
  if(!valid) return
  saving.value=true
  try{
    const payload = {
      type: form.value.type,
      kinds: form.value.kinds,
      documentType: form.value.documentType,
      documentNumber: form.value.documentNumber,
      name: form.value.name,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    }
    if(props.item){
      await thirdPartiesService.update(props.item.id, payload)
    } else {
      await thirdPartiesService.create(payload)
    }
    emit('created')
  } catch(e:any){ alert(e.message) } finally { saving.value=false }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" sm="6" md="3"><v-label>Tipo *</v-label><v-select v-model="form.type" :items="typeOptions" density="comfortable" variant="outlined" :rules="[(v:any)=>!!v||'Requerido']" /></v-col>
        <v-col cols="12" sm="6" md="5"><v-label>Roles *</v-label><v-select v-model="form.kinds" :items="kindOptions" multiple chips closable-chips density="comfortable" variant="outlined" :rules="[(v:any)=>v?.length>0||'Seleccione al menos uno']" /></v-col>
        <v-col cols="12" sm="6" md="2"><v-label>Tipo Doc *</v-label><v-select v-model="form.documentType" :items="['CC','NIT','CE','PP','TI']" density="comfortable" variant="outlined" :rules="[(v:any)=>!!v||'Requerido']" /></v-col>
        <v-col cols="12" sm="6" md="2"><v-label>Número Doc *</v-label><v-text-field v-model="form.documentNumber" density="comfortable" variant="outlined" :rules="[(v:any)=>!!v||'Requerido']" /></v-col>
        <v-col cols="12" md="6"><v-label>Nombre / Razón Social *</v-label><v-text-field v-model="form.name" density="comfortable" variant="outlined" :rules="[(v:any)=>!!v||'Requerido']" /></v-col>
        <v-col cols="12" md="3"><v-label>Email</v-label><v-text-field v-model="form.email" density="comfortable" variant="outlined" /></v-col>
        <v-col cols="12" md="3"><v-label>Teléfono</v-label><v-text-field v-model="form.phone" density="comfortable" variant="outlined" /></v-col>
        <v-col cols="12"><v-label>Dirección</v-label><v-text-field v-model="form.address" density="comfortable" variant="outlined" /></v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"><Save class="h-4 w-4 mr-2" />{{ item? 'Actualizar' : 'Crear' }}</v-btn>
      </div>
    </v-form>
  </div>
</template>
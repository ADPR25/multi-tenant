<script setup lang="ts">
import { ref } from 'vue'
import { documentCategoriesService } from '@/services'
import { Save, X } from 'lucide-vue-next'
const props = defineProps<{item?:any}>()
const emit = defineEmits(['close','created'])
const formRef = ref()
const saving = ref(false)
const form = ref({ name: props.item?.name||'', description: props.item?.description||'' })
async function submit(){
  const {valid} = await formRef.value.validate()
  if(!valid) return
  saving.value=true
  try{
    if(props.item) await documentCategoriesService.update(props.item.id, form.value)
    else await documentCategoriesService.create(form.value)
    emit('created')
  } catch(e:any){ alert(e.message) } finally{ saving.value=false }
}
</script>
<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6"><v-label>Nombre *</v-label><v-text-field v-model="form.name" variant="outlined" density="comfortable" :rules="[v=>!!v||'Req']"/></v-col>
        <v-col cols="12" md="6"><v-label>Descripción</v-label><v-text-field v-model="form.description" variant="outlined" density="comfortable"/></v-col>
      </v-row>
      <div class="flex mt-6"><v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2"/>Cancelar</v-btn><v-spacer/><v-btn color="primary" :loading="saving" @click="submit"><Save class="h-4 w-4 mr-2"/>{{ item?'Actualizar':'Crear' }}</v-btn></div>
    </v-form>
  </div>
</template>
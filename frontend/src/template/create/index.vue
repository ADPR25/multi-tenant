<script setup>
import { ref, watch } from 'vue'
import { __MODULE__Service } from '@/services'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({
  item: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'created', 'updated'])

const loading = ref(false)

const form = ref({})

watch(() => props.item, (val) => {
  if (val) {
    form.value = {
      name: val.name || '',
      documentNumber: val.documentNumber || '',
      email: val.email || '',
    }
  } else {
    form.value = { name: '', documentNumber: '', email: '' }
  }
}, { immediate: true })

const submit = async () => {
  loading.value = true
  try {
    const data = props.isEdit
      ? await __MODULE__Service.update(props.item.id, form.value)
      : await __MODULE__Service.create(form.value)
    
    emit(props.isEdit ? 'updated' : 'created', data)
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
    <v-row>
      <!-- aqui el formulario -->
    </v-row>

    <div class="flex mt-6">
      <v-btn color="warning" @click="emit('close')"><v-icon :icon="X" class="h-4 w-4 mr-2" /> Cancelar</v-btn>
      <v-spacer />
      <v-btn color="primary" :loading="loading" @click="submit">
        <v-icon :icon="Save" class="h-4 w-4 mr-2" /> {{ isEdit ? 'Actualizar' : 'Crear' }}
      </v-btn>
    </div>
  </div>
</template>
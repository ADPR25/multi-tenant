<script setup lang="ts">
import { ref } from 'vue'
import { uomService } from '@/services'
import { Save, X } from 'lucide-vue-next'

defineOptions({
  name: 'UomCreateForm',
})

interface UomItem {
  id: string
  name: string
  short_name?: string
}

const props = defineProps<{
  item?: UomItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const saving = ref(false)

const form = ref({
  name: props.item?.name || '',
  short_name: props.item?.short_name || '',
})

async function submit(): Promise<void> {
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  saving.value = true
  try {
    if (props.item) await uomService.update(props.item.id, form.value)
    else await uomService.create(form.value)
    emit('created')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al guardar'
    alert(msg)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6"
          ><v-label>Nombre *</v-label
          ><v-text-field
            v-model="form.name"
            placeholder="Kilogramo, Unidad, Litro"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Abreviatura *</v-label
          ><v-text-field
            v-model="form.short_name"
            placeholder="KG, UND, LT"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        ><v-spacer /><v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ props.item ? 'Actualizar' : 'Crear' }}</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { wineriesService, branchesService } from '@/services'
import { Save, X } from 'lucide-vue-next'
const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])
const formRef = ref()
const saving = ref(false)
const branches = ref<any[]>([])
const form = ref({
  name: props.item?.name || '',
  type: props.item?.type || 'PRINCIPAL',
  branchId: props.item?.branchId || null,
})
const typeOptions = ['PRINCIPAL', 'SECUNDARIA', 'VIRTUAL', 'TRANSITO']
async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    if (props.item) await wineriesService.update(props.item.id, form.value)
    else await wineriesService.create(form.value)
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
onMounted(async () => {
  try {
    const r = await branchesService.list()
    branches.value = Array.isArray(r) ? r : (r as any).data || []
  } catch {}
})
</script>
<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6"
          ><v-label>Nombre *</v-label
          ><v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'Requerido']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Tipo *</v-label
          ><v-select
            v-model="form.type"
            :items="typeOptions"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Sucursal</v-label
          ><v-autocomplete
            v-model="form.branchId"
            :items="branches"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            clearable
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

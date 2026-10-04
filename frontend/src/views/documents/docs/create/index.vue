<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  documentsService,
  foldersService,
  documentCategoriesService,
  documentTypesService,
} from '@/services'
import { Save, X } from 'lucide-vue-next'
const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])
const formRef = ref()
const saving = ref(false)
const folders = ref<any[]>([])
const categories = ref<any[]>([])
const types = ref<any[]>([])
const form = ref({
  title: props.item?.title || '',
  description: props.item?.description || '',
  folderId: props.item?.folderId || '',
  categoryId: props.item?.categoryId || '',
  typeId: props.item?.typeId || '',
  content: props.item?.content || '',
  expiresAt: props.item?.expiresAt ? props.item.expiresAt.substring(0, 10) : '',
})
async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    const payload: any = { ...form.value }
    if (!payload.expiresAt) delete payload.expiresAt
    else payload.expiresAt = new Date(payload.expiresAt).toISOString()
    if (props.item) await documentsService.update(props.item.id, payload)
    else await documentsService.create(payload)
    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
onMounted(async () => {
  const [f, c, t] = await Promise.all([
    foldersService.list({ limit: 'all', find: 'list' }).catch(() => []),
    documentCategoriesService.list({ limit: 'all' }).catch(() => []),
    documentTypesService.list({ limit: 'all' }).catch(() => []),
  ])
  folders.value = f.data || f || []
  categories.value = c.data || c || []
  types.value = t.data || t || []
})
</script>
<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="8"
          ><v-label>Título *</v-label
          ><v-text-field
            v-model="form.title"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Expira</v-label
          ><v-date-input v-model="form.expiresAt" variant="outlined" density="comfortable"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Carpeta *</v-label
          ><v-autocomplete
            v-model="form.folderId"
            :items="folders"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
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
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="4"
          ><v-label>Tipo *</v-label
          ><v-autocomplete
            v-model="form.typeId"
            :items="types"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12"
          ><v-label>Descripción</v-label
          ><v-textarea v-model="form.description" rows="2" variant="outlined" density="comfortable"
        /></v-col>
        <v-col cols="12"
          ><v-label>Contenido</v-label
          ><v-textarea v-model="form.content" rows="4" variant="outlined" density="comfortable"
        /></v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        ><v-spacer /><v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ item ? 'Actualizar' : 'Crear' }}</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

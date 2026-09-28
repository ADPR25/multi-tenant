<script setup lang="ts">
import { ref } from 'vue'
import { documentsService } from '@/services'
import { Save, X, Upload } from 'lucide-vue-next'

const props = defineProps<{ folders?: any[]; categories?: any[]; types?: any[] }>()
const emit = defineEmits(['close', 'created'])

const formRef = ref()
const saving = ref(false)
const file = ref<File | null>(null)
const metadataJson = ref('{}')

const form = ref<any>({
  name: '',
  description: '',
  folderId: null,
  categoryId: null,
  typeDocumentId: null,
  expirationDate: null,
  tags: '',
  metadata: {},
})

// v-file-input devuelve File | File[] - normalizamos
function handleFileUpdate(val: File | File[] | null) {
  if (!val) {
    file.value = null
    return
  }
  file.value = Array.isArray(val) ? (val[0] ?? null) : val
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    let metadataParsed = {}
    try {
      metadataParsed = JSON.parse(metadataJson.value || '{}')
    } catch {
      throw new Error('Metadata JSON inválido')
    }

    const fd = new FormData()
    fd.append('name', form.value.name)
    if (form.value.description) fd.append('description', form.value.description)
    if (form.value.folderId) fd.append('folderId', form.value.folderId)
    if (form.value.categoryId) fd.append('categoryId', form.value.categoryId)
    if (form.value.typeDocumentId) fd.append('typeDocumentId', form.value.typeDocumentId)
    if (form.value.expirationDate)
      fd.append('expirationDate', new Date(form.value.expirationDate).toISOString())
    if (form.value.tags) {
      const tagsArr = String(form.value.tags)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      tagsArr.forEach((t) => fd.append('tags[]', t))
    }
    fd.append('metadata', JSON.stringify(metadataParsed))
    if (file.value) fd.append('file', file.value)

    await documentsService.create(fd)
    emit('created')
  } catch (e: any) {
    alert(e.message || 'Error al crear')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border bg-white p-6 dark:bg-white/[0.03]">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            density="comfortable"
            variant="outlined"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Archivo * (50MB max)</v-label>
          <v-file-input
            :model-value="file"
            @update:model-value="handleFileUpdate"
            density="comfortable"
            variant="outlined"
            prepend-icon=""
            :prepend-inner-icon="Upload as any"
            show-size
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Carpeta</v-label>
          <v-autocomplete
            v-model="form.folderId"
            :items="props.folders || []"
            item-title="name"
            item-value="id"
            clearable
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Categoría</v-label>
          <v-autocomplete
            v-model="form.categoryId"
            :items="props.categories || []"
            item-title="name"
            item-value="id"
            clearable
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Tipo de Documento</v-label>
          <v-autocomplete
            v-model="form.typeDocumentId"
            :items="props.types || []"
            item-title="name"
            item-value="id"
            clearable
            density="comfortable"
            variant="outlined"
          >
            <template #item="{ props: p, item }"
              ><v-list-item v-bind="p" :title="item.raw.name" :subtitle="item.raw.code"
            /></template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="4">
          <v-label>Fecha Expiración</v-label>
          <v-text-field
            v-model="form.expirationDate"
            type="date"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="8">
          <v-label>Tags (separados por coma)</v-label>
          <v-text-field
            v-model="form.tags"
            placeholder="factura, contrato, 2024"
            density="comfortable"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Descripción</v-label>
          <v-textarea
            v-model="form.description"
            density="comfortable"
            variant="outlined"
            rows="2"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Metadata JSON (según metadataSchema del tipo)</v-label>
          <v-textarea
            v-model="metadataJson"
            density="comfortable"
            variant="outlined"
            rows="4"
            placeholder='{"campo1": "valor"}'
          />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />Guardar</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { typeDocumentsService } from '@/services'
import { Save, X, Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps<{ item?: any }>()
const emit = defineEmits(['close', 'created'])

type FieldType = 'string' | 'number' | 'boolean' | 'date'
interface BuilderField {
  name: string
  label: string
  type: FieldType
  required: boolean
}

const formRef = ref()
const saving = ref(false)

const form = ref({
  name: props.item?.name || '',
  code: props.item?.code || '',
  description: props.item?.description || '',
  requiresExpiration: props.item?.requiresExpiration || false,
  isActive: props.item?.isActive ?? true,
})

const metadataFields = ref<BuilderField[]>(
  props.item?.metadataSchema?.fields?.length
    ? props.item.metadataSchema.fields.map((f: any) => ({
        name: f.name,
        label: f.label || f.name,
        type: f.type,
        required: !!f.required,
      }))
    : [
        { name: 'numero_documento', label: 'Número de Documento', type: 'string', required: true },
        { name: 'fecha_emision', label: 'Fecha de Emisión', type: 'date', required: false },
      ],
)

const fieldTypes = [
  { title: 'Texto', value: 'string' },
  { title: 'Número', value: 'number' },
  { title: 'Sí / No', value: 'boolean' },
  { title: 'Fecha', value: 'date' },
]

function addField() {
  metadataFields.value.push({ name: '', label: '', type: 'string', required: false })
}
function removeField(idx: number) {
  metadataFields.value.splice(idx, 1)
}
function onLabelChange(f: BuilderField) {
  if (!f.name) {
    f.name = f.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }
}

const isEdit = computed(() => !!props.item)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  for (const f of metadataFields.value) {
    if (!f.name || !f.label) {
      alert('Falta nombre o etiqueta en un campo adicional')
      return
    }
  }

  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      code: form.value.code.toUpperCase().trim(),
      description: form.value.description,
      requiresExpiration: form.value.requiresExpiration,
      isActive: form.value.isActive,
      metadataSchema: metadataFields.value.length ? { fields: metadataFields.value } : null,
    }

    if (props.item) await typeDocumentsService.update(props.item.id, payload)
    else await typeDocumentsService.create(payload)

    emit('created')
  } catch (e: any) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Código *</v-label>
          <v-text-field
            v-model="form.code"
            variant="outlined"
            density="comfortable"
            placeholder="CC, PASSPORT"
            :rules="[(v: any) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" md="8">
          <v-label>Descripción</v-label>
          <v-textarea
            v-model="form.description"
            variant="outlined"
            density="comfortable"
            rows="2"
          />
        </v-col>
        <v-col cols="12" md="4" class="flex flex-col gap-2">
          <v-label>Opciones</v-label>
          <v-switch
            v-model="form.requiresExpiration"
            label="Requiere expiración"
            color="primary"
            hide-details
          />
          <v-switch
            v-if="isEdit"
            v-model="form.isActive"
            label="Activo"
            color="success"
            hide-details
          />
        </v-col>

        <v-col cols="12"><v-divider class="my-2" /></v-col>

        <v-col cols="12">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p class="font-semibold">Campos adicionales del documento</p>
              <p class="text-xs opacity-60">
                Ej: número, fecha, entidad. Lo que pedirá al subir el doc.
              </p>
            </div>
            <v-btn size="small" variant="tonal" @click="addField" class="w-full sm:w-auto">
              <Plus class="h-4 w-4 mr-1" /> Agregar campo
            </v-btn>
          </div>

          <div
            v-if="!metadataFields.length"
            class="border border-dashed rounded-xl p-6 text-center opacity-60 text-sm"
          >
            Sin campos adicionales.
          </div>

          <div
            v-for="(f, idx) in metadataFields"
            :key="idx"
            class="border rounded-xl p-3 mb-3 bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="f.label"
                  label="Etiqueta *"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="onLabelChange(f)"
                  placeholder="Fecha de expedición"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="f.name"
                  label="Nombre técnico *"
                  density="compact"
                  variant="outlined"
                  hide-details
                  placeholder="fecha_expedicion"
                />
              </v-col>
              <v-col cols="12" sm="5">
                <v-select
                  v-model="f.type"
                  :items="fieldTypes"
                  label="Tipo"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="8" sm="4" class="flex items-center">
                <v-checkbox
                  v-model="f.required"
                  label="Obligatorio"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="4" sm="3" class="flex justify-end items-center">
                <v-btn icon size="small" variant="text" color="error" @click="removeField(idx)"
                  ><Trash2 class="h-4 w-4"
                /></v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <div class="flex mt-6 gap-2">
        <v-btn color="warning" variant="tonal" @click="$emit('close')"
          ><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        >
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit"
          ><Save class="h-4 w-4 mr-2" />{{ isEdit ? 'Actualizar' : 'Crear' }}</v-btn
        >
      </div>
    </v-form>
  </div>
</template>

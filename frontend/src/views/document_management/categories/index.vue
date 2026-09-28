<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { documentCategoriesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Tag, Plus, Trash2, Edit, X, Save } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const showCreate = ref(false)
const editing = ref<any>(null)
const form = ref({ name: '', description: '', color: '' })
const search = ref('')

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: 'Color', key: 'color' },
  { title: 'Descripción', key: 'description' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await documentCategoriesService.list({ search: search.value || undefined })
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function openCreate() {
  form.value = { name: '', description: '', color: '' }
  editing.value = null
  showCreate.value = true
}
function openEdit(i: any) {
  editing.value = i
  form.value = { name: i.name, description: i.description || '', color: i.color || '' }
  showCreate.value = true
}
async function submit() {
  if (editing.value) await documentCategoriesService.update(editing.value.id, form.value)
  else await documentCategoriesService.create(form.value)
  showCreate.value = false
  traer()
}
async function removeItem(i: any) {
  if (!confirm('¿Eliminar?')) return
  await documentCategoriesService.remove(i.id)
  traer()
}
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <Tag class="h-6 w-6" /> Categorías Documento
      </h1>
      <v-btn v-if="can('documents:categories:create')" color="success" @click="openCreate"
        ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
      >
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <v-text-field
        v-model="search"
        placeholder="Buscar..."
        variant="outlined"
        density="compact"
        hide-details
        class="max-w-sm mb-4"
        @keyup.enter="traer"
      />
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="10"
        class="bg-transparent"
      >
        <template #item.color="{ item }"
          ><div
            v-if="item.color"
            :style="{ background: item.color }"
            class="h-5 w-5 rounded-full border"
        /></template>
        <template #item.actions="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn icon size="x-small" variant="text" @click="openEdit(item)"
              ><Edit class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('documents:categories:delete')"
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="removeItem(item)"
              ><Trash2 class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
    <v-dialog v-model="showCreate" max-width="500">
      <v-card>
        <v-card-title>{{ editing ? 'Editar' : 'Nueva' }} Categoría</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Nombre *"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="form.color"
            label="Color (hex)"
            placeholder="#ff0000"
            variant="outlined"
            density="comfortable"
          />
          <v-textarea
            v-model="form.description"
            label="Descripción"
            variant="outlined"
            density="comfortable"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showCreate = false"><X class="h-4 w-4 mr-2" />Cancelar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="submit"><Save class="h-4 w-4 mr-2" />Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

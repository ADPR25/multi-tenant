<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { foldersService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Folder, Plus, Trash2, Edit, Move, X, Save } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const tree = ref<any[]>([])
const loading = ref(false)
const showCreate = ref(false)
const editing = ref<any>(null)

const form = ref({ name: '', description: '', parentId: null as any })

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Path', key: 'path' },
  { title: 'Parent', key: 'parent' },
  { title: 'Activo', key: 'isActive' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await foldersService.list()
    items.value = Array.isArray(res) ? res : (res as any).data || []
    const t = await foldersService.tree()
    tree.value = Array.isArray(t) ? t : (t as any).data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { name: '', description: '', parentId: null }
  editing.value = null
  showCreate.value = true
}
function openEdit(item: any) {
  editing.value = item
  form.value = { name: item.name, description: item.description, parentId: item.parentId }
  showCreate.value = true
}

async function submit() {
  if (editing.value) {
    await foldersService.update(editing.value.id, form.value)
  } else {
    await foldersService.create(form.value)
  }
  showCreate.value = false
  traer()
}
async function removeItem(item: any) {
  if (!confirm('¿Eliminar carpeta? Debe estar vacía')) return
  await foldersService.remove(item.id)
  traer()
}

onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <Folder class="h-6 w-6" /> Carpetas
      </h1>
      <v-btn v-if="can('documents:folders:create')" color="success" @click="openCreate"
        ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
      >
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="15"
        class="bg-transparent"
      >
        <template #item.parent="{ item }">{{ item.parent?.name || '-' }}</template>
        <template #item.isActive="{ item }"
          ><v-chip :color="item.isActive ? 'success' : 'default'" size="small">{{
            item.isActive ? 'Activo' : 'Inactivo'
          }}</v-chip></template
        >
        <template #item.actions="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn icon size="x-small" variant="text" @click="openEdit(item)"
              ><Edit class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('documents:folders:delete')"
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
        <v-card-title>{{ editing ? 'Editar' : 'Nueva' }} Carpeta</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Nombre *"
            variant="outlined"
            density="comfortable"
          />
          <v-autocomplete
            v-model="form.parentId"
            :items="items"
            item-title="name"
            item-value="id"
            label="Padre (opcional)"
            clearable
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

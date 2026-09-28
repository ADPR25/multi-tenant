<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateTypeDocument from './create/index.vue'
import { typeDocumentsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Trash2, FileType, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<any>(null)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Código', key: 'code' },
  { title: 'Requiere Expiración', key: 'requiresExpiration' },
  { title: 'Activo', key: 'isActive' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await typeDocumentsService.list({ search: search.value || undefined })
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
function openCreate() {
  selected.value = null
  mode.value = 'create'
}
function openEdit(item: any) {
  selected.value = item
  mode.value = 'edit'
}
function closeList() {
  mode.value = 'list'
  selected.value = null
  traer()
}
async function removeItem(item: any) {
  if (confirm(`¿Eliminar tipo ${item.name}?`)) {
    await typeDocumentsService.remove(item.id)
    traer()
  }
}
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <FileType class="h-6 w-6 text-gray-500" /> Tipos de Documento
        </h1>
        <v-btn v-if="can('documents:types:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar por nombre o código..."
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6 w-full sm:max-w-sm"
          @keyup.enter="traer"
        />
        <div class="w-full overflow-x-auto rounded-xl border dark:border-zinc-800">
          <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            density="comfortable"
            class="bg-transparent"
            item-value="id"
          >
            <template #item.requiresExpiration="{ item }">
              <v-chip :color="item.requiresExpiration ? 'warning' : 'default'" size="small">
                {{ item.requiresExpiration ? 'Sí' : 'No' }}
              </v-chip>
            </template>
            <template #item.isActive="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'default'" size="small">
                {{ item.isActive ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn v-if="can('documents:types:update')" icon size="x-small" variant="text" color="warning" @click="openEdit(item)">
                  <Pencil class="h-4 w-4" />
                </v-btn>
                <v-btn v-if="can('documents:types:delete')" icon size="x-small" variant="text" color="error" @click="removeItem(item)">
                  <Trash2 class="h-4 w-4" />
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar Tipo' : 'Nuevo Tipo de Documento' }}
        </h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateTypeDocument :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>
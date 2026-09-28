<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateBrand from './create/index.vue'
import { brandsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-vue-next'

const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<any>(null)

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await brandsService.list({ search: search.value || undefined })
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
  if (confirm(`¿Eliminar marca ${item.name}?`)) {
    try {
      await brandsService.remove(item.id)
      traer()
    } catch (e: any) {
      alert(e.message)
    }
  }
}
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Tag class="h-6 w-6 text-gray-500" /> Marcas
        </h1>
        <v-btn v-if="can('inventory:brands:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex gap-3 mb-6">
          <v-text-field
            v-model="search"
            placeholder="Buscar por nombre..."
            variant="outlined"
            density="compact"
            hide-details
            class="w-full sm:max-w-sm"
            @keyup.enter="traer"
          />
          <v-btn variant="tonal" @click="traer">Buscar</v-btn>
        </div>
        <div class="w-full overflow-x-auto rounded-xl border">
          <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :items-per-page="10"
            density="comfortable"
            class="bg-transparent"
            item-value="id"
          >
            <template #item.description="{ item }">{{ item.description || '-' }}</template>
            <template #item.createdAt="{ item }">{{
              new Date(item.createdAt).toLocaleDateString()
            }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('inventory:brands:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                  ><Pencil class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="can('inventory:brands:delete')"
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
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ mode === 'edit' ? 'Editar Marca' : 'Nueva Marca' }}</h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateBrand :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>

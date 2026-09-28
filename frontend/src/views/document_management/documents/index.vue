<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CreateDocument from './create/index.vue'
import {
  documentsService,
  foldersService,
  typeDocumentsService,
  documentCategoriesService,
} from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { FileText, Plus, Eye, Trash2, Share2, Clock, FileStack, X, Download } from 'lucide-vue-next'

const { can } = usePermissions()
const router = useRouter()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list' | 'create' | 'detail'>('list')
const folders = ref<any[]>([])
const categories = ref<any[]>([])
const types = ref<any[]>([])

const filters = ref({
  search: '',
  folderId: '',
  categoryId: '',
  typeDocumentId: '',
  status: '',
  fullText: '',
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Archivo', key: 'originalName' },
  { title: 'Carpeta', key: 'folder' },
  { title: 'Categoría', key: 'category' },
  { title: 'Tipo', key: 'typeDocument' },
  { title: 'Versión', key: 'version', align: 'center' as const },
  { title: 'Estado', key: 'status', align: 'center' as const },
  { title: 'Vencimiento', key: 'expirationDate' },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

async function traer() {
  loading.value = true
  try {
    const res = await documentsService.list({
      search: filters.value.search || undefined,
      folderId: filters.value.folderId || undefined,
      categoryId: filters.value.categoryId || undefined,
      typeDocumentId: filters.value.typeDocumentId || undefined,
      status: filters.value.status || undefined,
      fullText: filters.value.fullText || undefined,
    })
    items.value = Array.isArray(res) ? res : (res as any).data || (res as any).items || []
  } finally {
    loading.value = false
  }
}

async function loadLookups() {
  try {
    const [f, c, t] = await Promise.all([
      foldersService.tree().catch(() => foldersService.list()),
      documentCategoriesService.list(),
      typeDocumentsService.list(),
    ])
    folders.value = Array.isArray(f) ? f : (f as any).data || []
    categories.value = Array.isArray(c) ? c : (c as any).data || []
    types.value = Array.isArray(t) ? t : (t as any).data || []
  } catch {}
}

function openCreate() {
  mode.value = 'create'
}
function openDetail(item: any) {
  router.push(`/documents/${item.id}`)
}
async function removeItem(item: any) {
  if (!confirm(`¿Eliminar documento "${item.name}"?`)) return
  await documentsService.remove(item.id)
  traer()
}
async function presigned(item: any) {
  const res = await documentsService.getPresigned(item.id)
  const url = (res as any).url || (res as any).data?.url
  if (url) window.open(url, '_blank')
}

onMounted(async () => {
  await loadLookups()
  await traer()
})
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <FileText class="h-6 w-6 text-gray-500" /> Documentos
        </h1>
        <div class="flex gap-2">
          <v-btn variant="outlined" to="/documents/folders">Carpetas</v-btn>
          <v-btn variant="outlined" to="/documents/categories">Categorías</v-btn>
          <v-btn variant="outlined" to="/documents/types">Tipos</v-btn>
          <v-btn v-if="can('documents:create')" color="success" @click="openCreate"
            ><Plus class="h-4 w-4 mr-2" /> Nuevo</v-btn
          >
        </div>
      </div>

      <div class="rounded-2xl border bg-white p-4 dark:bg-white/[0.03]">
        <div class="grid grid-cols-12 gap-3 mb-6">
          <v-text-field
            v-model="filters.search"
            placeholder="Buscar nombre/descripción..."
            variant="outlined"
            density="compact"
            hide-details
            class="col-span-12 sm:col-span-4"
            @keyup.enter="traer"
          />
          <v-text-field
            v-model="filters.fullText"
            placeholder="Búsqueda full-text..."
            variant="outlined"
            density="compact"
            hide-details
            class="col-span-12 sm:col-span-3"
            @keyup.enter="traer"
          />
          <v-autocomplete
            v-model="filters.folderId"
            :items="folders"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            label="Carpeta"
            class="col-span-6 sm:col-span-2"
            @update:modelValue="traer"
          />
          <v-autocomplete
            v-model="filters.categoryId"
            :items="categories"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            label="Categoría"
            class="col-span-6 sm:col-span-3"
            @update:modelValue="traer"
          />
          <v-btn color="primary" class="col-span-12 sm:col-span-1" @click="traer">Filtrar</v-btn>
        </div>

        <div class="w-full overflow-x-auto rounded-xl border">
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
            <template #item.folder="{ item }">{{ item.folder?.name || '-' }}</template>
            <template #item.category="{ item }">{{ item.category?.name || '-' }}</template>
            <template #item.typeDocument="{ item }">{{
              item.typeDocument?.name || item.typeDocument?.code || '-'
            }}</template>
            <template #item.status="{ item }">
              <v-chip
                :color="
                  item.status === 'ACTIVE'
                    ? 'success'
                    : item.status === 'EXPIRED'
                      ? 'error'
                      : item.status === 'PENDING'
                        ? 'warning'
                        : 'default'
                "
                size="small"
                variant="tonal"
                >{{ item.status }}</v-chip
              >
            </template>
            <template #item.expirationDate="{ item }">{{
              item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-'
            }}</template>
            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn icon size="x-small" variant="text" color="primary" @click="presigned(item)"
                  ><Download class="h-4 w-4"
                /></v-btn>
                <v-btn icon size="x-small" variant="text" @click="openDetail(item)"
                  ><Eye class="h-4 w-4"
                /></v-btn>
                <v-btn
                  v-if="can('documents:delete')"
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
        <h1 class="text-2xl font-bold">Nuevo Documento</h1>
        <v-btn variant="text" icon @click="mode = 'list'"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateDocument
        :folders="folders"
        :categories="categories"
        :types="types"
        @close="mode = 'list'"
        @created="mode = 'list'; traer()"
      />
    </div>
  </AdminLayout>
</template>

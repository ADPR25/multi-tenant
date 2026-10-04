<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { foldersService, documentsService } from '@/services'
import { get } from '@/store/authstore'
import {
  Folder,
  Eye,
  Search,
  HardDrive,
  Download,
  X,
  FileText,
  TrashIcon,
  Shield,
  Lock,
} from 'lucide-vue-next'

const breadcrumb = ref<any[]>([])
const currentFolderId = ref<string | null>(null)
const folders = ref<any[]>([])
const docs = ref<any[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parentRequirement = ref<any>(null)
const searchQuery = ref('')

// preview
const previewDoc = ref<any>(null)
const showPreview = ref(false)
const previewBlobUrl = ref<string | null>(null)
const previewLoading = ref(false)

// delete
const showDelete = ref(false)
const deleteDoc = ref<any>(null)

const storedUser = computed(() => {
  try {
    const u = (get as any).useAuth?.('user') || (get as any).useAuth?.user
    if (u?.id) return u
  } catch {}
  try {
    const r = localStorage.getItem('user')
    if (r) return JSON.parse(r)
  } catch {}
  try {
    const r = localStorage.getItem('auth_user')
    if (r) return JSON.parse(r)
  } catch {}
  try {
    const r = localStorage.getItem('auth')
    if (r) {
      const j = JSON.parse(r)
      return j.user || j
    }
  } catch {}
  return {}
})
const currentUserId = computed(
  () =>
    storedUser.value?.id ||
    storedUser.value?.sub ||
    storedUser.value?._id ||
    storedUser.value?.userId ||
    '',
)

const currentFolder = computed(() => breadcrumb.value[breadcrumb.value.length - 1] || null)
const isRoot = computed(() => !currentFolder.value)
const isInsideMyPersonalFolder = computed(
  () =>
    !!currentFolder.value?.ownerFolderName &&
    currentFolder.value?.createdBy === currentUserId.value,
)
const hasMyPersonalFolder = computed(() =>
  folders.value.some((f: any) => f.createdBy === currentUserId.value && !!f.ownerFolderName),
)
const hasStructuralChild = computed(() => folders.value.some((f: any) => !f.ownerFolderName))
const canCreatePersonal = computed(() => {
  if (isRoot.value) return false
  if (isInsideMyPersonalFolder.value) return false
  if (currentFolder.value?.ownerFolderName) return false
  if (hasMyPersonalFolder.value) return false
  if (hasStructuralChild.value) return false
  return !!currentFolder.value
})
const canUploadHere = computed(() => isInsideMyPersonalFolder.value)

const requiredDocs = computed(() => docs.value.filter((d: any) => !d.storageKey))
const uploadedDocs = computed(() => docs.value.filter((d: any) => !!d.storageKey))
const filteredDocs = computed(() => {
  let l = uploadedDocs.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    l = l.filter((d: any) => (d.fileName || '').toLowerCase().includes(q))
  }
  return l
})

function isPdf(doc: any) {
  return doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf')
}
function getFileUrl(k: string) {
  return documentsService.downloadUrl(k, true)
}

async function load(id: string | null) {
  loading.value = true
  try {
    const [f, d] = await Promise.all([
      foldersService
        .list({ parentId: id ?? 'null', limit: 100, state: true })
        .then((r: any) => r.data || r)
        .catch(() => []),
      id
        ? documentsService
            .list({ folderId: id, limit: 100 })
            .then((r: any) => r.data || r)
            .catch(() => [])
        : Promise.resolve([]),
    ])
    folders.value = f || []
    docs.value = d || []
    const tpl = (d as any[]).find((x: any) => !x.storageKey && x.categoryId && x.typeId)
    if (tpl) parentRequirement.value = tpl
    else if (!id) parentRequirement.value = null
  } finally {
    loading.value = false
  }
}
function enter(f: any) {
  breadcrumb.value.push(f)
  currentFolderId.value = f.id
  load(f.id)
}
function back() {
  breadcrumb.value.pop()
  currentFolderId.value = breadcrumb.value.length
    ? breadcrumb.value[breadcrumb.value.length - 1].id
    : null
  if (!breadcrumb.value.length) parentRequirement.value = null
  load(currentFolderId.value)
}
function goRoot() {
  breadcrumb.value = []
  currentFolderId.value = null
  parentRequirement.value = null
  load(null)
}
function goTo(i: number) {
  breadcrumb.value = breadcrumb.value.slice(0, i + 1)
  currentFolderId.value = breadcrumb.value[i].id
  load(currentFolderId.value)
}
async function createPersonal() {
  if (!currentFolderId.value) return
  try {
    await foldersService.createPersonal({ parentId: currentFolderId.value })
    load(currentFolderId.value)
  } catch (e: any) {
    alert(e.message)
  }
}
function triggerUpload() {
  fileInputRef.value?.click()
}
async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !currentFolderId.value) return
  const template = requiredDocs.value[0] || parentRequirement.value
  if (!template?.categoryId || !template?.typeId) {
    alert('La carpeta padre no tiene configurada categoria y tipo')
    return
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('title', currentFolder.value?.name || 'doc')
  fd.append(
    'description',
    `Archivo de ${currentFolder.value?.name} - ${new Date().toLocaleDateString()}`,
  )
  fd.append('folderId', currentFolderId.value)
  fd.append('categoryId', template.categoryId)
  fd.append('typeId', template.typeId)
  try {
    uploading.value = true
    await documentsService.upload(fd)
    load(currentFolderId.value)
  } catch (err: any) {
    alert(err.message)
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}

async function openPreview(doc: any) {
  previewDoc.value = doc
  showPreview.value = true
  previewLoading.value = true

  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value)
    previewBlobUrl.value = null
  }

  try {
    const url = getFileUrl(doc.storageKey)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const blob = await res.blob()
    previewBlobUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    alert('No se pudo abrir PDF: ' + e.message)
    showPreview.value = false
  } finally {
    previewLoading.value = false
  }
}

function closePreview() {
  showPreview.value = false
  if (previewBlobUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewBlobUrl.value)
  previewBlobUrl.value = null
}

// --- DELETE CON DIALOG ---
function openDelete(doc: any) {
  deleteDoc.value = doc
  showDelete.value = true
}
const confirmDelete = async () => {
  if (!deleteDoc.value?.id) return
  try {
    await documentsService.delete(deleteDoc.value.id)
    load(currentFolderId.value)
  } catch (e: any) {
    alert(e.message)
  } finally {
    showDelete.value = false
    deleteDoc.value = null
  }
}

onMounted(() => load(null))
</script>

<template>
  <div class="min-h-screen bg-white -m-6">
    <div class="max-w- mx-auto px-10 py-10">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
        @change="onFilePicked"
      />

      <div class="flex items-center gap-2 text- tracking-[0.08em] font-medium text-zinc-400 mb-12">
        <button
          @click="goRoot"
          class="flex items-center gap-1.5 text-zinc-900 hover:opacity-60 transition"
        >
          <HardDrive class="h-3 w-3" /> DRIVE
        </button>
        <span v-for="(b, i) in breadcrumb" :key="b.id" class="flex items-center gap-2">
          <span class="text-zinc-300">—</span>
          <button @click="goTo(i)" class="hover:text-zinc-900 uppercase">{{ b.name }}</button>
        </span>
      </div>

      <div class="flex items-start justify-between mb-16">
        <div>
          <h1 class="text- font-[300] tracking-[-0.03em] leading-none text-zinc-900">
            {{ currentFolder?.name || 'Drive' }}
          </h1>
          <p class="mt-3 text- text-zinc-400 font-[400] uppercase tracking-widest">
            {{ folders.length }} carpetas · {{ uploadedDocs.length }} archivos · AES-256
            <span
              v-if="isInsideMyPersonalFolder"
              class="ml-2 inline-flex items-center gap-1 bg-zinc-900 text-white px-2 py-0.5 rounded-full"
              >PRIVADO</span
            >
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="canCreatePersonal"
            @click="createPersonal"
            class="h-8 px-4 rounded-full border border-zinc-900 text- font-medium tracking-widest hover:bg-zinc-900 hover:text-white transition"
          >
            + CREAR MI CARPETA
          </button>
          <button
            v-if="canUploadHere"
            @click="triggerUpload"
            :disabled="uploading"
            class="h-8 px-4 rounded-full bg-zinc-900 text-white text- font-medium tracking-widest disabled:opacity-60"
          >
            {{ uploading ? 'SUBIENDO...' : 'SUBIR' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-20 text- tracking-widest text-zinc-400">CARGANDO VAULT...</div>

      <template v-else>
        <div class="grid grid-cols-12 gap-px bg-zinc-200 border border-zinc-200 mb-16">
          <div
            v-for="f in folders"
            :key="f.id"
            @click="enter(f)"
            class="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-7 hover:bg-zinc-50 cursor-pointer group transition"
          >
            <div class="flex justify-between items-start mb-8">
              <Folder
                class="h-5 w-5 text-zinc-900 stroke-[1.25] group-hover:scale-105 transition"
              />
              <Lock
                v-if="f.ownerFolderName && f.createdBy !== currentUserId"
                class="h-3.5 w-3.5 text-zinc-300"
              />
              <Shield v-if="f.createdBy === currentUserId" class="h-3.5 w-3.5 text-zinc-900" />
            </div>
            <p class="text- font-medium text-zinc-900 truncate">{{ f.name }}</p>
            <p class="text- text-zinc-400 mt-1 truncate uppercase tracking-widest">
              {{ f.ownerFolderName ? `De ${f.ownerFolderName}` : 'Carpeta' }}
            </p>
          </div>
          <div
            v-if="!folders.length && isRoot"
            class="col-span-12 bg-zinc-50 p-10 text-center text- tracking-widest text-zinc-400"
          >
            NO HAY CARPETAS RAÍZ — EL ADMIN DEBE CREAR LA ESTRUCTURA
          </div>
        </div>

        <div v-if="currentFolder?.ownerFolderName" class="border-t border-zinc-900 pt-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text- font-medium tracking-[0.2em] text-zinc-900">
              ARCHIVOS — {{ currentFolder?.name?.toUpperCase() }} · {{ filteredDocs.length }}
            </h3>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
              <input
                v-model="searchQuery"
                placeholder="FILTRAR"
                class="h-7 w- pl-8 bg-zinc-50 border border-zinc-200 rounded-full text- tracking-widest placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div v-if="!filteredDocs.length" class="py-16 text-center">
            <p class="text- font-medium text-zinc-900">Vault vacío</p>
            <p class="text- text-zinc-400 mt-1">No hay archivos que coincidan</p>
          </div>

          <div v-else class="divide-y divide-zinc-100">
            <div
              v-for="doc in filteredDocs"
              :key="doc.id"
              class="group flex items-center justify-between py-5 hover:pl-2 transition-all"
            >
              <div class="flex items-center gap-4 min-w-0">
                <div class="h-8 w-px bg-zinc-900" />
                <div class="min-w-0">
                  <p class="text-[12.5px] font-medium text-zinc-900 truncate">
                    {{ doc.fileName || doc.title }}
                  </p>
                  <p class="text- text-zinc-400 mt-0.5 font-mono truncate">
                    {{ doc.mimeType }} — {{ doc.id.slice(0, 8) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                <button
                  v-if="isPdf(doc)"
                  @click="openPreview(doc)"
                  class="h-7 w-7 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black"
                  title="Vista previa"
                >
                  <Eye class="h-3 w-3" />
                </button>
                <a
                  v-if="!isPdf(doc)"
                  :href="getFileUrl(doc.storageKey)"
                  target="_blank"
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition"
                >
                  <Download class="h-3 w-3" />
                </a>
                <button
                  @click="openDelete(doc)"
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition"
                  title="Eliminar"
                >
                  <TrashIcon class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showPreview"
        class="fixed inset-0 z-[99999] bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col"
      >
        <div
          class="h- shrink-0 bg-white/95 backdrop-blur border-b flex items-center justify-between px-6"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center"
            >
              <FileText class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text- truncate">{{ previewDoc?.fileName }}</p>
              <p class="text- text-zinc-500 truncate tracking-widest uppercase">
                {{ previewDoc?.title }}
              </p>
            </div>
          </div>
          <button
            @click="closePreview"
            class="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8">
          <div
            v-if="previewLoading"
            class="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin"
          />
          <iframe
            v-else-if="previewBlobUrl"
            :src="previewBlobUrl"
            class="w-full h-full max-w- bg-white rounded- shadow-[0_30px_90px_rgba(0,0,0,0.5)] border-0"
          />
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- DELETE CON V-DIALOG -->
  <v-dialog v-model="showDelete" max-width="450" persistent>
    <v-card class="rounded-2xl">
      <v-card-title class="flex items-center gap-3 pt-6 px-6">
        <div
          class="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"
        >
          <TrashIcon class="h-5 w-5 text-red-500" />
        </div>
        <h3 class="text-lg font-semibold text-zinc-900">Eliminar documento</h3>
      </v-card-title>
      <v-card-text class="px-6 pb-2 text-gray-600">
        <p class="text-">
          Eliminar documento:
          <span class="font-semibold text-zinc-900">{{ deleteDoc?.fileName }}</span>
        </p>
        <p class="mt-3 text- tracking-widest text-zinc-400 uppercase">
          Esta acción no se puede deshacer
        </p>
      </v-card-text>
      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" @click="((showDelete = false), (deleteDoc = null))">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="red" variant="flat" class="rounded-full" @click="confirmDelete"
          >Confirmar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

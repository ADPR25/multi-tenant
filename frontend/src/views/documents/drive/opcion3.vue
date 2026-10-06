<script setup lang="ts">
defineOptions({
  name: 'DriveOpcion3View',
})

import { ref, onMounted, computed } from 'vue'
import type { Ref } from 'vue'
import { foldersService, documentsService } from '@/services'
import { get } from '@/store/authstore'
import {
  Folder,
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Search,
  Plus,
  Upload,
  Sparkles,
  HardDrive,
  Shield,
  Users,
  X,
  TrashIcon,
} from 'lucide-vue-next'

interface FolderItem {
  id: string
  name: string
  ownerFolderName?: string | null
  createdBy?: string
  parentId?: string | null
}

interface DocItem {
  id: string
  fileName: string
  storageKey?: string | null
  mimeType?: string
  categoryId?: string
  typeId?: string
  title?: string
}

interface StoredUser {
  id?: string
  sub?: string
  _id?: string
  userId?: string
}

const breadcrumb = ref<FolderItem[]>([])
const currentFolderId = ref<string | null>(null)
const folders = ref<FolderItem[]>([])
const docs = ref<DocItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parentRequirement = ref<DocItem | null>(null)
const searchQuery = ref('')
const isDragging = ref(false)

const previewDoc = ref<DocItem | null>(null)
const showPreview = ref(false)
const previewBlobUrl = ref(null) as Ref<string | null>
const previewLoading = ref(false)

const showDelete = ref(false)
const deleteDoc = ref<DocItem | null>(null)

const storedUser = computed<StoredUser>(() => {
  try {
    const authStore = get as unknown as Record<string, unknown>
    const useAuth = authStore['useAuth']
    if (typeof useAuth === 'function') {
      const u = (useAuth as (k: string) => StoredUser)('user')
      if (u?.id) return u
    }
    const useAuthObj = authStore['useAuth'] as { user?: StoredUser } | undefined
    if (useAuthObj?.user?.id) return useAuthObj.user
  } catch {
    // ignore auth store error
  }
  try {
    const r = localStorage.getItem('user')
    if (r) return JSON.parse(r) as StoredUser
  } catch {
    // ignore parse error
  }
  try {
    const r = localStorage.getItem('auth_user')
    if (r) return JSON.parse(r) as StoredUser
  } catch {
    // ignore parse error
  }
  try {
    const r = localStorage.getItem('auth')
    if (r) {
      const j = JSON.parse(r) as { user?: StoredUser } & StoredUser
      return j.user || j
    }
  } catch {
    // ignore parse error
  }
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
  folders.value.some((f) => f.createdBy === currentUserId.value && !!f.ownerFolderName),
)
const hasStructuralChild = computed(() => folders.value.some((f) => !f.ownerFolderName))
const canCreatePersonal = computed(() => {
  if (isRoot.value) return false
  if (isInsideMyPersonalFolder.value) return false
  if (currentFolder.value?.ownerFolderName) return false
  if (hasMyPersonalFolder.value) return false
  if (hasStructuralChild.value) return false
  return !!currentFolder.value
})
const canUploadHere = computed(() => isInsideMyPersonalFolder.value)

const requiredDocs = computed(() => docs.value.filter((d) => !d.storageKey))
const uploadedDocs = computed(() => docs.value.filter((d) => !!d.storageKey))
const filteredDocs = computed(() => {
  let l = uploadedDocs.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    l = l.filter((d) => (d.fileName || '').toLowerCase().includes(q))
  }
  return l
})

function getFileUrl(k: string): string {
  return documentsService.downloadUrl(k, true)
}

function isPdf(doc: DocItem): boolean {
  return !!doc.mimeType?.includes('pdf') || !!doc.fileName?.toLowerCase().endsWith('.pdf')
}

async function load(id: string | null): Promise<void> {
  loading.value = true
  try {
    const [f, d] = await Promise.all([
      foldersService
        .list({ parentId: id ?? 'null', limit: 100, state: true })
        .then((r: { data?: FolderItem[] } | FolderItem[]) => {
          if (Array.isArray(r)) return r
          return r.data || []
        })
        .catch(() => [] as FolderItem[]),
      id
        ? documentsService
            .list({ folderId: id, limit: 100 })
            .then((r: { data?: DocItem[] } | DocItem[]) => {
              if (Array.isArray(r)) return r
              return r.data || []
            })
            .catch(() => [] as DocItem[])
        : Promise.resolve([] as DocItem[]),
    ])
    folders.value = f || []
    docs.value = d || []
    const tpl = d.find((x) => !x.storageKey && x.categoryId && x.typeId)
    if (tpl) parentRequirement.value = tpl
    else if (!id) parentRequirement.value = null
  } finally {
    loading.value = false
  }
}

function enter(f: FolderItem): void {
  breadcrumb.value.push(f)
  currentFolderId.value = f.id
  void load(f.id)
}

function back(): void {
  breadcrumb.value.pop()
  currentFolderId.value = breadcrumb.value.length
    ? breadcrumb.value[breadcrumb.value.length - 1].id
    : null
  if (!breadcrumb.value.length) parentRequirement.value = null
  void load(currentFolderId.value)
}

function goRoot(): void {
  breadcrumb.value = []
  currentFolderId.value = null
  parentRequirement.value = null
  void load(null)
}

function goTo(i: number): void {
  breadcrumb.value = breadcrumb.value.slice(0, i + 1)
  currentFolderId.value = breadcrumb.value[i].id
  void load(currentFolderId.value)
}

async function createPersonal(): Promise<void> {
  if (!currentFolderId.value) return
  try {
    await foldersService.createPersonal({ parentId: currentFolderId.value })
    await load(currentFolderId.value)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al crear carpeta'
    alert(msg)
  }
}

function triggerUpload(): void {
  fileInputRef.value?.click()
}

async function uploadFile(file: File): Promise<void> {
  if (!currentFolderId.value) return
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
    await load(currentFolderId.value)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al subir'
    alert(msg)
  } finally {
    uploading.value = false
  }
}

async function onFilePicked(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadFile(file)
  input.value = ''
}

function onDragOver(e: DragEvent): void {
  e.preventDefault()
  if (canUploadHere.value) isDragging.value = true
}

function onDragLeave(e: DragEvent): void {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  isDragging.value = false
  if (!canUploadHere.value) return
  const f = e.dataTransfer?.files?.[0]
  if (f) void uploadFile(f)
}

async function openPreview(doc: DocItem): Promise<void> {
  previewDoc.value = doc
  showPreview.value = true
  previewLoading.value = true
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value)
    previewBlobUrl.value = null
  }
  try {
    if (!doc.storageKey) throw new Error('Sin storageKey')
    const url = getFileUrl(doc.storageKey)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const blob = await res.blob()
    previewBlobUrl.value = URL.createObjectURL(blob)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    alert('No se pudo abrir: ' + msg)
    showPreview.value = false
  } finally {
    previewLoading.value = false
  }
}

function closePreview(): void {
  showPreview.value = false
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value)
    previewBlobUrl.value = null
  }
}

function openDelete(doc: DocItem): void {
  deleteDoc.value = doc
  showDelete.value = true
}

function cancelDelete(): void {
  showDelete.value = false
  deleteDoc.value = null
}

const confirmDelete = async (): Promise<void> => {
  if (!deleteDoc.value?.id) return
  try {
    await documentsService.delete(deleteDoc.value.id)
    await load(currentFolderId.value)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar'
    alert(msg)
  } finally {
    showDelete.value = false
    deleteDoc.value = null
  }
}

onMounted(() => {
  void load(null)
})

function folderGradient(i: number): string {
  const g = [
    'from-violet-100 to-indigo-100 border-violet-200',
    'from-amber-100 to-orange-100 border-amber-200',
    'from-emerald-100 to-teal-100 border-emerald-200',
    'from-pink-100 to-rose-100 border-pink-200',
  ]
  return g[i % g.length]
}

function folderIconColor(i: number): string {
  const c = ['text-violet-600', 'text-amber-600', 'text-emerald-600', 'text-pink-600']
  return c[i % c.length]
}
</script>

<template>
  <div
    class="min-h-screen bg-[#fbf8ff] -m-6"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      v-if="isDragging && canUploadHere"
      class="fixed inset-0 z-[100] bg-violet-600/20 backdrop-blur-xl flex items-center justify-center"
    >
      <div
        class="bg-white rounded- p-10 shadow-2xl border-4 border-dashed border-violet-300 flex flex-col items-center"
      >
        <div class="h-20 w-20 rounded- bg-violet-600 flex items-center justify-center mb-4">
          <Upload class="h-8 w-8 text-white" />
        </div>
        <h3 class="text- font-bold">¡Suelta aquí!</h3>
        <p class="text- text-zinc-500 mt-1">Subiremos tu archivo automáticamente</p>
      </div>
    </div>

    <div class="max-w- mx-auto px-8 py-8">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
        @change="(e) => void onFilePicked(e)"
      />

      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-2.5 text-">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm font-semibold hover:shadow-md transition"
            @click="goRoot"
          >
            <HardDrive class="h-4 w-4 text-violet-600" /> Mi Drive
          </button>
          <span v-for="(b, i) in breadcrumb" :key="b.id" class="flex items-center gap-2">
            <span class="text-zinc-300">/</span>
            <button
              class="px-3 py-1.5 rounded-full bg-white border hover:shadow-sm text-zinc-600 font-medium"
              @click="() => goTo(i)"
            >
              {{ b.name }}
            </button>
          </span>
        </div>
        <div
          class="hidden md:flex items-center gap-2 text- font-medium text-zinc-500 bg-white border px-3 py-1.5 rounded-full shadow-sm"
        >
          <Users class="h-3 w-3" /> {{ folders.length }} carpetas · Workspace empresarial
        </div>
      </div>

      <div
        class="rounded- bg-white border shadow-[0_20px_60px_-20px_rgba(124,58,237,0.15)] p-8 mb-8 relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w- h- bg-gradient-to-br from-violet-100 via-fuchsia-50 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"
        />
        <div class="relative flex items-center justify-between gap-6">
          <div class="flex gap-5">
            <button
              v-if="currentFolderId"
              class="h-12 w-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
              @click="back"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text- font-[800] tracking-tight leading-none">
                  {{ currentFolder?.name || 'Drive Empresarial' }}
                </h1>
                <span
                  v-if="!currentFolder"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600 text-white text- font-bold tracking-widest"
                >
                  <Sparkles class="h-3 w-3" /> NUEVO
                </span>
                <span
                  v-if="isInsideMyPersonalFolder"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text- font-bold tracking-widest"
                >
                  <Shield class="h-3 w-3" /> PRIVADO
                </span>
              </div>
              <p class="mt-3 text-[13.5px] text-zinc-500 max-w- leading-relaxed">
                Organiza todo en un lugar colorido, buscable y seguro. Arrastra archivos,
                previsualiza y comparte en segundos.
              </p>
            </div>
          </div>
          <div class="flex gap-2.5">
            <button
              v-if="canCreatePersonal"
              class="h-12 px-6 rounded-full bg-zinc-900 text-white text- font-semibold shadow-lg hover:bg-black transition flex items-center"
              @click="() => void createPersonal()"
            >
              <Plus class="h-4 w-4 mr-2" /> Crear mi carpeta
            </button>
            <button
              v-if="canUploadHere"
              :disabled="uploading"
              class="h-12 px-7 rounded-full bg-violet-600 text-white text- font-semibold shadow-[0_10px_20px_rgba(124,58,237,0.3)] hover:bg-violet-700 transition flex items-center disabled:opacity-60"
              @click="triggerUpload"
            >
              <Upload class="h-4 w-4 mr-2" /> {{ uploading ? 'Subiendo...' : 'Subir' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="py-20 flex justify-center">
        <div
          class="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin"
        />
      </div>

      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div
            v-for="(f, i) in folders"
            :key="f.id"
            class="group rounded- border-2 p-6 cursor-pointer hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all"
            :class="folderGradient(i)"
            @click="() => enter(f)"
          >
            <div class="flex justify-between mb-10">
              <div
                class="h-14 w-14 rounded- bg-white shadow-sm border flex items-center justify-center group-hover:scale-110 transition"
              >
                <Folder class="h-7 w-7 fill-current" :class="folderIconColor(i)" />
              </div>
              <div
                v-if="f.createdBy === currentUserId"
                class="h-7 w-7 rounded-full bg-zinc-900 text-white flex items-center justify-center"
              >
                <Shield class="h-3.5 w-3.5" />
              </div>
            </div>
            <p class="font-bold text- text-zinc-900">{{ f.name }}</p>
            <p class="text- text-zinc-600 mt-1">
              {{ f.ownerFolderName ? `De ${f.ownerFolderName}` : 'Carpeta del equipo' }}
            </p>
            <div class="mt-4 flex items-center gap-2 text- font-medium text-zinc-500">
              <span class="h-1 w-1 rounded-full bg-zinc-400" /> Abrir carpeta
            </div>
          </div>
        </div>

        <div
          v-if="currentFolder?.ownerFolderName"
          class="rounded- bg-white border shadow-sm overflow-hidden"
        >
          <div class="px-7 py-5 border-b flex items-center justify-between">
            <h3 class="text- font-bold tracking-wide flex items-center gap-2">
              <span
                class="h-6 w-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center"
              >
                <FileText class="h-3.5 w-3.5" />
              </span>
              ARCHIVOS EN {{ currentFolder?.name?.toUpperCase() }} · {{ filteredDocs.length }}
            </h3>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                v-model="searchQuery"
                placeholder="Buscar..."
                class="h-9 w- pl-9 rounded-full bg-zinc-50 border text- focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0">
            <div
              v-for="doc in filteredDocs"
              :key="doc.id"
              class="group p-5 flex items-center gap-4 hover:bg-violet-50/50 transition border-b md:border-r border-zinc-100"
            >
              <div
                class="h-12 w-12 rounded- bg-gradient-to-br from-zinc-50 to-zinc-100 border flex items-center justify-center"
              >
                <FileText class="h-5 w-5 text-zinc-700" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-[13.5px] truncate">{{ doc.fileName }}</p>
                <p class="text- text-zinc-500 mt-0.5 truncate">{{ doc.mimeType }}</p>
              </div>
              <div class="flex gap-1.5">
                <button
                  v-if="isPdf(doc)"
                  class="h-7 w-7 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black"
                  title="Vista previa"
                  @click="() => void openPreview(doc)"
                >
                  <Eye class="h-3 w-3" />
                </button>
                <a
                  v-if="!isPdf(doc) && doc.storageKey"
                  :href="getFileUrl(doc.storageKey)"
                  target="_blank"
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition"
                >
                  <Download class="h-3 w-3" />
                </a>
                <button
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition"
                  title="Eliminar"
                  @click="() => openDelete(doc)"
                >
                  <TrashIcon class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          <div v-if="!filteredDocs.length" class="py-16 text-center">
            <div
              class="h-16 w-16 rounded- bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-3"
            >
              <FileText class="h-7 w-7 text-violet-400" />
            </div>
            <p class="text- font-medium">No hay archivos aún</p>
            <p class="text- text-zinc-500 mt-1">Arrastra tus documentos aquí</p>
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
              class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center"
            >
              <FileText class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text- truncate">{{ previewDoc?.fileName }}</p>
              <p class="text- text-zinc-500 truncate uppercase tracking-widest">
                {{ previewDoc?.title }}
              </p>
            </div>
          </div>
          <button
            class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black transition"
            @click="closePreview"
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
          ¿Eliminar <span class="font-semibold text-zinc-900">{{ deleteDoc?.fileName }}</span
          >?
        </p>
        <p class="mt-2 text- tracking-widest uppercase text-zinc-400">
          Esta acción no se puede deshacer
        </p>
      </v-card-text>
      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" @click="cancelDelete">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="red" variant="flat" class="rounded-full" @click="() => void confirmDelete()"
          >Confirmar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

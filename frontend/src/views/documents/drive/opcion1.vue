<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { foldersService, documentsService } from '@/services'
import { get } from '@/store/authstore'
import {
  Folder,
  Plus,
  Upload,
  ArrowLeft,
  FolderOpen,
  FileText,
  Download,
  Shield,
  Lock,
  Eye,
  X,
  Layers,
  File as FileIcon,
  Sparkles,
  Users,
  HardDrive,
  TrashIcon,
} from 'lucide-vue-next'

const breadcrumb = ref<any[]>([])
const currentFolderId = ref<string | null>(null)
const folders = ref<any[]>([])
const docs = ref<any[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parentRequirement = ref<any>(null)
const showDelete = ref(false)
const deleteDoc = ref<any>(null)
const showPreview = ref(false)
const previewDoc = ref<any>(null)
const previewBlobUrl = ref<string | null>(null)
const previewLoading = ref(false)

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

function isPdf(doc: any) {
  return doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf')
}
function getFileUrl(storageKey: string) {
  return documentsService.downloadUrl(storageKey, true)
}

async function openPreview(doc: any) {
  previewDoc.value = doc
  showPreview.value = true
  previewLoading.value = true
  previewBlobUrl.value = null
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

async function openDelete(doc: any) {
  deleteDoc.value = doc
  showDelete.value = true
}

function closePreview() {
  showPreview.value = false
  if (previewBlobUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewBlobUrl.value)
  previewBlobUrl.value = null
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
  } finally {
    loading.value = false
  }
}
function enter(folder: any) {
  breadcrumb.value.push(folder)
  currentFolderId.value = folder.id
  load(folder.id)
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
onMounted(() => load(null))
</script>

<template>
  <div class="min-h-screen bg-[#f8f8f7] -m-6 p-6 lg:p-8">
    <div class="max-w- mx-auto">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
        @change="onFilePicked"
      />

      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-2.5 text-">
          <div
            class="flex items-center gap-2 font-semibold text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
            @click="goRoot"
          >
            <HardDrive class="h-4 w-4 text-zinc-700" /> Mi Drive
          </div>
          <template v-for="(b, i) in breadcrumb" :key="b.id">
            <span class="text-zinc-300">/</span>
            <button
              class="px-2.5 py-1 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200 transition-all text-zinc-500 hover:text-zinc-900 font-medium"
              @click="goTo(i)"
            >
              {{ b.name }}
            </button>
          </template>
        </div>
        <div
          class="hidden md:flex items-center gap-2 text- font-medium tracking-widest text-zinc-400"
        >
          <span class="flex items-center gap-1"><Shield class="h-3 w-3" /> ENCRIPTADO</span>
          <span class="h-3 w-px bg-zinc-200" />
          <span class="flex items-center gap-1"><Users class="h-3 w-3" /> EMPRESARIAL</span>
        </div>
      </div>

      <div
        class="relative overflow-hidden rounded- bg-white border border-zinc-200/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] mb-8"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-amber-50/60 pointer-events-none"
        />
        <div
          class="relative p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div class="flex items-start gap-4 min-w-0">
            <button
              v-if="currentFolderId"
              @click="back"
              class="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-sm hover:bg-black transition shrink-0"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text- leading-none font-[700] tracking-tight text-zinc-900 truncate">
                  {{ currentFolder?.name || 'Drive Empresarial' }}
                </h1>
                <span
                  v-if="isInsideMyPersonalFolder"
                  class="inline-flex items-center gap-1.5 text- font-semibold tracking-widest bg-[#101828] text-white px-3 py-1.5 rounded-full ring-1 ring-white/10"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> PRIVADO
                </span>
                <span
                  v-else-if="isRoot"
                  class="inline-flex items-center gap-1.5 text- font-semibold tracking-widest bg-indigo-600 text-white px-3 py-1.5 rounded-full"
                  ><Sparkles class="h-3 w-3" /> WORKSPACE</span
                >
              </div>
              <p class="mt-2.5 text-[13.5px] text-zinc-500 max-w- leading-relaxed">
                <span v-if="isRoot"
                  >Gestión documental centralizada. Organiza, protege y audita la información de tu
                  empresa.</span
                >
                <span v-else-if="isInsideMyPersonalFolder"
                  >Carpeta personal protegida. Solo tú y RRHH pueden ver estos archivos. Todo queda
                  registrado.</span
                >
                <span v-else
                  >Carpeta del sistema · {{ folders.length }} subcarpetas ·
                  {{ uploadedDocs.length }} archivos</span
                >
              </p>
            </div>
          </div>
          <div class="flex gap-2.5 shrink-0">
            <button
              v-if="canCreatePersonal"
              @click="createPersonal"
              class="h- px-6 rounded-full bg-zinc-900 text-white text-[13.5px] font-semibold flex items-center shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-black transition"
            >
              <Plus class="h-4 w-4 mr-2" /> Crear mi carpeta
            </button>
            <button
              v-if="canUploadHere"
              @click="triggerUpload"
              :disabled="uploading"
              class="h- px-6 rounded-full bg-[#3c50e0] text-white text-[13.5px] font-semibold flex items-center shadow-[0_8px_20px_rgba(60,80,224,0.3)] hover:bg-[#3445c7] transition disabled:opacity-60"
            >
              <Upload class="h-4 w-4 mr-2" /> {{ uploading ? 'Subiendo...' : 'Subir documento' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="py-24 flex flex-col items-center gap-3">
        <div
          class="h-10 w-10 border- border-zinc-200 border-t-zinc-900 rounded-full animate-spin"
        />
        <p class="text- tracking-widest font-semibold text-zinc-400">CARGANDO VAULT</p>
      </div>

      <template v-else>
        <div class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text- font-bold tracking-[0.18em] text-zinc-400 flex items-center gap-2">
              <Layers class="h-3.5 w-3.5" /> CARPETAS
            </h3>
            <span
              v-if="folders.length"
              class="text- font-medium bg-white border px-2.5 py-1 rounded-full text-zinc-500"
              >{{ folders.length }} carpetas</span
            >
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="f in folders"
              :key="f.id"
              @click="enter(f)"
              class="group relative rounded- border border-zinc-200 bg-white p- hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div class="rounded- bg-white p-5 h-full">
                <div class="flex justify-between items-start mb-6">
                  <div
                    class="h- w- rounded- bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition"
                  >
                    <Folder class="h-7 w-7 text-amber-500 fill-amber-200/60" />
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Lock
                      v-if="f.ownerFolderName && f.createdBy !== currentUserId"
                      class="h-3.5 w-3.5 text-zinc-300"
                    />
                    <div
                      v-if="f.createdBy === currentUserId"
                      class="h-7 w-7 rounded-full bg-[#101828] text-white flex items-center justify-center shadow-sm"
                    >
                      <Shield class="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
                <p class="font-semibold text-[14.5px] text-zinc-900 truncate">{{ f.name }}</p>
                <p class="mt-1 text-[12.5px] text-zinc-500 truncate flex items-center gap-1">
                  <span v-if="f.ownerFolderName" class="inline-flex items-center gap-1"
                    ><span class="h-1 w-1 rounded-full bg-zinc-400" /> De:
                    {{ f.ownerFolderName }}</span
                  >
                  <span v-else>{{ f.description || 'Carpeta empresarial' }}</span>
                </p>
                <div class="mt-4 h-px bg-gradient-to-r from-zinc-100 to-transparent" />
                <div class="mt-3 flex items-center justify-between text- text-zinc-400 font-medium">
                  <span>Acceso protegido</span
                  ><span class="group-hover:text-zinc-900 transition">Abrir →</span>
                </div>
              </div>
            </div>
            <div
              v-if="!folders.length && isRoot"
              class="rounded- border border-dashed border-zinc-300 bg-zinc-50/50 p-6 flex flex-col items-center justify-center text-center min-h-"
            >
              <div
                class="h-12 w-12 rounded-full bg-white border flex items-center justify-center mb-3"
              >
                <FolderOpen class="h-5 w-5 text-zinc-400" />
              </div>
              <p class="text- font-medium text-zinc-600">No hay carpetas raíz</p>
              <p class="text- text-zinc-400 mt-1">El administrador debe crear la estructura</p>
            </div>
          </div>
        </div>

        <div
          v-if="currentFolder?.ownerFolderName"
          class="rounded- border border-zinc-200 bg-white shadow-[0_8px_30px_-16px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          <div
            class="px-7 py-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60"
          >
            <h3 class="text- font-bold tracking-[0.18em] text-zinc-500 flex items-center gap-2">
              <FileIcon class="h-4 w-4" /> ARCHIVOS EN
              {{ (currentFolder?.name || '').toUpperCase() }}
            </h3>
            <span
              v-if="uploadedDocs.length"
              class="text- font-semibold bg-zinc-900 text-white px-3 py-1 rounded-full"
              >{{ uploadedDocs.length }} archivos</span
            >
          </div>

          <div
            v-if="!uploadedDocs.length"
            class="px-6 py-16 flex flex-col items-center text-center"
          >
            <div
              class="h-20 w-20 rounded- bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 shadow-inner"
            >
              <FileText class="h-9 w-9 text-zinc-300" />
            </div>
            <p class="font-semibold text-zinc-900">Vault vacío</p>
            <p class="text- text-zinc-500 mt-1 max-w-">
              Aún no has subido documentos a tu carpeta privada. Los archivos aquí están cifrados y
              auditados.
            </p>
            <button
              v-if="canUploadHere"
              @click="triggerUpload"
              class="mt-5 h-10 px-5 rounded-full bg-zinc-900 text-white text- font-medium"
            >
              Subir primer documento
            </button>
          </div>

          <div v-else class="divide-y divide-zinc-100">
            <div
              v-for="doc in uploadedDocs"
              :key="doc.id"
              class="group px-5 sm:px-7 py-4 flex items-center gap-4 hover:bg-zinc-50/70 transition"
            >
              <div
                class="h-11 w-11 rounded- bg-[#eef2ff] border border-indigo-100 flex items-center justify-center shrink-0"
              >
                <FileText class="h-5 w-5 text-[#3c50e0]" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-[600] text-[13.5px] text-zinc-900 truncate">
                  {{ doc.fileName || doc.title }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    class="text- px-2 py-0.5 rounded-full bg-zinc-100 border text-zinc-500 font-medium"
                    >{{ doc.mimeType?.split('/').pop()?.toUpperCase() || 'DOC' }}</span
                  >
                  <span class="text- text-zinc-400">· Seguro</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                <button
                  v-if="isPdf(doc)"
                  @click="openPreview(doc)"
                  class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black shadow-sm"
                  title="Vista previa"
                >
                  <Eye class="h-4 w-4" />
                </button>
                <a
                  v-if="!isPdf(doc)"
                  :href="getFileUrl(doc.storageKey)"
                  target="_blank"
                  class="h-9 w-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 hover:text-zinc-900 transition"
                  ><Download class="h-4 w-4"
                /></a>
                <button
                  @click="openDelete(doc)"
                  target="_blank"
                  class="h-9 w-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:border-zinc-900 hover:text-zinc-900 transition"
                >
                  <TrashIcon class="h-4 w-4" />
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
              class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center"
            >
              <FileText class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text- truncate">{{ previewDoc?.fileName }}</p>
              <p class="text- text-zinc-500 truncate">{{ previewDoc?.title }}</p>
            </div>
          </div>
          <button
            @click="closePreview"
            class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center"
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
        <p>Eliminar documento: {{ deleteDoc?.fileName }}</p>
        <p class="mt-3 text-sm">¿Deseas continuar?</p>
      </v-card-text>
      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" @click="((showDelete = false), (deleteDoc = null))">Cancelar</v-btn>
        <v-spacer />
        <v-btn @click="confirmDelete"> Confirmar </v-btn>
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

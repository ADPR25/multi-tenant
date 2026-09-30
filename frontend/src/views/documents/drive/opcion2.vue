<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { foldersService, documentsService } from '@/services'
import { get } from '@/store/authstore'
import { Folder, Eye, Search, HardDrive } from 'lucide-vue-next'

const breadcrumb = ref<any[]>([])
const currentFolderId = ref<string | null>(null)
const folders = ref<any[]>([])
const docs = ref<any[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parentRequirement = ref<any>(null)
const searchQuery = ref('')
const previewDoc = ref<any>(null)
const showPreview = ref(false)
const previewUrl = ref<string | null>(null)

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
  if (!!currentFolder.value?.ownerFolderName) return false
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
    if (tpl) {
      parentRequirement.value = tpl
    } else if (!id) {
      parentRequirement.value = null
    }
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
  fd.append('description', '')
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
  try {
    const url = getFileUrl(doc.storageKey)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const blob = await res.blob()
    if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    alert('No se pudo abrir PDF: ' + e.message)
    showPreview.value = false
  }
}
function closePreview() {
  showPreview.value = false
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}
onMounted(() => load(null))
</script>

<template>
  <div class="min-h-screen bg-white -m-6">
    <div class="max-w- mx-auto px-10 py-10">
      <input ref="fileInputRef" type="file" class="hidden" @change="onFilePicked" />
      <div class="flex items-center gap-2 text- tracking-[0.08em] font-medium text-zinc-400 mb-12">
        <button
          @click="goRoot"
          class="flex items-center gap-1.5 text-zinc-900 hover:opacity-60 transition"
        >
          <HardDrive class="h-3 w-3" /> DRIVE
        </button>
        <span v-for="(b, i) in breadcrumb" :key="b.id" class="flex items-center gap-2"
          ><span class="text-zinc-300">—</span
          ><button @click="goTo(i)" class="hover:text-zinc-900 uppercase">
            {{ b.name }}
          </button></span
        >
      </div>

      <div class="flex items-start justify-between mb-16">
        <div>
          <h1 class="text- font-[300] tracking-[-0.03em] leading-none text-zinc-900">
            {{ currentFolder?.name || 'Drive' }}
          </h1>
          <p class="mt-3 text- text-zinc-400 font-[400]">
            {{ folders.length }} carpetas · {{ uploadedDocs.length }} archivos · AES-256
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
            class="h-8 px-4 rounded-full bg-zinc-900 text-white text- font-medium tracking-widest"
          >
            {{ uploading ? 'SUBIENDO...' : 'SUBIR' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-20 text- tracking-widest text-zinc-400">CARGANDO...</div>

      <template v-else>
        <div class="grid grid-cols-12 gap-px bg-zinc-200 border border-zinc-200 mb-16">
          <div
            v-for="f in folders"
            :key="f.id"
            @click="enter(f)"
            class="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-7 hover:bg-zinc-50 cursor-pointer group transition"
          >
            <Folder class="h-5 w-5 text-zinc-900 mb-8 stroke-[1.25]" />
            <p class="text- font-medium text-zinc-900 truncate">
              {{ f.name }}
            </p>
            <p class="text- text-zinc-400 mt-1 truncate uppercase tracking-widest">
              {{ f.ownerFolderName ? `De ${f.ownerFolderName}` : 'Carpeta' }}
            </p>
          </div>
        </div>

        <div v-if="currentFolder?.ownerFolderName" class="border-t border-zinc-900 pt-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text- font-medium tracking-[0.2em] text-zinc-900">
              ARCHIVOS — {{ currentFolder?.name?.toUpperCase() }}
            </h3>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400"
              /><input
                v-model="searchQuery"
                placeholder="FILTRAR"
                class="h-7 w- pl-8 bg-zinc-50 border border-zinc-200 rounded-full text- tracking-widest placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
          <div class="divide-y divide-zinc-100">
            <div
              v-for="doc in filteredDocs"
              :key="doc.id"
              class="group flex items-center justify-between py-5 hover:pl-2 transition-all"
            >
              <div class="flex items-center gap-4 min-w-0">
                <div class="h-8 w-px bg-zinc-900" />
                <div class="min-w-0">
                  <p class="text- font-medium text-zinc-900 truncate">
                    {{ doc.fileName }}
                  </p>
                  <p class="text- text-zinc-400 mt-0.5 font-mono">
                    {{ doc.mimeType }} — {{ doc.id.slice(0, 8) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="openPreview(doc)"
                  class="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition"
                >
                  <Eye class="h-3 w-3" /></button
                ><a
                  :href="getFileUrl(doc.storageKey)"
                  target="_blank"
                  class="h-7 px-3 rounded-full border border-zinc-200 text- tracking-widest hover:bg-zinc-900 hover:text-white transition flex items-center"
                  >DESCARGAR</a
                >
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showPreview" class="fixed inset-0 z-[9999] bg-white flex flex-col">
      <div class="h-12 border-b flex items-center justify-between px-6">
        <span class="text- tracking-widest">{{ previewDoc?.fileName }}</span
        ><button
          @click="closePreview"
          class="text- tracking-widest border border-zinc-900 px-3 py-1 rounded-full"
        >
          CERRAR
        </button>
      </div>
      <iframe v-if="previewUrl" :src="previewUrl" class="flex-1 w-full border-0" />
    </div>
  </div>
</template>

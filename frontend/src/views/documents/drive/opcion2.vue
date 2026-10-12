<script setup lang="ts">
defineOptions({ name: "DriveOpcion2View" });

import { ref, onMounted, computed } from "vue";
import { foldersService, documentsService } from "@/services";
import { get } from "@/store/authstore";
import { usePermissions } from "@/composables/usePermissions";
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
  Info,
  CheckCircle2,
  FileUp,
} from "lucide-vue-next";

interface FolderItem {
  id: string;
  name: string;
  description?: string | null;
  ownerFolderName?: string | null;
  createdBy?: string;
  parentId?: string | null;
}
interface DocItem {
  id: string;
  fileName: string | null;
  title?: string;
  description?: string | null;
  content?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  categoryId?: string;
  typeId?: string;
  createdAt?: string;
  category?: { name: string } | null;
  type?: { name: string } | null;
}
interface StoredUser {
  id?: string;
  sub?: string;
  _id?: string;
  userId?: string;
}

const { can, permissions, load: loadPerms, isSuper } = usePermissions();

const breadcrumb = ref<FolderItem[]>([]);
const currentFolderId = ref<string | null>(null);
const folders = ref<FolderItem[]>([]);
const docs = ref<DocItem[]>([]);
const loading = ref(false);
const uploading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const parentRequirement = ref<DocItem | null>(null);
const searchQuery = ref("");
const previewDoc = ref<DocItem | null>(null);
const showPreview = ref(false);
const previewBlobUrl = ref<string | null>(null);
const previewLoading = ref(false);
const showDelete = ref(false);
const deleteDoc = ref<DocItem | null>(null);

const storedUser = computed<StoredUser>(() => {
  try {
    const authStore = get as unknown as Record<string, unknown>;
    const useAuth = authStore["useAuth"];
    if (typeof useAuth === "function") {
      const u = (useAuth as (k: string) => StoredUser)("user");
      if (u?.id) return u;
    }
    const obj = authStore["useAuth"] as { user?: StoredUser } | undefined;
    if (obj?.user?.id) return obj.user;
  } catch (e) {
    console.error(e);
  }
  try {
    const r = localStorage.getItem("user");
    if (r) return JSON.parse(r) as StoredUser;
  } catch (e) {
    console.error(e);
  }
  try {
    const r = localStorage.getItem("auth_user");
    if (r) return JSON.parse(r) as StoredUser;
  } catch (e) {
    console.error(e);
  }
  try {
    const r = localStorage.getItem("auth");
    if (r) {
      const j = JSON.parse(r) as { user?: StoredUser } & StoredUser;
      return j.user || j;
    }
  } catch (e) {
    console.error(e);
  }
  return {};
});

const currentUserId = computed(
  () =>
    storedUser.value?.id ||
    storedUser.value?.sub ||
    storedUser.value?._id ||
    storedUser.value?.userId ||
    "",
);
const currentFolder = computed(
  () => breadcrumb.value[breadcrumb.value.length - 1] || null,
);
const isRoot = computed(() => !currentFolder.value);

const isRevisor = computed(
  () =>
    isSuper.value ||
    can("documents:drive:revisor") ||
    permissions.value.includes("documents:drive:revisor"),
);
const isPersonalFolder = computed(() => !!currentFolder.value?.ownerFolderName);
const isInsideMyPersonalFolder = computed(
  () =>
    isPersonalFolder.value &&
    currentFolder.value?.createdBy === currentUserId.value,
);
const canViewFiles = computed(
  () =>
    isInsideMyPersonalFolder.value ||
    (isPersonalFolder.value && isRevisor.value),
);

const visibleFolders = computed(() => {
  return folders.value.filter((f) => {
    if (!f.ownerFolderName) return true;
    if (f.createdBy === currentUserId.value) return true;
    if (isRevisor.value) return true;
    return false;
  });
});

const hasMyPersonalFolder = computed(() =>
  folders.value.some(
    (f) => f.createdBy === currentUserId.value && !!f.ownerFolderName,
  ),
);
const hasStructuralChild = computed(() =>
  folders.value.some((f) => !f.ownerFolderName),
);

const requiredDocs = computed(() => docs.value.filter((d) => !d.storageKey));
const uploadedDocs = computed(() => docs.value.filter((d) => !!d.storageKey));
const bannerDoc = computed(() => requiredDocs.value[0] ?? null);
const uploadTemplate = computed(
  () => requiredDocs.value[0] ?? parentRequirement.value ?? null,
);

const canCreatePersonal = computed(() => {
  if (isRoot.value) return false;
  if (isInsideMyPersonalFolder.value) return false;
  if (currentFolder.value?.ownerFolderName) return false;
  if (hasMyPersonalFolder.value) return false;
  if (hasStructuralChild.value) return false;
  return !!currentFolder.value;
});
const canUploadHere = computed(() => isInsideMyPersonalFolder.value);

const filteredDocs = computed(() => {
  let l = uploadedDocs.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    l = l.filter((d) =>
      (d.fileName || d.title || "").toLowerCase().includes(q),
    );
  }
  return l;
});

function isPdf(doc: DocItem): boolean {
  return (
    !!doc.mimeType?.includes("pdf") ||
    !!doc.fileName?.toLowerCase().endsWith(".pdf")
  );
}
function getFileUrl(k: string): string {
  return documentsService.downloadUrl(k, true);
}

async function load(id: string | null): Promise<void> {
  loading.value = true;
  try {
    const [f, d] = await Promise.all([
      foldersService
        .list({ parentId: id ?? "null", limit: 100, state: true })
        .then((r: { data?: FolderItem[] } | FolderItem[]) =>
          Array.isArray(r) ? r : r.data || [],
        )
        .catch(() => [] as FolderItem[]),
      id
        ? documentsService
            .list({ folderId: id, limit: 100 })
            .then((r: { data?: DocItem[] } | DocItem[]) =>
              Array.isArray(r) ? r : r.data || [],
            )
            .catch(() => [] as DocItem[])
        : Promise.resolve([] as DocItem[]),
    ]);
    folders.value = f || [];
    docs.value = d || [];

    if (
      currentFolder.value?.ownerFolderName &&
      currentFolder.value?.createdBy !== currentUserId.value &&
      !isRevisor.value
    ) {
      alert(
        `Acceso denegado. Carpeta de ${currentFolder.value.ownerFolderName}`,
      );
      back();
      return;
    }

    const tpl = d.find((x) => !x.storageKey && x.categoryId && x.typeId);
    if (tpl) parentRequirement.value = tpl;
    else if (!id) parentRequirement.value = null;
  } finally {
    loading.value = false;
  }
}
function enter(f: FolderItem): void {
  if (
    f.ownerFolderName &&
    f.createdBy !== currentUserId.value &&
    !isRevisor.value
  ) {
    alert(
      `Acceso denegado. Esta carpeta es de ${f.ownerFolderName}. Solo un revisor puede entrar.`,
    );
    return;
  }
  breadcrumb.value.push(f);
  currentFolderId.value = f.id;
  void load(f.id);
}
function goRoot(): void {
  breadcrumb.value = [];
  currentFolderId.value = null;
  parentRequirement.value = null;
  void load(null);
}
function goTo(i: number): void {
  breadcrumb.value = breadcrumb.value.slice(0, i + 1);
  currentFolderId.value = breadcrumb.value[i].id;
  void load(currentFolderId.value);
}

async function createPersonal(): Promise<void> {
  if (!currentFolderId.value) return;
  try {
    await foldersService.createPersonal({ parentId: currentFolderId.value });
    await load(currentFolderId.value);
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : "Error al crear");
  }
}
function triggerUpload(): void {
  fileInputRef.value?.click();
}
async function onFilePicked(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !currentFolderId.value) return;
  if (!isInsideMyPersonalFolder.value) {
    alert("Solo puedes subir dentro de tu carpeta personal");
    return;
  }
  const template = uploadTemplate.value;
  if (!template?.categoryId || !template?.typeId) {
    alert("La carpeta padre no tiene configurada categoria y tipo");
    return;
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("title", currentFolder.value?.name || "doc");
  fd.append(
    "description",
    `Archivo de ${currentFolder.value?.name} - ${new Date().toLocaleDateString()}`,
  );
  fd.append("folderId", currentFolderId.value);
  fd.append("categoryId", template.categoryId);
  fd.append("typeId", template.typeId);
  try {
    uploading.value = true;
    await documentsService.upload(fd);
    await load(currentFolderId.value);
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : "Error al subir");
  } finally {
    uploading.value = false;
    if (input) input.value = "";
  }
}
async function openPreview(doc: DocItem): Promise<void> {
  previewDoc.value = doc;
  showPreview.value = true;
  previewLoading.value = true;
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value);
    previewBlobUrl.value = null;
  }
  try {
    if (!doc.storageKey) throw new Error("Sin storageKey");
    const url = getFileUrl(doc.storageKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    previewBlobUrl.value = URL.createObjectURL(blob);
  } catch (e: unknown) {
    alert(
      "No se pudo abrir PDF: " + (e instanceof Error ? e.message : "Error"),
    );
    showPreview.value = false;
  } finally {
    previewLoading.value = false;
  }
}
function closePreview(): void {
  showPreview.value = false;
  if (previewBlobUrl.value?.startsWith("blob:"))
    URL.revokeObjectURL(previewBlobUrl.value);
  previewBlobUrl.value = null;
}
function openDelete(doc: DocItem): void {
  deleteDoc.value = doc;
  showDelete.value = true;
}
const confirmDelete = async (): Promise<void> => {
  if (!deleteDoc.value?.id) return;
  try {
    await documentsService.delete(deleteDoc.value.id);
    await load(currentFolderId.value);
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : "Error al eliminar");
  } finally {
    showDelete.value = false;
    deleteDoc.value = null;
  }
};
onMounted(async () => {
  await loadPerms();
  void load(null);
});
</script>

<template>
  <div class="min-h-screen bg-white -m-6">
    <div class="max-w- mx-auto px-10 py-10">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls"
        @change="(e) => void onFilePicked(e)"
      />

      <div
        class="flex items-center gap-2 text- tracking-[0.08em] font-medium text-zinc-400 mb-12"
      >
        <button
          class="flex items-center gap-1.5 text-zinc-900 hover:opacity-60 transition"
          @click="goRoot"
        >
          <HardDrive class="h-3 w-3" /> DRIVE
        </button>
        <span
          v-for="(b, i) in breadcrumb"
          :key="b.id"
          class="flex items-center gap-2"
          ><span class="text-zinc-300">—</span
          ><button class="hover:text-zinc-900 uppercase" @click="() => goTo(i)">
            {{ b.name }}
          </button></span
        >
        <span
          v-if="isRevisor"
          class="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text- tracking-widest"
          ><Eye class="h-3 w-3" /> REVISOR</span
        >
      </div>

      <div class="flex items-start justify-between mb-12">
        <div>
          <h1
            class="text- font-[300] tracking-[-0.03em] leading-none text-zinc-900"
          >
            {{ currentFolder?.name || "Drive" }}
          </h1>
          <p
            class="mt-3 text- text-zinc-400 font-[400] uppercase tracking-widest"
          >
            {{ visibleFolders.length }} carpetas ·
            {{ uploadedDocs.length }} archivos · AES-256
            <span
              v-if="isInsideMyPersonalFolder"
              class="ml-2 inline-flex items-center gap-1 bg-zinc-900 text-white px-2 py-0.5 rounded-full"
              >PRIVADO</span
            >
            <span
              v-if="isPersonalFolder && isRevisor && !isInsideMyPersonalFolder"
              class="ml-2 inline-flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full"
              >REVISANDO: {{ currentFolder?.ownerFolderName }}</span
            >
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="canCreatePersonal"
            class="h-8 px-4 rounded-full border border-zinc-900 text- font-medium tracking-widest hover:bg-zinc-900 hover:text-white transition"
            @click="() => void createPersonal()"
          >
            + CREAR MI CARPETA
          </button>
          <button
            v-if="canUploadHere"
            :disabled="uploading"
            class="h-8 px-4 rounded-full bg-zinc-900 text-white text- font-medium tracking-widest disabled:opacity-60"
            @click="triggerUpload"
          >
            {{ uploading ? "SUBIENDO..." : "SUBIR" }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-20 text- tracking-widest text-zinc-400">
        CARGANDO VAULT...
      </div>

      <template v-else>
        <div
          v-if="bannerDoc"
          class="mb-12 border border-amber-200 bg-[#fffcf5] p-7"
        >
          <div class="flex gap-5">
            <div
              class="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0"
            >
              <FileText class="h-5 w-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3
                  class="font-bold text- tracking-widest uppercase text-zinc-900"
                >
                  {{ bannerDoc.title }}
                </h3>
                <span
                  class="inline-flex items-center gap-1 text- font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500 text-white"
                  ><Info class="h-3 w-3" /> INSTRUCCIÓN</span
                >
                <span
                  v-if="bannerDoc.category?.name || bannerDoc.type?.name"
                  class="text- px-2 py-0.5 rounded-full bg-zinc-900 text-white"
                  >{{ bannerDoc.category?.name }} •
                  {{ bannerDoc.type?.name }}</span
                >
              </div>
              <p class="mt-2 text-[12.5px] text-zinc-700 leading-relaxed">
                {{ bannerDoc.description }}
              </p>
              <div
                v-if="bannerDoc.content"
                class="mt-4 flex gap-3 bg-white border border-amber-200 p-4"
              >
                <CheckCircle2 class="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p class="text- font-bold tracking-widest text-amber-700">
                    QUÉ DEBES SUBIR
                  </p>
                  <p class="text- text-zinc-700 mt-1 leading-relaxed">
                    {{ bannerDoc.content }}
                  </p>
                </div>
              </div>
              <p
                class="mt-3 flex items-center gap-1.5 text- tracking-widest text-zinc-400 uppercase"
              >
                <FileUp class="h-3 w-3" /> PDF, JPG, PNG, DOCX, XLSX • Máx 20MB
                • Auditado
              </p>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-12 gap-px bg-zinc-200 border border-zinc-200 mb-16"
        >
          <div
            v-for="f in visibleFolders"
            :key="f.id"
            class="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-7 hover:bg-zinc-50 cursor-pointer group transition"
            @click="() => enter(f)"
          >
            <div class="flex justify-between items-start mb-8">
              <Folder
                class="h-5 w-5 text-zinc-900 stroke-[1.25] group-hover:scale-105 transition"
              />
              <div class="flex gap-1.5">
                <Lock
                  v-if="
                    f.ownerFolderName &&
                    f.createdBy !== currentUserId &&
                    !isRevisor
                  "
                  class="h-3.5 w-3.5 text-zinc-300"
                />
                <Shield
                  v-if="f.createdBy === currentUserId"
                  class="h-3.5 w-3.5 text-zinc-900"
                />
                <Eye
                  v-if="isRevisor && f.ownerFolderName"
                  class="h-3.5 w-3.5 text-amber-500"
                />
              </div>
            </div>
            <p class="text- font-medium text-zinc-900 truncate">{{ f.name }}</p>
            <p
              class="text- text-zinc-400 mt-1 truncate uppercase tracking-widest"
            >
              {{
                f.ownerFolderName
                  ? `De ${f.ownerFolderName}`
                  : f.description || "Carpeta"
              }}
            </p>
          </div>
          <div
            v-if="!visibleFolders.length && !isRoot"
            class="col-span-12 bg-zinc-50 p-10 text-center text- tracking-widest text-zinc-400"
          >
            NO TIENES CARPETAS VISIBLES AQUÍ
          </div>
          <div
            v-if="!visibleFolders.length && isRoot"
            class="col-span-12 bg-zinc-50 p-10 text-center text- tracking-widest text-zinc-400"
          >
            NO HAY CARPETAS RAÍZ — EL ADMIN DEBE CREAR LA ESTRUCTURA
          </div>
        </div>

        <div v-if="canViewFiles" class="border-t border-zinc-900 pt-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text- font-medium tracking-[0.2em] text-zinc-900">
              ARCHIVOS — {{ currentFolder?.name?.toUpperCase() }} ·
              {{ filteredDocs.length
              }}<span
                v-if="
                  isRevisor && isPersonalFolder && !isInsideMyPersonalFolder
                "
                class="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                >MODO REVISOR</span
              >
            </h3>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400"
              /><input
                v-model="searchQuery"
                placeholder="FILTRAR"
                class="h-7 w-32 pl-8 bg-zinc-50 border border-zinc-200 rounded-full text- tracking-widest placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
          <div v-if="!filteredDocs.length" class="py-16 text-center">
            <p class="text- font-medium text-zinc-900">Vault vacío</p>
            <p class="text- text-zinc-400 mt-1 uppercase tracking-widest">
              Aún no hay archivos
            </p>
            <button
              v-if="canUploadHere"
              class="mt-6 h-8 px-4 rounded-full bg-zinc-900 text-white text- tracking-widest"
              @click="triggerUpload"
            >
              SUBIR PRIMER DOCUMENTO
            </button>
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
              <div
                class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition"
              >
                <button
                  v-if="isPdf(doc)"
                  class="h-7 w-7 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black"
                  @click="() => void openPreview(doc)"
                >
                  <Eye class="h-3 w-3" />
                </button>
                <a
                  v-if="!isPdf(doc) && doc.storageKey"
                  :href="getFileUrl(doc.storageKey)"
                  target="_blank"
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition"
                  ><Download class="h-3 w-3"
                /></a>
                <button
                  v-if="
                    can('documents:docs:delete') || isInsideMyPersonalFolder
                  "
                  class="h-7 w-7 rounded-full border border-zinc-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition"
                  @click="() => openDelete(doc)"
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
    <Transition name="fade"
      ><div
        v-if="showPreview"
        class="fixed inset-0 z-[99999] bg-[#0a0a0a]/80 backdrop-blur-xl flex flex-col"
      >
        <div
          class="h-14 shrink-0 bg-white/95 backdrop-blur border-b flex items-center justify-between px-6"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center"
            >
              <FileText class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text- truncate">
                {{ previewDoc?.fileName }}
              </p>
              <p class="text- text-zinc-500 truncate tracking-widest uppercase">
                {{ previewDoc?.title }}
              </p>
            </div>
          </div>
          <button
            class="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-black"
            @click="closePreview"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div
          class="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8"
        >
          <div
            v-if="previewLoading"
            class="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin"
          />
          <iframe
            v-else-if="previewBlobUrl"
            :src="previewBlobUrl"
            class="w-full h-full max-w- bg-white rounded shadow-[0_30px_90px_rgba(0,0,0,0.5)] border-0"
          />
        </div></div
    ></Transition>
  </Teleport>

  <v-dialog v-model="showDelete" max-width="450" persistent>
    <v-card class="rounded-2xl"
      ><v-card-title class="flex items-center gap-3 pt-6 px-6"
        ><div
          class="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"
        >
          <TrashIcon class="h-5 w-5 text-red-500" />
        </div>
        <h3 class="text-lg font-semibold text-zinc-900">
          Eliminar documento
        </h3></v-card-title
      ><v-card-text class="px-6 pb-2 text-gray-600"
        ><p class="text-">
          Eliminar documento:
          <span class="font-semibold text-zinc-900">{{
            deleteDoc?.fileName
          }}</span>
        </p>
        <p class="mt-3 text- tracking-widest text-zinc-400 uppercase">
          Esta acción no se puede deshacer
        </p></v-card-text
      ><v-card-actions class="p-6 pt-4"
        ><v-btn variant="text" @click="showDelete = false">Cancelar</v-btn
        ><v-spacer /><v-btn
          color="red"
          variant="flat"
          class="rounded-full"
          @click="() => void confirmDelete()"
          >Confirmar</v-btn
        ></v-card-actions
      ></v-card
    >
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

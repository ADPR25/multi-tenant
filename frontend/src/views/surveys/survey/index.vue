<script setup lang="ts">
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { surveysService, type Survey } from "@/services";
import { usePermissions } from "@/composables/usePermissions";
import {
  Plus,
  Pencil,
  Power,
  ClipboardList,
  X,
  Clipboard,
  Copy,
  ExternalLink,
  Link2,
  Check,
  Printer,
} from "lucide-vue-next";

defineOptions({ name: "SurveyIndexView" });

const { can } = usePermissions();

const mode = ref<"list" | "create" | "edit">("list");
const selected = ref<Survey | null>(null);
const tableRef = ref<{ reload: () => void } | null>(null);
const showLinkModal = ref(false);
const linkToShow = ref("");
const linkCopied = ref(false);
const surveySelectedForLink = ref<Survey | null>(null);

const headers = [
  { title: "Título", key: "title" },
  { title: "Descripción", key: "description" },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate() {
  selected.value = null;
  mode.value = "create";
}

async function print(item: Survey) {
  try {
    const blob = await surveysService.print(item.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `encuesta-${item.title ?? item.id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  }
}

async function openEdit(item: Survey) {
  try {
    const data = await surveysService.getById(item.id);
    selected.value = data;
    mode.value = "edit";
  } catch (e) {
    console.error(e);
  }
}

function closeList() {
  mode.value = "list";
  selected.value = null;
  tableRef.value?.reload();
}

function openLinkModal(item: Survey) {
  surveySelectedForLink.value = item;
  const baseUrl = import.meta.env.VITE_SURVEY_URL as string;
  const cleanBase = baseUrl?.replace(/\/$/, "") || "";
  linkToShow.value = `${cleanBase}/${item.code}`;
  linkCopied.value = false;
  showLinkModal.value = true;
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(linkToShow.value);
    linkCopied.value = true;
    setTimeout(() => (linkCopied.value = false), 2000);
  } catch {
    const input = document.createElement("input");
    input.value = linkToShow.value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    linkCopied.value = true;
  }
}

function openInNewTab() {
  window.open(linkToShow.value, "_blank");
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1
          class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"
        >
          <ClipboardList class="h-6 w-6" /> Encuestas
        </h1>
        <v-btn v-if="can('survey:create')" color="primary" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="surveysService.list"
        search-placeholder="Buscar por título..."
      >
        <template #[`item.isActive`]="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="print(item)"
            >
              <Printer class="h-4 w-4" />
            </v-btn>
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="primary"
              @click="openLinkModal(item)"
              ><Clipboard class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('survey:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
              ><Pencil class="h-4 w-4"
            /></v-btn>
            <v-btn
              v-if="can('survey:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              ><Power class="h-4 w-4"
            /></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          {{ mode === "edit" ? "Editar" : "Crear" }} Encuesta
        </h1>
        <v-btn variant="text" icon @click="closeList"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>

      <CreateView
        :key="selected?.id || 'create'"
        :item="selected"
        :mode="mode"
        @close="closeList"
        @created="closeList"
      />
    </div>

    <Teleport to="body">
      <v-dialog v-model="showLinkModal" max-width="520" persistent>
        <v-card class="rounded-xl">
          <v-card-title class="flex items-center gap-2">
            <Link2 class="h-5 w-5 text-primary" /> Enlace de la encuesta
            <v-spacer />
            <v-btn
              icon
              size="x-small"
              variant="text"
              @click="showLinkModal = false"
              ><X class="h-4 w-4"
            /></v-btn>
          </v-card-title>
          <v-card-text class="pt-2">
            <p class="text-sm text-gray-500 mb-3">
              Comparte este enlace para que puedan responder la encuesta
              <span
                v-if="surveySelectedForLink"
                class="font-medium text-gray-800 dark:text-white"
                >"{{ surveySelectedForLink.title }}"</span
              >
            </p>
            <div
              class="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            >
              <span class="text-sm truncate flex-1 select-all">{{
                linkToShow
              }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              Código: {{ surveySelectedForLink?.code }}
            </div>
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" @click="showLinkModal = false">Cerrar</v-btn>
            <v-btn variant="tonal" color="primary" @click="copyLink">
              <Check v-if="linkCopied" class="h-4 w-4 mr-1" /><Copy
                v-else
                class="h-4 w-4 mr-1"
              />{{ linkCopied ? "Copiado!" : "Copiar" }}
            </v-btn>
            <v-btn color="primary" variant="flat" @click="openInNewTab"
              ><ExternalLink class="h-4 w-4 mr-1" /> Abrir</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Teleport>
  </AdminLayout>
</template>

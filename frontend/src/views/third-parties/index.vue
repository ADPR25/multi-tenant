<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { thirdPartiesService } from "@/services/logic/third-parties/third-parties.service";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, Pencil, Power, UsersRound, X, Building2 } from "lucide-vue-next";
import { ref, computed } from "vue";

defineOptions({ name: "ThirdPartiesIndexPage" });

interface Item {
  id: string;
  nit: string;
  razonSocial: string;
  nombreComercial?: string;
  tipo: string;
  email?: string;
  telefono?: string;
  isActive?: boolean;
  [k:string]: unknown;
}

const { can } = usePermissions();
const mode = ref<"list"|"create"|"edit">("list");
const selected = ref<Item|null>(null);
const tableRef = ref<InstanceType<typeof AppDataTable>>();
const dialogActive = ref(false);
const toggling = ref(false);
const itemToToggle = ref<Item|null>(null);
const isSelectedActive = computed(()=> !!itemToToggle.value?.isActive);

const headers = [
  { title: "NIT", key: "nit" },
  { title: "Razón Social", key: "razonSocial" },
  { title: "Tipo", key: "tipo" },
  { title: "Email", key: "email" },
  { title: "Teléfono", key: "telefono" },
  { title: "Activo", key: "isActive", align: "center" as const },
  { title: "Opciones", key: "actions", align: "end" as const, sortable: false },
];

function openCreate(){ selected.value=null; mode.value="create"; }
function openEdit(item: Item){ selected.value=item; mode.value="edit"; }
function closeList(){ mode.value="list"; selected.value=null; tableRef.value?.reload(); }
function confirmToggle(item: Item){ itemToToggle.value=item; dialogActive.value=true; }
async function toggle(){
  if(!itemToToggle.value) return;
  toggling.value=true;
  try{ await thirdPartiesService.toggleActive(itemToToggle.value.id); dialogActive.value=false; itemToToggle.value=null; tableRef.value?.reload(); }
  catch(e: unknown){ alert(e instanceof Error? e.message: "Error"); }
  finally{ toggling.value=false; }
}
</script>
<template>
  <AdminLayout>
    <div v-if="mode==='list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"><UsersRound class="h-6 w-6"/> Terceros</h1>
        <v-btn v-if="can('third-parties:create')" color="primary" @click="openCreate"><Plus class="h-4 w-4 mr-2"/> Crear</v-btn>
      </div>
      <AppDataTable ref="tableRef" :headers="headers" :fetch-fn="thirdPartiesService.list" search-placeholder="Buscar NIT o razón social...">
        <template #[`item.tipo`]="{ item }"><v-chip size="small" variant="tonal">{{ item.tipo }}</v-chip></template>
        <template #[`item.isActive`]="{ item }"><v-chip :color="item.isActive?'success':'error'" size="small" variant="tonal">{{ item.isActive? 'Activo':'Inactivo' }}</v-chip></template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn v-if="can('third-parties:update')" icon size="x-small" variant="text" color="warning" @click="openEdit(item)"><Pencil class="h-4 w-4"/></v-btn>
            <v-btn v-if="can('third-parties:state')" icon size="x-small" variant="text" :color="item.isActive?'success':'error'" @click="confirmToggle(item)"><Power class="h-4 w-4"/></v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ mode==='edit'?'Editar':'Crear' }} Tercero</h1>
        <v-btn variant="text" icon @click="closeList"><X class="h-5 w-5"/></v-btn>
      </div>
      <CreateView :item="selected || undefined" @close="closeList" @created="closeList"/>
    </div>

    <v-dialog v-model="dialogActive" max-width="420">
      <v-card>
        <v-card-title class="flex items-center gap-2"><Building2 class="h-5 w-5"/> Cambiar estado</v-card-title>
        <v-card-text>¿Deseas {{ isSelectedActive? 'desactivar':'activar' }} este tercero?</v-card-text>
        <v-card-actions><v-spacer/>
          <v-btn variant="text" @click="dialogActive=false">Cancelar</v-btn>
          <v-btn color="primary" :loading="toggling" @click="toggle">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>
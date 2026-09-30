<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateView from './create/index.vue'
import { documentsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Power, Files, X } from 'lucide-vue-next'
const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const mode = ref<'list'|'create'|'edit'>('list')
const selected = ref<any>(null)
const headers = [
  {title:'Título',key:'title'},
  {title:'Carpeta',key:'folder'},
  {title:'Categoría',key:'category'},
  {title:'Tipo',key:'type'},
  {title:'Activo',key:'isActive'},
  {title:'Expira',key:'expiresAt'},
  {title:'Opciones',key:'actions',align:'end',sortable:false},
]
async function traer(){
  loading.value=true
  try{
    const res:any = await documentsService.list({limit:50})
    items.value = res.data || res || []
  } finally{ loading.value=false }
}
function openCreate(){ selected.value=null; mode.value='create' }
function openEdit(item:any){ selected.value=item; mode.value='edit' }
function closeList(){ mode.value='list'; traer() }
async function toggle(item:any){ await documentsService.toggleActive(item.id); traer() }
onMounted(traer)
</script>
<template>
  <AdminLayout>
    <div v-if="mode==='list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2"><Files class="h-6 w-6"/> Documentos</h1>
        <v-btn v-if="can('documents:docs:create')" color="primary" @click="openCreate"><Plus class="h-4 w-4 mr-2"/> Crear</v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" class="bg-transparent">
          <template #item.folder="{item}">{{ item.folder?.name || '-' }}</template>
          <template #item.category="{item}">{{ item.category?.name || '-' }}</template>
          <template #item.type="{item}">{{ item.type?.name || '-' }}</template>
          <template #item.isActive="{item}"><v-chip :color="item.isActive?'success':'error'" size="small">{{ item.isActive?'Activo':'Inactivo' }}</v-chip></template>
          <template #item.expiresAt="{item}">{{ item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : '-' }}</template>
          <template #item.actions="{item}">
            <div class="flex justify-end gap-1">
              <v-btn v-if="can('documents:docs:update')" icon size="x-small" variant="text" color="warning" @click="openEdit(item)"><Pencil class="h-4 w-4"/></v-btn>
              <v-btn v-if="can('documents:docs:state')" icon size="x-small" variant="text" @click="toggle(item)"><Power class="h-4 w-4"/></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6"><h1 class="text-2xl font-bold">{{ mode==='edit'?'Editar':'Crear' }} Documento</h1><v-btn variant="text" icon @click="closeList"><X class="h-5 w-5"/></v-btn></div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>
<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import CreateView from './create/index.vue'
import { documentCategoriesService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Power, LayoutGrid, X } from 'lucide-vue-next'
const { can } = usePermissions()
const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const mode = ref<'list'|'create'|'edit'>('list')
const selected = ref<any>(null)
const headers = [
  {title:'Nombre',key:'name'},
  {title:'Descripción',key:'description'},
  {title:'Activo',key:'isActive'},
  {title:'Fecha',key:'createdAt'},
  {title:'Opciones',key:'actions',align:'end',sortable:false},
]
async function traer(){
  loading.value=true
  try{
    const res:any = await documentCategoriesService.list({search:search.value||undefined, limit:50})
    items.value = res.data || res || []
  } finally{ loading.value=false }
}
function openCreate(){ selected.value=null; mode.value='create' }
function openEdit(item:any){ selected.value=item; mode.value='edit' }
function closeList(){ mode.value='list'; selected.value=null; traer() }
async function toggle(item:any){ try{ await documentCategoriesService.toggleActive(item.id); traer() } catch(e:any){ alert(e.message) } }
onMounted(traer)
</script>
<template>
  <AdminLayout>
    <div v-if="mode==='list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2"><LayoutGrid class="h-6 w-6"/> Categorías Documentales</h1>
        <v-btn v-if="can('documents:categories:create')" color="primary" @click="openCreate"><Plus class="h-4 w-4 mr-2"/> Crear</v-btn>
      </div>
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex gap-3 mb-6">
          <v-text-field v-model="search" placeholder="Buscar..." variant="outlined" density="compact" hide-details class="sm:max-w-sm" @keyup.enter="traer"/>
          <v-btn variant="tonal" @click="traer">Buscar</v-btn>
        </div>
        <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" class="bg-transparent">
          <template #item.isActive="{'{item}'}"><v-chip :color="item.isActive?'success':'error'" size="small">{'{'} item.isActive?'Activo':'Inactivo' {'}'}</v-chip></template>
          <template #item.createdAt="{'{item}'}">{'{'} new Date(item.createdAt).toLocaleDateString() {'}'}</template>
          <template #item.actions="{'{item}'}">
            <div class="flex justify-end gap-1">
              <v-btn v-if="can('documents:categories:update')" icon size="x-small" variant="text" color="warning" @click="openEdit(item)"><Pencil class="h-4 w-4"/></v-btn>
              <v-btn v-if="can('documents:categories:state')" icon size="x-small" variant="text" @click="toggle(item)"><Power class="h-4 w-4"/></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>
    <div v-else>
      <div class="flex items-center justify-between mb-6"><h1 class="text-2xl font-bold">{'{'} mode==='edit'?'Editar':'Crear' {'}'} Categorías Documentales</h1><v-btn variant="text" icon @click="closeList"><X class="h-5 w-5"/></v-btn></div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>
  </AdminLayout>
</template>
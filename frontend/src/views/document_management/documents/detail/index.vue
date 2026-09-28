<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { documentLogsService, documentsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { ArrowLeft, Download, Share2, Clock, FileClock, Check, XCircle } from 'lucide-vue-next'

const { can } = usePermissions()
const route = useRoute()
const id = route.params.id as string
const doc = ref<any>(null)
const logs = ref<any[]>([])
const loading = ref(false)
const shareUrl = ref('')
const presignedUrl = ref('')
const showShare = ref(false)
const shareForm = ref({ expiresAt: '' })
const approvalComment = ref('')

async function load() {
  loading.value = true
  try {
    doc.value = await documentsService.getById(id).then((r:any)=> (r as any).data || r)
    const pres = await documentsService.getPresigned(id)
    presignedUrl.value = (pres as any).url || (pres as any).data?.url || ''
    const l = await documentLogsService.byDocument(id)
    logs.value = Array.isArray(l) ? l : (l as any).data || []
  } finally { loading.value = false }
}

async function doShare() {
  const res = await documentsService.share(id, { expiresAt: shareForm.value.expiresAt || undefined })
  shareUrl.value = (res as any).shareUrl || (res as any).data?.shareUrl
  showShare.value = false
  alert('Link: ' + shareUrl.value)
}
async function doApprove() {
  await documentsService.approve(id, approvalComment.value)
  load()
}
async function doReject() {
  if(!approvalComment.value) return alert('Comentario requerido para rechazar')
  await documentsService.reject(id, approvalComment.value)
  load()
}
async function doRequestApproval() {
  await documentsService.requestApproval(id)
  load()
}

onMounted(load)
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <v-btn icon variant="text" to="/documents"><ArrowLeft class="h-5 w-5" /></v-btn>
        Detalle Documento
      </h1>
      <div class="flex gap-2" v-if="doc">
        <v-btn v-if="presignedUrl" color="primary" variant="tonal" :href="presignedUrl" target="_blank"><Download class="h-4 w-4 mr-2" />Descargar</v-btn>
        <v-btn v-if="can('documents:share')" @click="showShare=true"><Share2 class="h-4 w-4 mr-2" />Compartir</v-btn>
        <v-btn v-if="can('documents:update')" @click="doRequestApproval"><Clock class="h-4 w-4 mr-2" />Solicitar Aprobación</v-btn>
        <v-btn v-if="can('documents:approve')" color="success" @click="doApprove"><Check class="h-4 w-4 mr-2" />Aprobar</v-btn>
        <v-btn v-if="can('documents:approve')" color="error" @click="doReject"><XCircle class="h-4 w-4 mr-2" />Rechazar</v-btn>
      </div>
    </div>

    <div v-if="loading" class="p-10 text-center">Cargando...</div>
    <div v-else-if="doc" class="grid grid-cols-12 gap-6">
      <div class="col-span-12 md:col-span-8 rounded-2xl border bg-white p-6">
        <h3 class="font-bold text-lg mb-2">{{ doc.name }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ doc.originalName }} - {{ doc.mimeType }} - {{ doc.size }} bytes - v{{ doc.version }}</p>
        <p class="mb-4">{{ doc.description }}</p>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><b>Carpeta:</b> {{ doc.folder?.name || '-' }}</div>
          <div><b>Categoría:</b> {{ doc.category?.name || '-' }}</div>
          <div><b>Tipo:</b> {{ doc.typeDocument?.name || '-' }}</div>
          <div><b>Estado:</b> {{ doc.status }}</div>
          <div><b>Expiración:</b> {{ doc.expirationDate ? new Date(doc.expirationDate).toLocaleString() : '-' }}</div>
          <div><b>Tags:</b> {{ (doc.tags||[]).map((t:any)=>t.name).join(', ') }}</div>
        </div>
        <pre class="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto">{{ JSON.stringify(doc.metadata||{}, null, 2) }}</pre>
      </div>
      <div class="col-span-12 md:col-span-4 space-y-4">
        <div class="rounded-2xl border bg-white p-4">
          <h4 class="font-semibold mb-2 flex items-center gap-2"><FileClock class="h-4 w-4" /> Auditoría</h4>
          <div class="space-y-2 max-h-[500px] overflow-auto">
            <div v-for="log in logs" :key="log.id" class="text-xs border-b pb-2">
              <b>{{ log.action }}</b> - {{ log.userEmail || log.userId || 'system' }}<br/>
              {{ new Date(log.createdAt).toLocaleString() }} - {{ log.documentName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="showShare" max-width="400">
      <v-card>
        <v-card-title>Compartir documento</v-card-title>
        <v-card-text>
          <v-text-field v-model="shareForm.expiresAt" type="datetime-local" label="Expira (opcional)" variant="outlined" density="comfortable" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showShare=false">Cancelar</v-btn>
          <v-btn color="primary" @click="doShare">Crear Link</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

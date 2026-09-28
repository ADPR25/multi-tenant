<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { documentLogsService } from '@/services'
import { ScrollText } from 'lucide-vue-next'

const items = ref<any[]>([])
const loading = ref(false)
const filters = ref({ search: '', action: '', documentId: '', userId: '' })

const headers = [
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Acción', key: 'action' },
  { title: 'Documento', key: 'documentName' },
  { title: 'Usuario', key: 'userEmail' },
  { title: 'IP', key: 'ip' },
]

async function traer() {
  loading.value = true
  try {
    const res = await documentLogsService.list(filters.value)
    items.value = Array.isArray(res) ? res : (res as any).data || []
  } finally {
    loading.value = false
  }
}
onMounted(traer)
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <ScrollText class="h-6 w-6" /> Auditoría Documentos
      </h1>
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <div class="grid grid-cols-12 gap-3 mb-4">
        <v-text-field
          v-model="filters.search"
          placeholder="Buscar doc/usuario..."
          variant="outlined"
          density="compact"
          hide-details
          class="col-span-12 md:col-span-4"
          @keyup.enter="traer"
        />
        <v-select
          v-model="filters.action"
          :items="[
            '',
            'CREATED',
            'VIEWED',
            'DOWNLOADED',
            'UPDATED',
            'NEW_VERSION',
            'DELETED',
            'SHARED',
            'MOVED',
          ]"
          label="Acción"
          variant="outlined"
          density="compact"
          hide-details
          class="col-span-6 md:col-span-2"
          @update:modelValue="traer"
        />
        <v-btn color="primary" @click="traer" class="col-span-12 md:col-span-2">Filtrar</v-btn>
      </div>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="20"
        class="bg-transparent"
      >
        <template #item.createdAt="{ item }">{{
          new Date(item.createdAt).toLocaleString()
        }}</template>
        <template #item.action="{ item }"
          ><v-chip size="small" variant="tonal">{{ item.action }}</v-chip></template
        >
      </v-data-table>
    </div>
  </AdminLayout>
</template>

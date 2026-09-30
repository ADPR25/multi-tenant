<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { usersService } from '@/services'
import { Plus, Pencil, X, Power, ShieldCheck } from 'lucide-vue-next'
import CreateComponent from './create/index.vue'
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()

const items = ref([])
const search = ref('')
const loading = ref(false)
const mode = ref('list')
const selectedItem = ref(null)

const traer = async () => {
  loading.value = true
  try {
    const data = await usersService.list()
    items.value = Array.isArray(data) ? data : data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedItem.value = null
  mode.value = 'create'
}
const openEdit = (item) => {
  selectedItem.value = item
  mode.value = 'edit'
}
const close = () => {
  mode.value = 'list'
  selectedItem.value = null
}
const porConfirmar = (val) => val || 'por confirmar'
const onSaved = async () => {
  close()
  await traer()
}

const headers = [
  { title: 'Numero de documento', key: 'document_number', minWidth: '180px' },
  { title: 'Nombre', key: 'fullName', minWidth: '220px' },
  { title: 'Rol', key: 'role.name', minWidth: '180px' },
  { title: 'Estado', key: 'isActive', minWidth: '110px', align: 'center' },
  { title: 'Opciones', key: 'actions', minWidth: '120px', align: 'end', sortable: false },
]

onMounted(() => {
  traer()
})
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <ShieldCheck class="h-6 w-6 text-gray-500" /> Usuarios
        </h1>
        <v-btn v-if="can('iam:users:create')" color="success" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>

      <div class="rounded-2xl border bg-white p-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar..."
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6 w-full sm:max-w-sm"
        />
        <div class="w-full overflow-x-auto rounded-xl border">
          <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            density="comfortable"
            class="bg-transparent"
            item-value="id"
          >
            <template #item.fullName="{ item }">
              {{ item.first_name }} {{ item.last_name }}
            </template>

            <template #item.isActive="{ item }">
              <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal">
                {{ item.isActive ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </template>

            <template #item.document_number="{ item }">
              {{ porConfirmar(item.document_number) }}
            </template>

            <template #item.actions="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  v-if="can('iam:users:update')"
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                >
                  <Pencil class="h-4 w-4" />
                </v-btn>
                <v-btn
                  v-if="can('iam:users:inactive')"
                  icon
                  size="x-small"
                  variant="text"
                  :color="item.isActive ? 'success' : 'error'"
                >
                  <Power class="h-4 w-4" />
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>

    <div v-else-if="mode === 'create' || mode === 'edit'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar usuario' : 'Crear usuario' }}
        </h1>
        <v-btn variant="text" icon @click="close"><X class="h-5 w-5" /></v-btn>
      </div>
      <CreateComponent
        :item="mode === 'edit' ? selectedItem : null"
        :is-edit="mode === 'edit'"
        @close="close"
        @created="onSaved"
        @updated="onSaved"
      />
    </div>
  </AdminLayout>
</template>

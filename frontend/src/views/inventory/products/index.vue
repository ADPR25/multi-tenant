<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import AppDataTable from '@/components/common/AppDataTable.vue'
import CreateView from './create/index.vue'
import { productsService } from '@/services'
import { usePermissions } from '@/composables/usePermissions'
import { Plus, Pencil, Power, Package, X } from 'lucide-vue-next'
import { ref, computed } from 'vue'

defineOptions({
  name: 'ProductsIndexPage',
})

interface ProductBrand {
  name?: string
}

interface ProductCategory {
  name?: string
}

interface ProductUom {
  short_name?: string
  name?: string
}

interface ProductItem {
  id: string
  sku?: string
  name?: string
  brand?: ProductBrand
  category?: ProductCategory
  uom?: ProductUom
  price?: number | string
  isActive?: boolean
  [key: string]: unknown
}

const { can } = usePermissions()
const mode = ref<'list' | 'create' | 'edit'>('list')
const selected = ref<ProductItem | null>(null)
const tableRef = ref<InstanceType<typeof AppDataTable>>()
const dialogActive = ref(false)
const toggling = ref(false)
const itemToToggle = ref<ProductItem | null>(null)

const isSelectedActive = computed(() => !!itemToToggle.value?.isActive)

const headers = [
  { title: 'SKU', key: 'sku' },
  { title: 'Nombre', key: 'name' },
  { title: 'Marca', key: 'brand', sortable: false },
  { title: 'Categoría', key: 'category', sortable: false },
  { title: 'UoM', key: 'uom', sortable: false },
  { title: 'Precio', key: 'price', align: 'end' as const },
  { title: 'Min Stock', key: 'min_stock' },
  { title: 'Activo', key: 'isActive', align: 'center' as const },
  { title: 'Opciones', key: 'actions', align: 'end' as const, sortable: false },
]

function openCreate() {
  selected.value = null
  mode.value = 'create'
}

function openEdit(item: ProductItem) {
  selected.value = item
  mode.value = 'edit'
}

function closeList() {
  mode.value = 'list'
  selected.value = null
  tableRef.value?.reload()
}

function confirmToggle(item: ProductItem) {
  itemToToggle.value = item
  dialogActive.value = true
}

async function toggle() {
  if (!itemToToggle.value) return
  toggling.value = true
  try {
    await productsService.toggleActive(itemToToggle.value.id)
    dialogActive.value = false
    itemToToggle.value = null
    tableRef.value?.reload()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al cambiar estado'
    alert(msg)
  } finally {
    toggling.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Package class="h-6 w-6" /> Productos
        </h1>
        <v-btn v-if="can('inventory:product:create')" color="primary" @click="openCreate">
          <Plus class="h-4 w-4 mr-2" /> Crear
        </v-btn>
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="productsService.list"
        search-placeholder="Buscar SKU o nombre..."
      >
        <template #[`item.brand`]="{ item }">
          {{ item.brand?.name || '-' }}
        </template>
        <template #[`item.category`]="{ item }">
          {{ item.category?.name || '-' }}
        </template>
        <template #[`item.uom`]="{ item }">
          {{ item.uom?.short_name || item.uom?.name || '-' }}
        </template>
        <template #[`item.price`]="{ item }"> ${{ Number(item.price).toFixed(2) }} </template>
        <template #[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.isActive ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="flex justify-end gap-1">
            <v-btn
              v-if="can('inventory:product:update')"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="openEdit(item)"
            >
              <Pencil class="h-4 w-4" />
            </v-btn>
            <v-btn
              v-if="can('inventory:product:state')"
              icon
              size="x-small"
              variant="text"
              :color="item.isActive ? 'success' : 'error'"
              @click="confirmToggle(item)"
            >
              <Power class="h-4 w-4" />
            </v-btn>
          </div>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ mode === 'edit' ? 'Editar' : 'Crear' }} Producto
        </h1>
        <v-btn variant="text" icon @click="closeList">
          <X class="h-5 w-5" />
        </v-btn>
      </div>
      <CreateView :item="selected" @close="closeList" @created="closeList" />
    </div>

    <v-dialog v-model="dialogActive" max-width="450" persistent>
      <v-card class="rounded-2xl">
        <v-card-title class="flex items-center gap-3 pt-6 px-6">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              isSelectedActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
            ]"
          >
            <Power class="h-5 w-5" />
          </div>
          <span class="text-lg font-bold">
            {{ isSelectedActive ? '¿Inactivar producto?' : '¿Activar producto?' }}
          </span>
        </v-card-title>
        <v-card-text class="px-6 pb-2 text-gray-600">
          <p>
            Estás a punto de
            <strong :class="isSelectedActive ? 'text-red-600' : 'text-green-600'">
              {{ isSelectedActive ? 'inactivar' : 'activar' }}
            </strong>
            el producto <strong>{{ itemToToggle?.name }}</strong> ({{ itemToToggle?.sku }}).
          </p>
          <p class="mt-3 text-sm">¿Deseas continuar?</p>
        </v-card-text>
        <v-card-actions class="p-6 pt-4">
          <v-btn variant="text" @click="dialogActive = false" :disabled="toggling">Cancelar</v-btn>
          <v-spacer />
          <v-btn
            :color="isSelectedActive ? 'error' : 'success'"
            variant="flat"
            :loading="toggling"
            @click="toggle"
          >
            {{ isSelectedActive ? 'Sí, inactivar' : 'Sí, activar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

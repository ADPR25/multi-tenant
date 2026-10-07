<script setup lang="ts">
import AdminLayout from "@/components/layout/AdminLayout.vue";
import AppDataTable from "@/components/common/AppDataTable.vue";
import CreateView from "./create/index.vue";
import { stockMovementsService } from "@/services";
import { usePermissions } from "@/composables/usePermissions";
import { Plus, ArrowLeftRight, X, Eye } from "lucide-vue-next";
import { ref } from "vue";

defineOptions({
  name: "StockMovementsIndexPage",
});

interface MovementProduct {
  name?: string;
  sku?: string;
  description?: string;
}

interface MovementWarehouse {
  name?: string;
  code?: string;
}

interface StockMovementItem {
  product?: MovementProduct;
  warehouse?: MovementWarehouse;
  type?: "IN" | "OUT" | (string & {});
  quantity?: number | string;
  createdAt?: string;
  reason?: string;
  previousQuantity?: number | string;
  newQuantity?: number | string;
  referenceId?: string;
  toWarehouseid?: string;
  [key: string]: unknown;
}

const { can } = usePermissions();
const mode = ref<"list" | "create">("list");
const tableRef = ref<InstanceType<typeof AppDataTable>>();

// Modal detalle
const detailOpen = ref(false);
const detailItem = ref<StockMovementItem | null>(null);

function openDetail(item: StockMovementItem) {
  detailItem.value = item;
  detailOpen.value = true;
}

const headers = [
  { title: "Producto", key: "product", sortable: false },
  { title: "Bodega", key: "warehouse", sortable: false },
  { title: "Tipo", key: "type", align: "center" as const, width: "110px" },
  { title: "Cantidad", key: "quantity", align: "end" as const, width: "120px" },
  { title: "Fecha", key: "createdAt", width: "170px" },
  {
    title: "",
    key: "actions",
    align: "end" as const,
    sortable: false,
    width: "60px",
  },
];

function closeList() {
  mode.value = "list";
  tableRef.value?.reload();
}
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list'">
      <div class="flex items-center justify-between mb-6">
        <h1
          class="text-2xl font-bold text-gray-800 dark:text-white/90 flex items-center gap-2"
        >
          <ArrowLeftRight class="h-6 w-6" /> Movimientos de Stock
        </h1>
        <v-btn
          v-if="can('inventory:movements:create')"
          color="primary"
          @click="mode = 'create'"
        >
          <Plus class="h-4 w-4 mr-2" /> Nuevo Movimiento
        </v-btn>
      </div>

      <AppDataTable
        ref="tableRef"
        :headers="headers"
        :fetch-fn="stockMovementsService.list"
        search-placeholder="Buscar producto, bodega..."
      >
        <template #[`item.product`]="{ item }">
          <div class="leading-tight">
            <p class="font-medium text-gray-800 dark:text-white/90">
              {{ item.product?.name || "-" }}
            </p>
            <p class="text-xs text-gray-500">{{ item.product?.sku || "" }}</p>
          </div>
        </template>
        <template #[`item.warehouse`]="{ item }">
          <span class="text-sm">{{ item.warehouse?.name || "-" }}</span>
        </template>
        <template #[`item.type`]="{ item }">
          <v-chip
            size="small"
            :color="
              item.type === 'IN'
                ? 'success'
                : item.type === 'OUT'
                  ? 'error'
                  : 'info'
            "
            variant="tonal"
          >
            {{ item.type }}
          </v-chip>
        </template>
        <template #[`item.quantity`]="{ item }">
          <span class="font-semibold">{{
            Number(item.quantity).toString()
          }}</span>
        </template>
        <template #[`item.createdAt`]="{ item }">
          <span class="text-sm text-gray-500">{{
            new Date(item.createdAt).toLocaleString()
          }}</span>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="primary"
            @click="openDetail(item)"
          >
            <Eye class="h-4 w-4" />
          </v-btn>
        </template>
      </AppDataTable>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          Nuevo Movimiento
        </h1>
        <v-btn variant="text" icon @click="closeList">
          <X class="h-5 w-5" />
        </v-btn>
      </div>
      <CreateView @close="closeList" @created="closeList" />
    </div>

    <v-dialog v-model="detailOpen" max-width="600" scrollable>
      <v-card v-if="detailItem" class="rounded-2xl">
        <v-card-title class="flex items-center justify-between p-6 pb-2">
          <span class="text-lg font-bold flex items-center gap-2">
            <ArrowLeftRight class="h-5 w-5" /> Detalle del Movimiento
          </span>
          <v-btn variant="text" icon size="small" @click="detailOpen = false">
            <X class="h-4 w-4" />
          </v-btn>
        </v-card-title>
        <v-card-text class="p-6 pt-2">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div
              class="col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.05] border"
            >
              <p class="text-xs text-gray-500 uppercase">Producto</p>
              <p class="font-semibold text-base">
                {{ detailItem.product?.name }}
              </p>
              <p class="text-xs text-gray-500">
                SKU: {{ detailItem.product?.sku }} |
                {{ detailItem.product?.description }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Bodega</p>
              <p class="font-medium">{{ detailItem.warehouse?.name }}</p>
              <p class="text-xs text-gray-500">
                {{ detailItem.warehouse?.code }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Tipo</p>
              <v-chip
                size="small"
                :color="
                  detailItem.type === 'IN'
                    ? 'success'
                    : detailItem.type === 'OUT'
                      ? 'error'
                      : 'info'
                "
                class="mt-1"
                >{{ detailItem.type }}</v-chip
              >
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Cantidad Movida</p>
              <p class="font-bold text-lg">{{ detailItem.quantity }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Razón</p>
              <p class="font-medium">{{ detailItem.reason || "-" }}</p>
            </div>
            <div
              class="col-span-2 grid grid-cols-3 gap-2 p-3 rounded-xl border bg-white dark:bg-transparent"
            >
              <div>
                <p class="text-xs text-gray-500">Anterior</p>
                <p class="font-semibold">{{ detailItem.previousQuantity }}</p>
              </div>
              <div
                class="text-center text-gray-300 flex items-center justify-center"
              >
                →
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Nuevo</p>
                <p class="font-semibold">{{ detailItem.newQuantity }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Fecha</p>
              <p>
                {{
                  detailItem.createdAt
                    ? new Date(detailItem.createdAt).toLocaleString()
                    : "-"
                }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Referencia</p>
              <p>{{ detailItem.referenceId || "-" }}</p>
            </div>
            <div v-if="detailItem.toWarehouseId" class="col-span-2">
              <p class="text-xs text-gray-500 uppercase">
                Bodega Destino (Traslado)
              </p>
              <p>{{ detailItem.toWarehouseId }}</p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="p-4">
          <v-spacer />
          <v-btn variant="tonal" @click="detailOpen = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

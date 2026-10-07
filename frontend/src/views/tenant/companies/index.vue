<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import { get } from "@/store/authstore";
import { companiesService } from "@/services";
import { Plus, Pencil, Eye, X, Power } from "lucide-vue-next";
import CompanyForm from "@/views/tenant/companies/create/index.vue";
import CompanyView from "@/views/tenant/companies/view/index.vue";

defineOptions({
  name: "CompaniesPage",
});

interface Company {
  id: string;
  name: string;
  tax_id?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

interface UserAuth {
  roleCode?: string;
  role?: string;
  company?: Company | string;
  companyId?: string;
  company_id?: string;
}

const user = get.useAuth("user") as unknown as UserAuth;
const companies = ref<Company[]>([]);
const search = ref("");
const loading = ref(false);
const mode = ref<"list" | "create" | "edit" | "view">("list");
const selectedCompany = ref<Company | null>(null);
const dialogActive = ref(false);
const toggling = ref(false);

const isSuperAdmin = computed(() => {
  return user?.roleCode === "SUPER_ADMIN" || user?.role === "SUPER_ADMIN";
});

const isSelectedActive = computed(() => !!selectedCompany.value?.isActive);

const fetchCompanies = async (): Promise<void> => {
  if (!isSuperAdmin.value) return;
  loading.value = true;
  try {
    const data = (await companiesService.list()) as
      Company[] | { data: Company[] };
    companies.value = Array.isArray(data) ? data : data.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchMyCompany = async (): Promise<void> => {
  loading.value = true;
  try {
    if (user?.company && typeof user.company === "object") {
      selectedCompany.value = user.company;
      return;
    }
    const companyId =
      user?.companyId || (user?.company as string) || user?.company_id;
    if (!companyId) return;

    const data = (await companiesService.getById(companyId)) as
      { data: Company } | Company;
    selectedCompany.value =
      (data as { data: Company }).data || (data as Company);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  selectedCompany.value = null;
  mode.value = "create";
};
const openEdit = (c: Company): void => {
  selectedCompany.value = c;
  mode.value = "edit";
};
const openView = (c: Company): void => {
  selectedCompany.value = c;
  mode.value = "view";
};
const openActive = (c: Company): void => {
  selectedCompany.value = c;
  dialogActive.value = true;
};

const toggleActiveStatus = async (): Promise<void> => {
  if (!selectedCompany.value) return;
  toggling.value = true;
  try {
    await companiesService.toggleActive(
      selectedCompany.value.id,
      !selectedCompany.value.isActive,
    );
    dialogActive.value = false;
    await fetchCompanies();
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "No se pudo cambiar el estado";
    alert(msg);
  } finally {
    toggling.value = false;
  }
};

const close = (): void => {
  if (!isSuperAdmin.value) {
    mode.value = "view";
    return;
  }
  mode.value = "list";
  selectedCompany.value = null;
};

const onSaved = async (): Promise<void> => {
  if (isSuperAdmin.value) {
    close();
    await fetchCompanies();
  } else {
    mode.value = "view";
    await fetchMyCompany();
  }
};

const headers = [
  { title: "Nombre", key: "name", minWidth: "160px" },
  { title: "NIT", key: "tax_id", minWidth: "130px" },
  { title: "Teléfono", key: "phone", minWidth: "140px" },
  {
    title: "Estado",
    key: "isActive",
    minWidth: "110px",
    align: "center" as const,
  },
  { title: "Creado", key: "createdAt", minWidth: "130px" },
  {
    title: "Opciones",
    key: "actions",
    minWidth: "120px",
    align: "end" as const,
    sortable: false,
  },
];

const formatDate = (d?: string): string =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

onMounted(async () => {
  if (isSuperAdmin.value) {
    await fetchCompanies();
  } else {
    mode.value = "view";
    await fetchMyCompany();
  }
});
</script>

<template>
  <AdminLayout>
    <div v-if="mode === 'list' && isSuperAdmin">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          Empresas
        </h1>
        <v-btn color="success" @click="openCreate"
          ><Plus class="h-4 w-4 mr-2" /> Crear</v-btn
        >
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5 xl:p-7"
      >
        <v-text-field
          v-model="search"
          placeholder="Buscar por nombre, NIT, email..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-6 w-full sm:max-w-sm"
        />
        <div
          class="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800"
        >
          <v-data-table
            :headers="headers"
            :items="companies"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            :mobile-breakpoint="768"
            density="comfortable"
            class="companies-table bg-transparent"
            item-value="id"
          >
            <template #[`item.name`]="{ item }">
              <span
                class="font-medium whitespace-nowrap"
                :class="{ 'text-gray-400 italic': !item.name }"
                >{{ item.name || "(Sin nombre)" }}</span
              >
            </template>
            <template #[`item.isActive`]="{ item }">
              <v-chip
                :color="item.isActive ? 'success' : 'error'"
                size="small"
                variant="tonal"
                >{{ item.isActive ? "Activa" : "Inactiva" }}</v-chip
              >
            </template>
            <template #[`item.createdAt`]="{ item }">
              <span class="text-sm text-gray-500 whitespace-nowrap">{{
                formatDate(item.createdAt)
              }}</span>
            </template>
            <template #[`item.actions`]="{ item }">
              <div class="flex justify-end gap-1">
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="openView(item)"
                  ><Eye class="h-4 w-4"
                /></v-btn>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="warning"
                  @click="openEdit(item)"
                  ><Pencil class="h-4 w-4"
                /></v-btn>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  :color="item.isActive ? 'success' : 'error'"
                  @click="openActive(item)"
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
          {{ mode === "edit" ? "Editar empresa" : "Crear empresa" }}
        </h1>
        <v-btn variant="text" icon @click="close"><X class="h-5 w-5" /></v-btn>
      </div>
      <CompanyForm
        :company="mode === 'edit' ? selectedCompany : null"
        @close="close"
        @created="onSaved"
        @updated="onSaved"
      />
    </div>

    <div v-else-if="mode === 'view'">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ isSuperAdmin ? "Detalle empresa" : "Mi empresa" }}
        </h1>
        <v-btn v-if="isSuperAdmin" variant="text" icon @click="close"
          ><X class="h-5 w-5"
        /></v-btn>
      </div>
      <CompanyView
        v-if="selectedCompany"
        :company="selectedCompany"
        @close="close"
        @edit="openEdit"
      />
    </div>
  </AdminLayout>

  <v-dialog v-model="dialogActive" max-width="450" persistent>
    <v-card class="rounded-2xl">
      <v-card-title class="flex items-center gap-3 pt-6 px-6">
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center',
            isSelectedActive
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600',
          ]"
        >
          <Power class="h-5 w-5" />
        </div>
        <span class="text-lg font-bold">
          {{ isSelectedActive ? "¿Inactivar empresa?" : "¿Activar empresa?" }}
        </span>
      </v-card-title>

      <v-card-text class="px-6 pb-2 text-gray-600">
        <p v-if="isSelectedActive">
          Estás a punto de <strong class="text-red-600">inactivar</strong> la
          empresa <strong>{{ selectedCompany?.name }}</strong
          >. Los usuarios de esta empresa no podrán acceder al sistema.
        </p>
        <p v-else>
          Estás a punto de <strong class="text-green-600">activar</strong> la
          empresa <strong>{{ selectedCompany?.name }}</strong
          >. Los usuarios volverán a tener acceso.
        </p>
        <p class="mt-3 text-sm">¿Deseas continuar?</p>
      </v-card-text>

      <v-card-actions class="p-6 pt-4">
        <v-btn variant="text" @click="dialogActive = false" :disabled="toggling"
          >Cancelar</v-btn
        >
        <v-spacer />
        <v-btn
          :color="isSelectedActive ? 'error' : 'success'"
          variant="flat"
          :loading="toggling"
          @click="toggleActiveStatus"
        >
          {{ isSelectedActive ? "Sí, inactivar" : "Sí, activar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
:deep(.companies-table.v-data-table__tr) {
  border-bottom: 1px solid #e5e7eb !important;
}
:deep(.companies-table.v-data-table__mobile-table-row) {
  border-bottom: 2px solid #e5e7eb !important;
  padding: 12px 0 !important;
}
:deep(.companies-table.v-data-table__mobile-row) {
  border-bottom: 1px dashed #f3f4f6 !important;
  padding: 8px 16px !important;
  min-height: 45px;
}
</style>

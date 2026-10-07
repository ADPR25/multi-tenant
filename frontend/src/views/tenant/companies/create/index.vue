<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { companiesService } from "@/services";

defineOptions({
  name: "CompanyForm",
});

interface Company {
  id: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CompanyFormData {
  name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  address: string;
}

const props = defineProps<{
  company?: Company | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", data: Company): void;
  (e: "updated", data: Company): void;
}>();

const errorMsg = ref<string | null>(null);
const loading = ref(false);
const isEdit = computed(() => !!props.company);

const form = ref<CompanyFormData>({
  name: "",
  legal_name: "",
  tax_id: "",
  email: "",
  phone: "",
  address: "",
});

const loadFormData = (): void => {
  if (props.company) {
    form.value = {
      name: props.company.name || "",
      legal_name: props.company.legal_name || "",
      tax_id: props.company.tax_id || "",
      email: props.company.email || "",
      phone: props.company.phone || "",
      address: props.company.address || "",
    };
  } else {
    form.value = {
      name: "",
      legal_name: "",
      tax_id: "",
      email: "",
      phone: "",
      address: "",
    };
  }
};

watch(() => props.company, loadFormData, { immediate: true });
onMounted(loadFormData);

const submit = async (): Promise<void> => {
  errorMsg.value = null;
  loading.value = true;
  try {
    const data = isEdit.value
      ? await companiesService.update(props.company!.id, form.value)
      : await companiesService.create(form.value);

    type CompanyResponse = { data: Company } | Company;

    const isWrapped = (res: CompanyResponse): res is { data: Company } => {
      return typeof res === "object" && res !== null && "data" in res;
    };

    const companyData = isWrapped(data) ? data.data : (data as Company);

    if (isEdit.value) {
      emit("updated", companyData);
    } else {
      emit("created", companyData);
    }
    emit("close");
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : "Error de conexión";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
  >
    <v-row>
      <v-col cols="12" md="6">
        <v-label>Nombre *</v-label>
        <v-text-field
          v-model="form.name"
          placeholder="Ej: Acme SAS"
          variant="outlined"
          density="comfortable"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>Razón social</v-label>
        <v-text-field
          v-model="form.legal_name"
          placeholder="Ej: Acme S.A.S. BIC"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>NIT</v-label>
        <v-text-field
          v-model="form.tax_id"
          placeholder="900123456-1"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>Correo electrónico</v-label>
        <v-text-field
          v-model="form.email"
          placeholder="contacto@empresa.com"
          type="email"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>Número telefónico</v-label>
        <v-text-field
          v-model="form.phone"
          placeholder="+57 300 123 4567"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>Dirección</v-label>
        <v-text-field
          v-model="form.address"
          placeholder="Cra 10 # 20-30"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col class="flex justify-between">
        <v-btn color="error" @click="emit('close')"> Cancelar </v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="loading" @click="submit">
          {{ isEdit ? "Actualizar" : "Guardar" }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="errorMsg" class="mt-4">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          border="start"
          closable
          @click:close="errorMsg = null"
        >
          <strong>Error:</strong> {{ errorMsg }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

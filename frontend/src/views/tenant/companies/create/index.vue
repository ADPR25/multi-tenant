<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { companiesService } from '@/services'

const props = defineProps({
  company: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'created', 'updated'])

const errorMsg = ref(null)
const loading = ref(false)
const isEdit = computed(() => !!props.company)

const form = ref({
  name: '',
  legalName: '',
  taxId: '',
  email: '',
  phone: '',
  address: '',
})

const loadFormData = () => {
  if (props.company) {
    form.value = {
      name: props.company.name || '',
      legalName: props.company.legalName || '',
      taxId: props.company.taxId || '',
      email: props.company.email || '',
      phone: props.company.phone || '',
      address: props.company.address || '',
    }
  } else {
    form.value = {
      name: '',
      legalName: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
    }
  }
}

watch(() => props.company, loadFormData, { immediate: true })
onMounted(loadFormData)

const submit = async () => {
  errorMsg.value = null
  loading.value = true
  try {
    const data = isEdit.value
      ? await companiesService.update(props.company.id, form.value)
      : await companiesService.create(form.value)

    if (isEdit.value) {
      emit('updated', data)
    } else {
      emit('created', data)
    }
    emit('close')
  } catch (e) {
    errorMsg.value = e.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}
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
          v-model="form.legalName"
          placeholder="Ej: Acme S.A.S. BIC"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-label>NIT</v-label>
        <v-text-field
          v-model="form.taxId"
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
        <v-btn color="primary" @click="submit" :loading="loading">
          {{ isEdit ? 'Actualizar' : 'Guardar' }}
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

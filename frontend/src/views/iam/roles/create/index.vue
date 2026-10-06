<script setup lang="ts">
defineOptions({
  name: 'RolesCreateView',
})

import { ref, watch, computed, onMounted } from 'vue'
import { get } from '@/store/authstore'
import { companiesService, rolesService } from '@/services'
import { ShieldCheck, X, Save, Loader2, Check } from 'lucide-vue-next'

const props = defineProps({
  role: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'created', 'updated'])

const user = get.useAuth('user')
const companies = ref([])

const isSuper = computed(() => user?.roleCode === 'SUPER_ADMIN')

const form = ref({
  name: '',
  description: '',
  isPrincipal: false,
  companyId: '',
})

if (!isSuper.value && user?.companyId) {
  form.value.companyId = user.companyId
}

const loading = ref(false)
const error = ref('')
const errors = ref({})

const isEditMode = computed(() => props.isEdit || !!props.role?.id)

watch(
  () => props.role,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        description: val.description || '',
        isPrincipal: val.isPrincipal ?? false,
        companyId: val.companyId || user?.companyId || '',
      }
    } else {
      form.value = {
        name: '',
        description: '',
        isPrincipal: false,
        companyId: !isSuper.value ? user?.companyId || '' : '',
      }
    }
  },
  { immediate: true },
)

const validate = () => {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (form.value.name.trim().length < 3) {
    errors.value.name = 'Mínimo 3 caracteres'
  }
  if (isSuper.value && !form.value.companyId) {
    errors.value.companyId = 'Debes seleccionar una empresa'
  }
  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  error.value = ''
  if (!validate()) return

  loading.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      isPrincipal: form.value.isPrincipal,
      companyId: form.value.companyId,
    }

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const data = isEditMode.value
      ? await rolesService.update(props.role.id, payload)
      : await rolesService.create(payload)

    if (isEditMode.value) {
      emit('updated', data)
    } else {
      emit('created', data)
    }
  } catch (e) {
    console.error(e)
    error.value = e.message || 'Error al guardar el rol'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isSuper.value) {
    try {
      const data = await companiesService.list()
      companies.value = Array.isArray(data) ? data : data.data || []
    } catch (e) {
      console.error('Error cargando empresas', e)
    }
  }
})
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <ShieldCheck class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white/90">
          {{ isEditMode ? 'Editar rol' : 'Nuevo rol' }}
        </h2>
        <p class="text-sm text-gray-500">Define el nombre y descripción del rol</p>
      </div>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6 rounded-xl"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-row>
      <v-col cols="12" :md="isSuper ? 6 : 12">
        <v-label> Nombre del rol <span class="text-red-500">*</span> </v-label>
        <v-text-field
          v-model="form.name"
          placeholder="Ej: ADMIN, EDITOR, CAJERO"
          variant="outlined"
          density="comfortable"
          hide-details
          :error="!!errors.name"
          class="rounded-xl"
        />
        <p v-if="errors.name" class="text-xs text-red-500 mt-1.5">{{ errors.name }}</p>
        <p class="text-xs text-gray-400 mt-1.5">
          Usa mayúsculas sin espacios si es un código interno
        </p>
      </v-col>
      <v-col v-if="isSuper" cols="12" md="6">
        <v-label> Empresa <span class="text-red-500">*</span> </v-label>
        <v-autocomplete
          v-model="form.companyId"
          variant="outlined"
          density="comfortable"
          :items="companies"
          item-title="name"
          item-value="id"
          placeholder="Selecciona empresa"
          :error="!!errors.companyId"
          hide-details
          class="rounded-xl"
        />
        <p v-if="errors.companyId" class="text-xs text-red-500 mt-1.5">{{ errors.companyId }}</p>
      </v-col>
      <v-col cols="12">
        <v-label>
          Descripción
          <span class="text-gray-400 font-normal">(opcional)</span>
        </v-label>
        <v-textarea
          v-model="form.description"
          placeholder="¿Qué puede hacer este rol?"
          variant="outlined"
          density="comfortable"
          rows="3"
          auto-grow
          hide-details
          class="rounded-xl"
        />
      </v-col>
      <v-col v-if="isSuper" cols="12">
        <div
          class="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"
              >
                <ShieldCheck class="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">
                    ¿Es rol administrador principal?
                  </p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Al activarlo, este rol será el
                  <span class="font-semibold text-gray-700 dark:text-gray-300"
                    >administrador principal de la empresa</span
                  >
                  donde se creó. Tendrá control total y podrá gestionar usuarios, roles y
                  configuración de esa empresa.
                </p>
              </div>
            </div>
            <v-switch
              v-model="form.isPrincipal"
              color="warning"
              hide-details
              :true-icon="Check"
              :false-icon="X"
              class="shrink-0"
            />
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="flex">
        <v-btn color="warning" :disabled="loading" @click="emit('close')">
          <X class="h-4 w-4 mr-2" /> Cancelar
        </v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="submit">
          <Loader2 v-if="loading" class="h-4 w-4 mr-2 animate-spin" />
          <Save v-else class="h-4 w-4 mr-2" />
          {{ isEditMode ? 'Actualizar' : 'Crear rol' }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

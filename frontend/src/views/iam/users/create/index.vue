<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { get } from '@/store/authstore'
import { usersService, companiesService, rolesService } from '@/services'
import { Save, X } from 'lucide-vue-next'

const props = defineProps({
  item: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'created', 'updated'])

const user = get.useAuth('user')
const roles = ref([])
const empresas = ref([])

const form = ref({
  first_name: '',
  last_name: '',
  document_number: '',
  email: '',
  phone: '',
  roleId: null,
  companyId: null,
  password: '',
})

const isEditMode = computed(() => props.isEdit || !!props.item?.id)
const loading = ref(false)
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value = {
        first_name: val.first_name || '',
        last_name: val.last_name || '',
        document_number: val.document_number || '',
        email: val.email || '',
        phone: val.phone || '',
        roleId: val.roleId || val.role?.id || null,
        companyId: val.companyId || val.company?.id || null,
        password: '',
      }
    } else {
      form.value = {
        first_name: '',
        last_name: '',
        document_number: '',
        email: '',
        phone: '',
        roleId: null,
        companyId: null,
        password: '',
      }
    }
  },
  { immediate: true },
)

const submit = async () => {
  loading.value = true
  try {
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      document_number: form.value.document_number,
      email: form.value.email,
      phone: form.value.phone,
      roleId: form.value.roleId,
      companyId: user.roleCode === 'SUPER_ADMIN' ? form.value.companyId : user.companyId,
    }

    if (!isEditMode.value || form.value.password) {
      payload.password = form.value.password
    }

    const data = isEditMode.value
      ? await usersService.update(props.item.id, payload)
      : await usersService.create(payload)

    if (isEditMode.value) emit('updated', data)
    else emit('created', data)
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

const traerRoles = async () => {
  try {
    const data = await rolesService.list(true)
    roles.value = Array.isArray(data) ? data : data.data || []
  } catch (e) {
    console.error(e)
  }
}

const traerEmpresas = async () => {
  try {
    const data = await companiesService.list()
    empresas.value = Array.isArray(data) ? data : data.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  traerRoles()
  if (user.roleCode === 'SUPER_ADMIN') traerEmpresas()
})
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-7"
  >
    <v-row>
      <v-col cols="12" sm="6" md="6">
        <v-label>Nombres</v-label>
        <v-text-field v-model="form.first_name" density="comfortable" variant="outlined" />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-label>Apellidos</v-label>
        <v-text-field v-model="form.last_name" density="comfortable" variant="outlined" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-label>Numero de documento</v-label>
        <v-text-field v-model="form.document_number" density="comfortable" variant="outlined" />
      </v-col>
      <v-col cols="12" sm="6" md="8">
        <v-label>Correo electronico</v-label>
        <v-text-field v-model="form.email" density="comfortable" variant="outlined" />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-label>Numero de telefono</v-label>
        <v-text-field v-model="form.phone" density="comfortable" variant="outlined" />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-label>Rol</v-label>
        <v-autocomplete
          v-model="form.roleId"
          :items="roles"
          item-title="name"
          item-value="id"
          density="comfortable"
          variant="outlined"
        />
      </v-col>

      <v-col v-if="!isEditMode" cols="12" :md="user.roleCode === 'SUPER_ADMIN' ? 6 : 12" sm="12">
        <v-label>Contraseña</v-label>
        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          :prepend-inner-icon="Lock"
          :append-inner-icon="showPassword ? EyeOff : Eye"
          @click:append-inner="togglePasswordVisibility"
        />
      </v-col>

      <v-col v-if="user.roleCode === 'SUPER_ADMIN'" cols="12" :md="!isEditMode ? 6 : 12">
        <v-label>Empresa</v-label>
        <v-autocomplete
          v-model="form.companyId"
          :items="empresas"
          item-title="name"
          item-value="id"
          density="comfortable"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <div class="flex mt-6">
      <v-btn color="warning" @click="emit('close')"
        ><v-icon :icon="X" class="h-4 w-4 mr-2" />Cancelar</v-btn
      >
      <v-spacer />
      <v-btn color="primary" :loading="loading" @click="submit">
        <v-icon class="h-4 w-4 mr-2" :icon="Save" />{{ isEditMode ? 'Actualizar' : 'Crear' }}
      </v-btn>
    </div>
  </div>
</template>

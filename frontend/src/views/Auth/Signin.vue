<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div
        class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900"
      >
        <div class="flex flex-col flex-1 w-full lg:w-1/2">
          <div class="w-full max-w-md pt-10 mx-auto">
            <router-link
              to="/dashboard"
              class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Back to dashboard
            </router-link>
          </div>
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div class="mb-5">
              <h1 class="mb-2 font-semibold text-gray-800 dark:text-white/90">Sign In</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Inicia sesión de manera segura en el portal de administración empresarial
              </p>
            </div>

            <div class="space-y-5">
              <div>
                <v-label>Numero de documento *</v-label>
                <v-text-field
                  v-model="document_number"
                  type="text"
                  placeholder="1001234567"
                  variant="outlined"
                  density="comfortable"
                  required
                  hide-details="auto"
                />
              </div>

              <div>
                <v-label>Password *</v-label>
                <v-text-field
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  variant="outlined"
                  density="comfortable"
                  :prepend-inner-icon="Lock"
                  :append-inner-icon="showPassword ? EyeOff : Eye"
                  @click:append-inner="togglePasswordVisibility"
                  required
                  hide-details="auto"
                />
              </div>

              <div>
                <v-btn color="primary" block size="large" :loading="loading" @click="handleSubmit">
                  Sign In
                </v-btn>
              </div>
            </div>

            <div class="mt-5" v-if="error.message">
              <Alert
                variant="warning"
                title="Error al iniciar sesion"
                :message="error.message"
                :showLink="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { set } from '@/store/authstore'
import { authService } from '@/services'
import Alert from '@/components/Alert.vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { Eye, EyeOff, Lock } from 'lucide-vue-next'
import { useMenuStore } from '@/store/menu.store'
import { usePermissions } from '@/composables/usePermissions'

const document_number = ref('')
const password = ref('')
const router = useRouter()
const showPassword = ref(false)
const loading = ref(false)
const error = ref<any>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  loading.value = true
  error.value = {}
  try {
    const data = await authService.login({
      document_number: document_number.value,
      password: password.value,
    })

    set.useAuth('token', data.access_token)
    set.useAuth('user', data.user)
    set.useAuth('company', data.user.company || null)
    set.useAuth('IsSuperAdmin', data.user.roleCode === 'SUPER_ADMIN')
    set.useAuth('my_permissions', null)

    const menuStore = useMenuStore()
    const { load } = usePermissions()
    await Promise.all([menuStore.fetchAll().catch(() => {}), load(true).catch(() => {})])

    router.push('/dashboard')
  } catch (e: any) {
    error.value = { message: e.message || 'Error de conexion' }
  } finally {
    loading.value = false
  }
}
</script>

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
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                class="stroke-current mr-2"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Back to dashboard
            </router-link>
          </div>
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div class="mb-5 sm:mb-8">
                <h1
                  class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"
                >
                  Sign In
                </h1>
              </div>
              <div>
                <div class="grid grid-cols-1 sm:gap-5">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Inicia sesión de manera segura en el portal de administración empresarial
                  </p>
                </div>
                <div class="relative py-3 sm:py-5">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                </div>

                <form @submit.prevent="handleSubmit">
                  <div class="space-y-5">
                    <div>
                      <v-label class="mb-1.5">Email<span class="text-error-500">*</span></v-label>
                      <v-text-field
                        v-model="email"
                        type="email"
                        placeholder="info@gmail.com"
                        variant="outlined"
                        density="comfortable"
                        :prepend-inner-icon="Mail"
                        required
                        hide-details="auto"
                      />
                    </div>

                    <div>
                      <v-label class="mb-1.5"
                        >Password<span class="text-error-500">*</span></v-label
                      >
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

                    <div class="flex justify-end">
                      <router-link
                        to="/dashboard"
                        class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >Forgot password?</router-link
                      >
                    </div>

                    <div>
                      <v-btn type="submit" color="primary" block size="large" :loading="loading">
                        Sign In
                      </v-btn>
                    </div>
                  </div>
                </form>

                <div class="mt-5" v-if="error.message">
                  <Alert
                    variant="warning"
                    title="Error al iniciar sesión"
                    :message="error.message"
                    :showLink="false"
                  />
                </div>
              </div>
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
import { set, get } from '@/store/authstore'
import { authService } from '@/services'
import Alert from '@/components/Alert.vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { Eye, EyeOff, Mail, Lock } from 'lucide-vue-next'
import { useMenuStore } from '@/store/menu.store'
import { usePermissions } from '@/composables/usePermissions'

const email = ref('')
const password = ref('')
const router = useRouter()
const showPassword = ref(false)
const loading = ref(false)
const error = ref<any>({})

const togglePasswordVisibility = () => {
  showPassword.value =!showPassword.value
}

const handleSubmit = async () => {
  loading.value = true
  error.value = {}
  try {
    sessionStorage.clear()

    const data = await authService.login({
      email: email.value,
      password: password.value,
    })

    set.useAuth('token', data.access_token)
    set.useAuth('user', data.user)
    set.useAuth('company', data.user.company || null)
    set.useAuth('IsSuperAdmin', data.user.roleName === 'SUPER_ADMIN')
    set.useAuth('my_permissions', null)

    const menuStore = useMenuStore()
    const { load } = usePermissions()
    await Promise.all([
      menuStore.fetchAll().catch(() => {}),
      load(true).catch(() => {})
    ])

    router.push('/dashboard')
  } catch (e: any) {
    error.value = { message: e.message || 'Error de conexión' }
  } finally {
    loading.value = false
  }
}
</script>
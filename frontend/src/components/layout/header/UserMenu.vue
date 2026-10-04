<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span
        class="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white font-bold text-sm uppercase"
      >
        {{ initials }}
      </span>

      <span class="block mr-1 font-medium text-theme-sm"> {{ user.firstName }} </span>

      <ChevronDown
        :class="['w-5 h-5 transition-transform duration-200', { 'rotate-180': dropdownOpen }]"
      />
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ user.firstName }} {{ user.lastName }}
        </span>

        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ user.roleCode }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />

            {{ item.text }}
          </router-link>
        </li>
      </ul>

      <router-link
        to="/"
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      >
        <LogOut
          class="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        />

        Sign out
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/store/authstore'
import { UserCircle, ChevronDown, LogOut, Settings, CircleHelp } from 'lucide-vue-next'
import { useMenuStore } from '@/store/menu.store'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const user = get.useAuth('user')

const initials = computed(() => {
  const first = user?.firstName?.[0] || user?.email?.[0] || 'U'
  const last = user?.lastName?.[0] || ''
  return (first + last).toUpperCase()
})

const menuItems = [
  { href: '/profile', icon: UserCircle, text: 'Edit profile' },
  { href: '/chat', icon: Settings, text: 'Account settings' },
  { href: '/profile', icon: CircleHelp, text: 'Support' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}
const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = () => {
  try {
    const menuStore = useMenuStore()
    const { clear } = usePermissions()
    clear()
    menuStore.reset()
  } catch {}
  sessionStorage.clear()
  router.push('/')
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

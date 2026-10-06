<template>
  <aside
    :class="[
      'fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div :class="['py-8 flex', !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start']">
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          src="/images/logo/logo.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          src="/images/logo/logo-dark.svg"
          alt="Logo"
          width="150"
          height="40"
        />
        <img v-else src="/images/logo/logo-icon.svg" alt="Logo" width="32" height="32" />
      </router-link>
    </div>

    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <div v-if="loading" class="px-2 py-10 flex justify-center">
        <span class="text-xs text-gray-400 animate-pulse">Cargando menú...</span>
      </div>

      <nav v-else class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading- text-gray-400',
                !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">{{
                menuGroup.title
              }}</template>
              <Ellipsis v-else class="h-5 w-5" />
            </h2>

            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                  <ChevronDown
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      { 'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index) },
                    ]"
                  />
                </button>

                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">{{
                    item.name
                  }}</span>
                </router-link>

                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item flex items-center gap-2.5',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path),
                              'menu-dropdown-item-inactive': !isActive(subItem.path),
                            },
                          ]"
                        >
                          <component :is="subItem.icon" class="h-4 w-4 shrink-0 opacity-80" />
                          {{ subItem.name }}
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'
import { useMenuStore } from '@/store/menu.store'
import * as LucideIcons from 'lucide-vue-next'
import { ChevronDown, Ellipsis } from 'lucide-vue-next'

const route = useRoute()
const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar()
const menuStore = useMenuStore()

const loading = computed(() => menuStore.loading && !menuStore.sidebar.length)
const rawSidebar = computed(() => menuStore.sidebar)

const FALLBACK_ICON = LucideIcons.LayoutDashboard

const getIcon = (name?: string) => {
  if (!name) return FALLBACK_ICON
  const aliases: Record<string, string> = {
    Confi: 'Settings2',
    Config: 'Settings2',
    IAM: 'ShieldCheck',
    Contratacion: 'Users',
    Documentos: 'FileText',
    Inventario: 'Package',
    Terceros: 'Users',
  }
  const cleanName = aliases[name] || name
  return (LucideIcons as Record<string, unknown>)[cleanName] || FALLBACK_ICON
}

const menuGroups = computed(() => {
  const items = rawSidebar.value.map(
    (item: {
      name: string
      icon?: string
      path?: string
      children?: { name: string; path: string; icon?: string }[]
    }) => {
      if (item.children) {
        return {
          name: item.name,
          icon: getIcon(item.icon || item.name),
          subItems: item.children.map((child) => ({
            name: child.name,
            path: child.path,
            icon: getIcon(child.icon),
          })),
        }
      } else {
        return {
          name: item.name,
          icon: getIcon(item.icon),
          path: item.path,
        }
      }
    },
  )
  return [{ title: 'Menu', items }]
})

const isActive = (path?: string) => route.path === path

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  openSubmenu.value = openSubmenu.value === key ? null : key
}

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.value.some((group) =>
    group.items.some(
      (item: { subItems?: { path?: string }[] }) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path)),
    ),
  )
})

const isSubmenuOpen = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups.value[groupIndex].items[itemIndex].subItems?.some((subItem: { path?: string }) =>
        isActive(subItem.path),
      ))
  )
}

const startTransition = (el: HTMLElement) => {
  el.style.height = 'auto'
  const height = el.scrollHeight
  el.style.height = '0px'
  void el.offsetHeight
  el.style.height = height + 'px'
}
const endTransition = (el: HTMLElement) => {
  el.style.height = ''
}

onMounted(() => {
  if (!menuStore.loaded) {
    void menuStore.fetchSidebar()
  }
})
</script>

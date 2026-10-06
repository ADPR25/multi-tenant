<script setup lang="ts">
defineOptions({
  name: 'RolePermissionsManager',
})

import { ref, computed, onMounted, watch } from 'vue'
import { menusService } from '@/services'
import {
  KeyRound,
  ShieldCheck,
  Save,
  Loader2,
  Building2,
  User,
  Calendar,
  LayoutDashboard,
  Settings2,
  Check,
  Lock,
  Eye,
  Plus,
  Trash2,
  Pencil,
  Key,
  Power,
} from 'lucide-vue-next'

const props = defineProps({ role: Object })
const emit = defineEmits(['close', 'back', 'saved'])

const loading = ref(false)
const saving = ref(false)
const search = ref('')
const searchPerm = ref('')
const activeTab = ref('modules')

const assignment = ref({
  catalog: [],
  allSidebar: [],
  assignedSidebar: [],
  allRoutes: [],
  assignedRoutes: [],
  allPermissions: [],
  assignedPermissions: [],
})

const ACTION_LABELS = {
  create: { label: 'Crear', icon: Plus },
  read: { label: 'Ver', icon: Eye },
  update: { label: 'Editar', icon: Pencil },
  delete: { label: 'Eliminar', icon: Trash2 },
  'assign-permissions': { label: 'Asignar', icon: Key },
  inactive: { label: 'Activar/Inactivar', icon: Power },
}

const resourceMap = computed(() => {
  const map = {}
  for (const mod of assignment.value.catalog || []) {
    const routes = mod.children || [mod]
    for (const r of routes) {
      if (!r.path) continue
      map[r.path.replace('/', '')] = r.title
      for (const permName of r.permissions || []) {
        const parts = permName.split(':')
        const resource = parts.length === 2 ? parts[0] : parts[1]
        if (resource) map[resource] = r.title
      }
    }
  }
  return map
})

const translatePermission = (permName) => {
  const parts = permName.split(':')
  const actionKey = parts.pop()
  const resourceKey = parts.pop() || parts[0]

  const resourceLabel = resourceMap.value[resourceKey] || resourceKey
  const action = ACTION_LABELS[actionKey] || { label: actionKey, icon: ShieldCheck }
  return {
    ...action,
    resource: resourceLabel,
    full: `${action.label} ${resourceLabel}`.toLowerCase(),
  }
}

const friendlyRoute = (path) => resourceMap.value[path.replace('/', '')] || path

const getPastel = (name) => {
  if (!name) name = 'default'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return {
    border: `hsl(${hue} 65% 82%)`,
    bg: `hsl(${hue} 75% 96%)`,
    solid: `hsl(${hue} 70% 55%)`,
    text: `hsl(${hue} 70% 35%)`,
    light: `hsl(${hue} 80% 98%)`,
  }
}

const iconMap = {
  Building2,
  User,
  ShieldCheck,
  Calendar,
  KeyRound,
  IAM: ShieldCheck,
  Settings2,
  Settings: Settings2,
  Lock,
  Eye,
}
const getIcon = (name) => iconMap[name] || LayoutDashboard

const flatten = (items) => {
  const flat = []
  items.forEach((g) => {
    if (g.children) g.children.forEach((c) => flat.push({ ...c, __parent: g.name }))
    else flat.push({ ...g, __parent: g.name })
  })
  return flat
}
const allLeaf = computed(() => flatten(assignment.value.allSidebar))
const assignedSet = computed(() => new Set(assignment.value.assignedSidebar.map((s) => s.path)))
const isAssigned = (item) => assignedSet.value.has(item.path)
const isGroupAssigned = (g) => (g.children ? g.children.every((c) => isAssigned(c)) : isAssigned(g))
const isGroupPartial = (g) => g.children?.some((c) => isAssigned(c)) && !isGroupAssigned(g)
const toggleItem = (item) => {
  const idx = assignment.value.assignedSidebar.findIndex((s) => s.path === item.path)
  if (idx !== -1) assignment.value.assignedSidebar.splice(idx, 1)
  else assignment.value.assignedSidebar.push(clean(item))
}
const toggleGroup = (g) => {
  if (!g.children) return toggleItem(g)
  if (isGroupAssigned(g)) {
    g.children.forEach((c) => {
      const i = assignment.value.assignedSidebar.findIndex((s) => s.path === c.path)
      if (i !== -1) assignment.value.assignedSidebar.splice(i, 1)
    })
  } else {
    g.children.forEach((c) => {
      if (!isAssigned(c)) assignment.value.assignedSidebar.push(clean(c))
    })
  }
}
const selectAll = () => {
  assignment.value.assignedSidebar = allLeaf.value.map(clean)
}
const clearAll = () => {
  assignment.value.assignedSidebar = []
}
const filteredGroups = computed(() => {
  if (!search.value) return assignment.value.allSidebar
  const q = search.value.toLowerCase()
  return assignment.value.allSidebar
    .map((g) => {
      if (g.children) {
        const ch = g.children.filter(
          (c) => c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q),
        )
        if (ch.length || g.name.toLowerCase().includes(q))
          return { ...g, children: ch.length ? ch : g.children }
        return null
      }
      return g.name.toLowerCase().includes(q) || g.path.toLowerCase().includes(q) ? g : null
    })
    .filter(Boolean)
})

const assignedPermissionsSet = computed(() => new Set(assignment.value.assignedPermissions))
const isPermissionAssigned = (permId) => assignedPermissionsSet.value.has(permId)
const togglePermission = (permId) => {
  const idx = assignment.value.assignedPermissions.indexOf(permId)
  if (idx !== -1) assignment.value.assignedPermissions.splice(idx, 1)
  else assignment.value.assignedPermissions.push(permId)
}
const getPermissionsForRoute = (route) => {
  for (const mod of assignment.value.catalog || []) {
    const routes = mod.children || [mod]
    const found = routes.find((r) => r.path === route.path)
    if (found && found.permissions) {
      return assignment.value.allPermissions.filter((p) => found.permissions.includes(p.name))
    }
  }
  return []
}
const toggleAllPermsForRoute = (route) => {
  const perms = getPermissionsForRoute(route)
  const allIds = perms.map((p) => p.id)
  const allAssigned = allIds.every((id) => isPermissionAssigned(id))
  if (allAssigned) {
    assignment.value.assignedPermissions = assignment.value.assignedPermissions.filter(
      (id) => !allIds.includes(id),
    )
  } else {
    allIds.forEach((id) => {
      if (!isPermissionAssigned(id)) assignment.value.assignedPermissions.push(id)
    })
  }
}
const filteredRoutesForPerms = computed(() => {
  const source = assignment.value.assignedSidebar.length ? assignment.value.assignedSidebar : []
  if (!searchPerm.value) return source
  const q = searchPerm.value.toLowerCase()
  return source.filter((r) => {
    if (friendlyRoute(r.path).toLowerCase().includes(q)) return true
    return getPermissionsForRoute(r).some((p) => translatePermission(p.name).full.includes(q))
  })
})

const fetchAssignment = async () => {
  if (!props.role?.id) return
  loading.value = true
  try {
    const data = await menusService.getAssignment(props.role.id)
    assignment.value = {
      catalog: data.catalog || [],
      allSidebar: data.allSidebar || [],
      assignedSidebar: data.assignedSidebar || [],
      allRoutes: data.allRoutes || [],
      assignedRoutes: data.assignedRoutes || [],
      allPermissions: data.allPermissions || [],
      assignedPermissions: data.assignedPermissions || [],
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const clean = (item) => {
  return {
    name: item.name,
    title: item.title || item.name,
    path: item.path,
    icon: item.icon || 'LayoutDashboard',
    ...(item.children
      ? {
          children: item.children.map((c) => ({
            name: c.name,
            title: c.title || c.name,
            path: c.path,
            icon: c.icon || 'LayoutDashboard',
          })),
        }
      : {}),
  }
}

const save = async () => {
  saving.value = true
  try {
    const sidebarToSave = assignment.value.assignedSidebar.map(clean)

    await menusService.saveAssignment(props.role.id, {
      sidebar: sidebarToSave,
      permissions: assignment.value.assignedPermissions,
    })
    emit('saved')
  } catch (e) {
    console.error(e)
    alert(e.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

watch(() => props.role?.id, fetchAssignment, { immediate: true })
onMounted(fetchAssignment)
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
        <KeyRound class="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <h2 class="text-sm font-bold flex items-center gap-2">
          Asignar acceso
          <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-">{{
            role?.name
          }}</span>
        </h2>
        <p class="text- text-gray-500">Selecciona módulos y qué puede hacer en cada uno.</p>
      </div>
    </div>

    <v-tabs v-model="activeTab" density="compact" color="primary" class="mb-4">
      <v-tab value="modules">Módulos ({{ assignment.assignedSidebar.length }})</v-tab>
      <v-tab value="permissions">Permisos ({{ assignment.assignedPermissions.length }})</v-tab>
    </v-tabs>

    <div v-if="loading" class="py-16 flex justify-center"><Loader2 class="animate-spin" /></div>

    <div v-else-if="activeTab === 'modules'">
      <div class="flex gap-2 mb-4">
        <v-text-field
          v-model="search"
          placeholder="Buscar..."
          variant="outlined"
          density="compact"
          hide-details
          class="max-w-xs"
        />
        <v-spacer />
        <v-btn variant="text" size="x-small" @click="clearAll">Limpiar</v-btn>
        <v-btn variant="tonal" size="x-small" color="primary" @click="selectAll">Todo</v-btn>
      </div>
      <div class="space-y-3">
        <div
          v-for="group in filteredGroups"
          :key="group.name"
          class="rounded-2xl border-2 transition-all cursor-pointer"
          :style="{
            borderColor:
              isGroupAssigned(group) || isGroupPartial(group)
                ? getPastel(group.name).border
                : '#f3f4f6',
            backgroundColor:
              isGroupAssigned(group) || isGroupPartial(group)
                ? getPastel(group.name).bg
                : '#f9fafb80',
          }"
          @click="toggleGroup(group)"
        >
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center border bg-white"
                :style="{
                  backgroundColor: isGroupAssigned(group) ? getPastel(group.name).solid : '#ffffff',
                  color: isGroupAssigned(group) ? '#ffffff' : '#6b7280',
                  borderColor: isGroupAssigned(group) ? getPastel(group.name).solid : '#e5e7eb',
                }"
              >
                <component :is="getIcon(group.icon || group.name)" class="h-4 w-4" />
              </div>
              <span class="text-sm font-bold">{{ group.name }}</span>
            </div>
            <v-checkbox
              :model-value="isGroupAssigned(group)"
              :indeterminate="isGroupPartial(group)"
              hide-details
              density="compact"
              color="primary"
              @click.stop
            />
          </div>
          <div
            v-if="group.children"
            class="mx-3 mb-3 rounded-xl bg-white border border-gray-100 overflow-hidden"
            @click.stop
          >
            <div
              v-for="child in group.children"
              :key="child.path"
              class="flex items-center justify-between px-4 py-2.5 text- hover:bg-gray-50 cursor-pointer border-b last:border-0"
              @click="toggleItem(child)"
            >
              <span>{{ child.name }}</span>
              <Check
                v-if="isAssigned(child)"
                class="w-4 h-4"
                :style="{ color: getPastel(group.name).text }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'permissions'">
      <v-text-field
        v-model="searchPerm"
        placeholder="Filtrar permiso..."
        variant="outlined"
        density="compact"
        hide-details
        class="mb-4 max-w-xs"
      />
      <div
        v-if="!assignment.assignedSidebar.length"
        class="py-10 text-center text-xs text-gray-400"
      >
        Primero elige módulos.
      </div>
      <div v-else class="space-y-6">
        <div v-for="route in filteredRoutesForPerms" :key="route.path">
          <div class="flex items-center justify-between mb-2">
            <span class="text- font-semibold">{{ friendlyRoute(route.name) }}</span>
            <button
              class="text- px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200"
              @click="toggleAllPermsForRoute(route)"
            >
              {{
                getPermissionsForRoute(route).every((p) => isPermissionAssigned(p.id))
                  ? 'Quitar'
                  : 'Todo'
              }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="perm in getPermissionsForRoute(route)"
              :key="perm.id"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text- cursor-pointer transition"
              :class="
                isPermissionAssigned(perm.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              "
            >
              <input
                type="checkbox"
                class="hidden"
                :checked="isPermissionAssigned(perm.id)"
                @change="togglePermission(perm.id)"
              />
              <component :is="translatePermission(perm.name).icon" class="w-3 h-3" />
              {{ translatePermission(perm.name).label }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-between">
      <v-btn variant="text" size="small" @click="emit('back')">Cancelar</v-btn>
      <v-btn color="primary" size="small" :loading="saving" @click="save"
        ><Save class="h-4 w-4 mr-1" />Guardar</v-btn
      >
    </div>
  </div>
</template>

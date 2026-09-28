import { ref, computed } from 'vue'
import { get, set } from '@/store/authstore'
import { rolePermissionService } from '@/services/logic/iam/role-permission.service'

const permissions = ref<string[]>([])
const loaded = ref(false)

export const usePermissions = () => {
  const getUser = () => get.useAuth('user') as any
  const getRoleName = () => {
    const u = getUser()
    return (u?.roleName || '').toUpperCase().replace(/\s/g, '').replace(/-/g, '_')
  }
  const isSuper = computed(() => ['SUPER_ADMIN', 'SUPERADMIN'].includes(getRoleName()))

  const load = async (force = false) => {
    const user = getUser()

    if (!user) {
      console.warn('load() sin user todavía')
      return []
    }

    if (isSuper.value) {
      permissions.value = ['*']
      loaded.value = true
      return permissions.value
    }

    if (!force && loaded.value && permissions.value.length) return permissions.value

    const cached = get.useAuth('my_permissions')
    if (!force && cached?.length) {
      permissions.value = cached
      loaded.value = true
      return permissions.value
    }

    try {
      const data = await rolePermissionService.getByRoleId(user.roleId)
      const list = Array.isArray(data) ? data : data.permissions || []
      permissions.value = list
        .map((p: any) => (typeof p === 'string' ? p : p.permission?.name || p.name))
        .filter(Boolean)
      set.useAuth('my_permissions', permissions.value)
      loaded.value = true
      return permissions.value
    } catch (e) {
      console.error('error cargando permisos', e)
      permissions.value = []
      return []
    }
  }

  const can = (perm: string) => (isSuper.value ? true : permissions.value.includes(perm))
  const canAny = (...perms: string[]) =>
    isSuper.value ? true : perms.some((p) => permissions.value.includes(p))
  const canAll = (...perms: string[]) =>
    isSuper.value ? true : perms.every((p) => permissions.value.includes(p))
  const clear = () => {
    permissions.value = []
    loaded.value = false
    set.useAuth('my_permissions', [])
  }

  return {
    permissions: computed(() => permissions.value),
    isSuper,
    load,
    can,
    canAny,
    canAll,
    loaded: computed(() => loaded.value),
    clear,
  }
}
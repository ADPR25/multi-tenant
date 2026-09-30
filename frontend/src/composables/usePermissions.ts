import { ref, computed } from 'vue'
import { get, set } from '@/store/authstore'
import { rolePermissionService } from '@/services/logic/iam/role-permission.service'

const permissions = ref<string[]>([])
const loaded = ref(false)

export const usePermissions = () => {
  const getUser = () => get.useAuth('user') as any

  const getRoleCode = () => {
    const u = getUser()
    const raw = u?.roleCode || u?.code || u?.roleCode || u?.role?.code || u?.role?.name || ''
    return String(raw).toUpperCase().replace(/\s/g, '_').replace(/-/g, '_')
  }

  const isSuper = computed(() => {
    const flag = get.useAuth('IsSuperAdmin')
    if (flag === true || flag === 'true') return true
    const code = getRoleCode()
    return ['SUPER_ADMIN', 'SUPERADMIN', 'SUPER-ADMIN'].includes(code)
  })

  const load = async (force = false) => {
    const user = getUser()
    if (!user?.roleId) return []

    if (isSuper.value) {
      permissions.value = ['*']
      loaded.value = true
      set.useAuth('my_permissions', ['*'])
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
      const list = Array.isArray(data)? data : data.permissions || data.data || []
      permissions.value = list
       .map((p: any) => (typeof p === 'string'? p : p.permission?.name || p.name))
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

  const can = (perm: string) => {
    if (isSuper.value) return true
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(perm)
  }
  const canAny = (...perms: string[]) => isSuper.value? true : perms.some((p) => permissions.value.includes(p) || permissions.value.includes('*'))
  const canAll = (...perms: string[]) => isSuper.value? true : perms.every((p) => permissions.value.includes(p) || permissions.value.includes('*'))

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
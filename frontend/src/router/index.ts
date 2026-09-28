import { createRouter, createWebHistory } from 'vue-router'
import { get } from '@/store/authstore'
import { usePermissions } from '@/composables/usePermissions'
import { useMenuStore } from '@/store/menu.store'

const staticRoutes = [
  { path: '/dashboard', name: 'Ecommerce', component: () => import('../views/dashboard.vue'), meta: { title: 'Dashboard' } },
  { path: '/profile', name: 'Profile', component: () => import('../views/Others/UserProfile.vue'), meta: { title: 'Profile' } },
  { path: '/error-404', name: '404 Error', component: () => import('../views/Errors/FourZeroFour.vue'), meta: { title: '404 Error' } },
  { path: '/', name: 'Signin', component: () => import('../views/Auth/Signin.vue'), meta: { title: 'Signin', public: true } },
]

const viewModules = import.meta.glob('../views/**/*.vue')

const componentMap: Record<string, any> = {}
for (const [path, loader] of Object.entries(viewModules)) {
  const normalized = path.replace('../', '@/')
  componentMap[normalized] = loader
  componentMap[path] = loader
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: staticRoutes,
})

let isDynamicRouteAdded = false
let routesLoading = false

const getToken = () => get.useAuth('token')

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  const isPublic = to.meta?.public || to.path === '/'
  document.title = `${to.meta.title || 'App'} | TailAdmin`

  const { load, loaded } = usePermissions()
  if (token &&!loaded.value) await load()

  if (!token &&!isPublic) return next('/')
  if (token && to.path === '/') return next('/dashboard')

  if (token &&!isDynamicRouteAdded &&!routesLoading) {
    routesLoading = true
    try {
      const menuStore = useMenuStore()
      const dynamicRoutes = await menuStore.fetchRoutes()

      dynamicRoutes.forEach((route: any) => {
        if (!router.hasRoute(route.name) && componentMap[route.componentPath]) {
          router.addRoute({
            path: route.path,
            name: route.name,
            component: componentMap[route.componentPath],
            meta: { title: route.title || route.name },
          })
        }
      })

      if (!router.hasRoute('NotFound')) {
        router.addRoute({ path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/error-404' })
      }

      isDynamicRouteAdded = true
      routesLoading = false
      return next({...to, replace: true })
    } catch (e) {
      console.error(e)
      routesLoading = false
      return next()
    }
  }

  if (to.matched.length === 0 && isDynamicRouteAdded) return next('/error-404')
  return next()
})

export const resetDynamicRoutes = () => {
  isDynamicRouteAdded = false
  routesLoading = false
  try {
    const menuStore = useMenuStore()
    menuStore.reset()
  } catch {}
  router.getRoutes().forEach((r) => {
    if (r.name &&!staticRoutes.find((s) => s.name === r.name) && r.name!== 'NotFound') {
      router.removeRoute(r.name as string)
    }
  })
}

export default router
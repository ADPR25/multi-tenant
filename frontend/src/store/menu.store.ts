import { defineStore } from 'pinia'
import { menuService } from '@/services/logic/menu/menu.service'

interface MenuItem {
  id?: string
  path?: string
  name?: string
  icon?: string
  children?: MenuItem[]
  [key: string]: unknown
}

interface RouteItem {
  path: string
  name?: string
  component?: string
  meta?: Record<string, unknown>
  [key: string]: unknown
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    sidebar: [] as MenuItem[],
    routes: [] as RouteItem[],
    loaded: false,
    loading: false,
  }),
  actions: {
    async fetchAll() {
      if (this.loaded || this.loading) return
      this.loading = true
      try {
        const [sidebar, routes] = await Promise.all([
          menuService.getSidebar(),
          menuService.getRoutes(),
        ])
        this.sidebar = (sidebar as MenuItem[]) || []
        this.routes = (routes as RouteItem[]) || []
        this.loaded = true
      } catch (e: unknown) {
        console.error('Error fetchAll menu', e)
        this.sidebar = []
        this.routes = []
      } finally {
        this.loading = false
      }
    },
    async fetchSidebar() {
      if (this.sidebar.length) return this.sidebar
      try {
        this.sidebar = (await menuService.getSidebar()) as MenuItem[]
        return this.sidebar
      } catch {
        return [] as MenuItem[]
      }
    },
    async fetchRoutes() {
      if (this.routes.length) return this.routes
      try {
        this.routes = (await menuService.getRoutes()) as RouteItem[]
        return this.routes
      } catch {
        return [] as RouteItem[]
      }
    },
    reset() {
      this.sidebar = []
      this.routes = []
      this.loaded = false
      this.loading = false
    },
  },
})

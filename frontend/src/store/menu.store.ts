import { defineStore } from 'pinia'
import { menuService } from '@/services/logic/menu/menu.service'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    sidebar: [] as any[],
    routes: [] as any[],
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
        this.sidebar = sidebar || []
        this.routes = routes || []
        this.loaded = true
      } catch (e) {
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
        this.sidebar = await menuService.getSidebar()
        return this.sidebar
      } catch {
        return []
      }
    },
    async fetchRoutes() {
      if (this.routes.length) return this.routes
      try {
        this.routes = await menuService.getRoutes()
        return this.routes
      } catch {
        return []
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

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { Layers, Eye, Sparkles, Monitor, Moon, Palette, Minimize2 } from 'lucide-vue-next'

const Opcion1 = defineAsyncComponent(() => import('./opcion1.vue'))
const Opcion2 = defineAsyncComponent(() => import('./opcion2.vue'))
const Opcion3 = defineAsyncComponent(() => import('./opcion3.vue'))

type Version = 1 | 2 | 3 
const activeVersion = ref<Version>(1)

const versions = [
  { id: 1 as Version, name: 'Enterprise Light', desc: 'Claro corporativo', icon: Monitor },
  { id: 2 as Version, name: 'Swiss Minimal', desc: 'Ultra minimal', icon: Minimize2 },
  { id: 3 as Version, name: 'Vibrant Workspace', desc: 'Colorido moderno', icon: Palette },
]

const currentComponent = computed(() => {
  switch (activeVersion.value) {
    case 1: return Opcion1
    case 2: return Opcion2
    case 3: return Opcion3
  }
})
</script>

<template>
  <AdminLayout>
    <div class="sticky top-0 z-30 -mx-6 -mt-6 mb-6 border-b bg-white/90 backdrop-blur-xl">
      <div class="px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center">
            <Layers class="h-4 w-4" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-[13px] font-bold tracking-tight">DRIVE SHOWROOM</p>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold tracking-widest">
                <Sparkles class="h-3 w-3" /> ELIGE DISEÑO
              </span>
            </div>
            <p class="text-[11px] text-zinc-500 hidden sm:block">Previsualiza en vivo. El cliente elige, tú renombras el archivo a index.vue</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 border">
          <button
            v-for="v in versions"
            :key="v.id"
            @click="activeVersion = v.id"
            :class="[
              'h-8 px-3.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all',
              activeVersion === v.id ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-900'
            ]"
          >
            <component :is="v.icon" class="h-3.5 w-3.5" />
            <span class="hidden md:inline">{{ v.name }}</span>
            <span class="md:hidden">{{ v.id }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="w-full">
      <Suspense>
        <template #default>
          <component :is="currentComponent" />
        </template>
        <template #fallback>
          <div class="py-32 flex flex-col items-center gap-3">
            <div class="h-8 w-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            <p class="text-[11px] tracking-widest font-bold text-zinc-400">CARGANDO V{{ activeVersion }}</p>
          </div>
        </template>
      </Suspense>
    </div>

    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2 py-2 rounded-full bg-zinc-900 text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] border border-zinc-800">
      <span class="pl-3 pr-1 text-[10px] font-bold tracking-widest text-zinc-400">VISTA</span>
      <button
        v-for="v in versions"
        :key="'b-'+v.id"
        @click="activeVersion = v.id"
        :class="['h-7 w-7 rounded-full text-[11px] font-bold transition', activeVersion===v.id ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700']"
      >
        {{ v.id }}
      </button>
      <div class="w-px h-4 bg-zinc-700 mx-1" />
      <button @click="activeVersion = (activeVersion % 4 + 1) as Version" class="h-7 px-3 rounded-full bg-white text-zinc-900 text-[11px] font-bold">
        Siguiente →
      </button>
    </div>
  </AdminLayout>
</template>

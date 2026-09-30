<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  headers: any[]
  fetchFn: (params: any) => Promise<any>
  searchPlaceholder?: string
}>()

const items = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await props.fetchFn({
      search: search.value || undefined,
      page: page.value,
      limit: itemsPerPage.value,
    })
    items.value = res.data || []
    totalItems.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  load()
}

function onUpdateOptions({ page: p, itemsPerPage: limit }: any) {
  page.value = p
  itemsPerPage.value = limit
  load()
}

defineExpose({ reload: load, items })

load()
</script>

<template>
  <div class="rounded-2xl border bg-white p-4">
    <div class="flex gap-3 mb-6">
      <v-text-field
        v-model="search"
        :placeholder="searchPlaceholder || 'Buscar...'"
        variant="outlined"
        density="compact"
        hide-details
        class="sm:max-w-sm"
        @keyup.enter="onSearch"
      />
      <v-btn variant="tonal" @click="onSearch">Buscar</v-btn>
      <div class="ml-auto">
        <slot name="actions" />
      </div>
    </div>

    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="[10, 20, 50]"
      @update:options="onUpdateOptions"
      density="comfortable"
      class="bg-transparent"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </v-data-table-server>
  </div>
</template>

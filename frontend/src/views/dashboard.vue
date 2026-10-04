<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { usePermissions } from '@/composables/usePermissions'
import { onMounted } from 'vue'

const { load } = usePermissions()

onMounted(async () => {
  await load()
})
</script>

<template>
  <AdminLayout> </AdminLayout>
</template>

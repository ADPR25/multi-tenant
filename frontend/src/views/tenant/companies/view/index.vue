<script setup lang="ts">
import { computed } from "vue";
import {
  Building2,
  FileText,
  Hash,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldX,
  X,
  Pencil,
  IdCard,
} from "lucide-vue-next";

defineOptions({
  name: "CompanyDetailView",
});

const props = defineProps({
  company: { type: Object, required: true },
});

const emit = defineEmits(["close", "edit"]);

const formatDate = (dateStr: string | number | Date, withTime = false) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

const initial = computed(
  () => props.company?.name?.charAt(0)?.toUpperCase() || "C",
);
</script>

<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden"
  >
    <div
      class="bg-linear-to-r from-indigo-500 to-violet-600 p-6 sm:p-8 text-white"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-4">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-xl font-bold backdrop-blur"
          >
            {{ initial }}
          </div>
          <div>
            <h2 class="text-2xl font-bold">
              {{ company.name || "Sin nombre" }}
            </h2>
            <p class="text-white/80 flex items-center gap-2 mt-1">
              <FileText class="h-4 w-4" />
              {{ company.legal_name || "Sin razón social" }}
            </p>
          </div>
        </div>
        <v-chip
          :color="company.isActive ? 'success' : 'error'"
          variant="flat"
          class="text-white!"
        >
          <ShieldCheck v-if="company.isActive" class="h-4 w-4 mr-1" />
          <ShieldX v-else class="h-4 w-4 mr-1" />
          {{ company.isActive ? "Activa" : "Inactiva" }}
        </v-chip>
      </div>
    </div>

    <div class="p-6 sm:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/2"
        >
          <h3
            class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-white/90"
          >
            <Building2 class="h-5 w-5 text-indigo-500" /> Información General
          </h3>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10"
              >
                <IdCard class="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Nombre</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ company.name || "-" }}
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10"
              >
                <FileText class="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Razón Social</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ company.legal_name || "-" }}
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10"
              >
                <Hash class="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">NIT</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ company.tax_id || "-" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-white/2"
        >
          <h3
            class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-white/90"
          >
            <Phone class="h-5 w-5 text-emerald-500" /> Contacto
          </h3>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10"
              >
                <Mail class="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Email</p>
                <a
                  :href="`mailto:${company.email}`"
                  class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >{{ company.email || "-" }}</a
                >
              </div>
            </div>
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10"
              >
                <Phone class="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Teléfono</p>
                <a
                  :href="`tel:${company.phone}`"
                  class="font-medium text-gray-900 dark:text-white"
                  >{{ company.phone || "-" }}</a
                >
              </div>
            </div>
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10"
              >
                <MapPin class="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p class="text-xs text-gray-500">Dirección</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ company.address || "-" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="md:col-span-2 rounded-xl border border-dashed border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-transparent"
        >
          <div class="flex flex-wrap gap-6">
            <div class="flex items-center gap-2 text-sm">
              <Calendar class="h-4 w-4 text-gray-400" /><span
                class="text-gray-500"
                >Creado:</span
              >
              <span class="font-medium">{{
                formatDate(company.createdAt)
              }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Clock class="h-4 w-4 text-gray-400" /><span class="text-gray-500"
                >Actualizado:</span
              >
              <span class="font-medium">{{
                formatDate(company.updatedAt, true)
              }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Hash class="h-4 w-4 text-gray-400" /><span class="text-gray-500"
                >ID:</span
              >
              <span class="font-mono text-xs">{{ company.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-8 flex justify-between border-t border-gray-100 pt-6 dark:border-gray-800"
      >
        <v-btn color="error" variant="outlined" @click="emit('close')"
          ><X class="h-4 w-4 mr-2" /> Cerrar</v-btn
        >
        <v-btn color="primary" @click="emit('edit', company)"
          ><Pencil class="h-4 w-4 mr-2" /> Editar</v-btn
        >
      </div>
    </div>
  </div>
</template>

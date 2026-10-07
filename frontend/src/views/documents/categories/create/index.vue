<script setup lang="ts">
defineOptions({
  name: "CategoriesCreateView",
});

import { ref } from "vue";
import { documentCategoriesService } from "@/services";
import { Save, X } from "lucide-vue-next";

interface CategoryItem {
  id?: string;
  name: string;
  description?: string | null;
}

const props = defineProps<{ item?: CategoryItem | null }>();
const emit = defineEmits(["close", "created"]);

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);
const form = ref({
  name: props.item?.name || "",
  description: props.item?.description || "",
});

async function submit() {
  const result = await formRef.value?.validate();
  if (!result?.valid) return;
  saving.value = true;
  try {
    if (props.item?.id)
      await documentCategoriesService.update(props.item.id, form.value);
    else await documentCategoriesService.create(form.value);
    emit("created");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al guardar";
    alert(msg);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12">
          <v-label>Descripción</v-label>
          <v-textarea
            v-model="form.description"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <div class="flex mt-6">
        <v-btn color="warning" @click="emit('close')"
          ><X class="h-4 w-4 mr-2" />Cancelar</v-btn
        >
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="submit">
          <Save class="h-4 w-4 mr-2" />{{ props.item ? "Actualizar" : "Crear" }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

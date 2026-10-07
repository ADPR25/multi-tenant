<script setup lang="ts">
defineOptions({
  name: "FoldersCreateView",
});

import { ref, onMounted } from "vue";
import { foldersService } from "@/services";
import { Save, X } from "lucide-vue-next";

interface FolderItem {
  id?: string;
  name: string;
  description?: string;
  parentid?: string | null;
}

interface ParentFolder {
  id: string;
  name: string;
}

const props = defineProps<{ item?: FolderItem | null }>();
const emit = defineEmits(["close", "created"]);

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);
const parents = ref<ParentFolder[]>([]);

const form = ref({
  name: props.item?.name || "",
  description: props.item?.description || "",
  parentId: (props.item?.parentId as string | number | null) || null,
});

async function submit() {
  const result = await formRef.value?.validate();
  if (!result?.valid) return;
  saving.value = true;
  try {
    const payload: Record<string, unknown> = { ...form.value };
    if (!payload.parentId) delete payload.parentId;
    if (props.item?.id) await foldersService.update(props.item.id, payload);
    else await foldersService.create(payload);
    emit("created");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al guardar";
    alert(msg);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const res = (await foldersService
      .list({ limit: "all", find: "list" })
      .catch(() => [])) as { data?: ParentFolder[] } | ParentFolder[];
    if (Array.isArray(res)) {
      parents.value = res;
    } else {
      parents.value = res.data || [];
    }
  } catch {
    parents.value = [];
  }
});
</script>

<template>
  <div class="rounded-2xl border bg-white p-6">
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="6">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Carpeta Padre</v-label>
          <v-autocomplete
            v-model="form.parentId"
            :items="parents"
            item-title="name"
            item-value="id"
            clearable
            variant="outlined"
            density="comfortable"
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

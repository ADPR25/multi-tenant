<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  projectsService,
  type Project,
  type ProjectPayload,
} from "@/services/logic/projects/projects.service";
import {
  thirdPartiesService,
  type ThirdParty,
} from "@/services/logic/third-parties/third-parties.service";
import { usersService } from "@/services";
import { Save, X, CheckCircle2 } from "lucide-vue-next";

defineOptions({
  name: "ProjectCreateForm",
});

interface UserOption {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", project: Project): void;
}>();

const props = defineProps<{
  item?: Project & {
    client?: { id?: string };
    responsible?: { id?: string };
  };
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null,
);
const saving = ref(false);
const showSuccessModal = ref(false);
const lastSaved = ref<Project | null>(null);

const terceros = ref<ThirdParty[]>([]);
const usuarios = ref<UserOption[]>([]);

const isEditing = !!props.item?.id;

const form = ref({
  code: props.item?.code || "",
  name: props.item?.name || "",
  description: (props.item?.description as string) || "",
  status: props.item?.status || "PLANNING",
  startDate: props.item?.startDate
    ? String(props.item.startDate).substring(0, 10)
    : "",
  endDate: props.item?.endDate
    ? String(props.item.endDate).substring(0, 10)
    : "",
  budget: (props.item?.budget as string) || "",
  progress: props.item?.progress ?? 0,
  clientId: (props.item?.clientId as string) || props.item?.client?.id || "",
  responsibleId:
    (props.item?.responsibleId as string) || props.item?.responsible?.id || "",
});

const statusOptions = [
  { title: "En Planeación", value: "PLANNING" },
  { title: "En Ejecución", value: "IN_PROGRESS" },
  { title: "Pausado", value: "PAUSED" },
  { title: "Finalizado", value: "COMPLETED" },
  { title: "Cancelado", value: "CANCELLED" },
];

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload: ProjectPayload = {
      code: form.value.code,
      name: form.value.name,
      description: form.value.description || null,
      status: form.value.status as ProjectPayload["status"],
      startDate: form.value.startDate || null,
      endDate: form.value.endDate || null,
      budget: form.value.budget ? String(form.value.budget) : null,
      progress: Number(form.value.progress),
      clientId: form.value.clientId || null,
      responsibleId: form.value.responsibleId || null,
    };

    let res: Project;
    if (props.item?.id) {
      res = await projectsService.update(props.item.id, payload);
    } else {
      res = await projectsService.create(payload);
    }

    lastSaved.value = res;
    if (isEditing) {
      showSuccessModal.value = true;
    } else {
      emit("created", res);
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al guardar proyecto";
    alert(message);
  } finally {
    saving.value = false;
  }
}

function onSuccessConfirm() {
  showSuccessModal.value = false;
  if (lastSaved.value) emit("created", lastSaved.value);
  emit("close");
}

function getUserLabel(user: UserOption): string {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return fullName || user.email || user.id;
}

function getThirdPartyLabel(tp: ThirdParty): string {
  const record = tp as ThirdParty & {
    razonSocial?: string;
    businessName?: string;
    nit?: string;
  };
  return (
    record.razonSocial ||
    record.businessName ||
    record.name ||
    record.nit ||
    record.id
  );
}

onMounted(async () => {
  try {
    const [tRes, uRes] = await Promise.all([
      thirdPartiesService
        .list({ limit: "all", state: true })
        .catch(() => ({ data: [] as ThirdParty[] })),
      usersService.list().catch(() => ({ data: [] as UserOption[] })),
    ]);

    type ListResponse<T> = { data: T[] } | T[];

    const tList = tRes as ListResponse<ThirdParty>;
    terceros.value = Array.isArray(tList) ? tList : tList.data || [];

    const uList = uRes as ListResponse<UserOption>;
    usuarios.value = Array.isArray(uList) ? uList : uList.data || [];
  } catch (e) {
    console.error(e);
  }
});
</script>

<template>
  <div
    class="rounded-2xl border bg-white p-6 dark:bg-white/5 dark:border-gray-800"
  >
    <v-form ref="formRef" @submit.prevent="submit">
      <v-row>
        <v-col cols="12" md="3">
          <v-label>Código *</v-label>
          <v-text-field
            v-model="form.code"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Nombre *</v-label>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Requerido']"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Estado</v-label>
          <v-select
            v-model="form.status"
            :items="statusOptions"
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
            rows="2"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Fecha Inicio</v-label>
          <v-date-input
            v-model="form.startDate"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Fecha Fin</v-label>
          <v-date-input
            v-model="form.endDate"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Presupuesto</v-label>
          <v-text-field
            v-model="form.budget"
            type="number"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-label>Avance %</v-label>
          <v-text-field
            v-model="form.progress"
            type="number"
            min="0"
            max="100"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Cliente</v-label>
          <v-autocomplete
            v-model="form.clientId"
            :items="terceros"
            :item-title="getThirdPartyLabel"
            item-value="id"
            clearable
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Responsable</v-label>
          <v-autocomplete
            v-model="form.responsibleId"
            :items="usuarios"
            :item-title="getUserLabel"
            item-value="id"
            clearable
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <div class="flex justify-end gap-2 mt-4">
        <v-btn variant="outlined" @click="emit('close')"
          ><X class="h-4 w-4 mr-2" /> Cancelar</v-btn
        >
        <v-btn color="primary" type="submit" :loading="saving"
          ><Save class="h-4 w-4 mr-2" />
          {{ isEditing ? "Actualizar" : "Guardar y Continuar" }}</v-btn
        >
      </div>
    </v-form>

    <v-dialog v-model="showSuccessModal" max-width="420" persistent>
      <v-card class="rounded-2xl">
        <v-card-text class="text-center pt-8 pb-2">
          <div
            class="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4"
          >
            <CheckCircle2 class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold">¡Edición exitosa!</h3>
          <p class="text-gray-500 mt-2 text-sm">
            El proyecto <b>{{ lastSaved?.name || form.name }}</b> se actualizó
            correctamente.
          </p>
        </v-card-text>
        <v-card-actions class="justify-center pb-6 gap-2">
          <v-btn
            color="primary"
            variant="flat"
            class="px-8"
            @click="onSuccessConfirm"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

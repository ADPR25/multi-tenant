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

interface ThirdPartyListResponse {
  data?: ThirdParty[];
}

interface UserListResponse {
  data?: UserOption[];
}

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", project: Project): void;
}>();

const props = defineProps<{
  item?: Partial<Project> & {
    cliente?: { id?: string };
    responsable?: { id?: string };
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
  codigo: props.item?.codigo || "",
  nombre: props.item?.nombre || "",
  descripcion: (props.item?.descripcion as string) || "",
  estado: props.item?.estado || "EN_PLANEACION",
  fechaInicio: props.item?.fechaInicio
    ? String(props.item.fechaInicio).substring(0, 10)
    : "",
  fechaFin: props.item?.fechaFin
    ? String(props.item.fechaFin).substring(0, 10)
    : "",
  presupuesto: (props.item?.presupuesto as string) || "",
  avance: props.item?.avance ?? 0,
  clienteId: (props.item?.clienteId as string) || props.item?.cliente?.id || "",
  responsableId:
    (props.item?.responsableId as string) || props.item?.responsable?.id || "",
});

const estados = [
  "EN_PLANEACION",
  "EN_EJECUCION",
  "PAUSADO",
  "FINALIZADO",
  "CANCELADO",
];

async function submit(): Promise<void> {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload: Partial<ProjectPayload> = {
      codigo: form.value.codigo,
      nombre: form.value.nombre,
      descripcion: form.value.descripcion || null,
      estado: form.value.estado,
      fechaInicio: form.value.fechaInicio || null,
      fechaFin: form.value.fechaFin || null,
      presupuesto: form.value.presupuesto || null,
      avance: Number(form.value.avance),
      clienteId: form.value.clienteId || null,
      responsableId: form.value.responsableId || null,
    };
    let res: Project;
    if (props.item?.id) {
      res = await projectsService.update(props.item.id, payload);
    } else {
      res = await projectsService.create(payload as ProjectPayload);
    }

    lastSaved.value = res;

    if (isEditing) {
      // En edición mostramos modal
      showSuccessModal.value = true;
    } else {
      // En creación seguimos como antes
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
  if (lastSaved.value) {
    emit("created", lastSaved.value);
  }
  emit("close");
}

function getUserLabel(user: UserOption): string {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return fullName || user.email || "";
}

onMounted(async () => {
  try {
    const [tRes, uRes] = await Promise.all([
      thirdPartiesService
        .list({ limit: "all", state: "true" })
        .catch(() => ({ data: [] as ThirdParty[] })),
      usersService
        .list({ limit: "all" })
        .catch(() => ({ data: [] as UserOption[] })),
    ]);
    const tData = tRes as ThirdPartyListResponse | ThirdParty[];
    terceros.value = Array.isArray(tData) ? tData : tData.data || [];
    const uData = uRes as UserListResponse | UserOption[];
    usuarios.value = Array.isArray(uData) ? uData : uData.data || [];
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
        <v-col cols="12" md="3"
          ><v-label>Código *</v-label
          ><v-text-field
            v-model="form.codigo"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Nombre *</v-label
          ><v-text-field
            v-model="form.nombre"
            variant="outlined"
            density="comfortable"
            :rules="[(v: string) => !!v || 'Req']"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Estado</v-label
          ><v-select
            v-model="form.estado"
            :items="estados"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12"
          ><v-label>Descripción</v-label
          ><v-textarea
            v-model="form.descripcion"
            variant="outlined"
            density="comfortable"
            rows="2"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Fecha Inicio</v-label
          ><v-date-input
            v-model="form.fechaInicio"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Fecha Fin</v-label
          ><v-date-input
            v-model="form.fechaFin"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Presupuesto</v-label
          ><v-text-field
            v-model="form.presupuesto"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="3"
          ><v-label>Avance %</v-label
          ><v-text-field
            v-model="form.avance"
            type="number"
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Cliente</v-label
          ><v-autocomplete
            v-model="form.clienteId"
            :items="terceros"
            item-title="razonSocial"
            item-value="id"
            clearable
            variant="outlined"
            density="comfortable"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-label>Responsable</v-label
          ><v-autocomplete
            v-model="form.responsableId"
            :items="usuarios"
            :item-title="getUserLabel"
            item-value="id"
            clearable
            variant="outlined"
            density="comfortable"
        /></v-col>
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

    <!-- MODAL EXITO EDICION -->
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
            El proyecto <b>{{ lastSaved?.nombre || form.nombre }}</b> se
            actualizó correctamente.
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

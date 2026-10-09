<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  projectsService,
  type Project,
} from "@/services/logic/projects/projects.service";
import ProjectGeneralForm from "../create/index.vue";
import PhasesTab from "../components/PhasesTab.vue";
import ActivitiesTab from "../components/ActivitiesTab.vue";
import TasksTab from "../components/TasksTab.vue";
// import SurveysTab from "../components/SurveysTab.vue";
import {
  FolderKanban,
  Layers,
  ListChecks,
  // ClipboardList,
  CheckSquare,
} from "lucide-vue-next";

defineOptions({
  name: "ProjectEditTabsView",
});

interface ProjectEditProps {
  projectId: string;
  item?: Project;
}

const props = defineProps<ProjectEditProps>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const project = ref<Project | null>((props.item as Project) || null);
const loading = ref(false);
const tab = ref("general");

async function load(): Promise<void> {
  if (project.value?.id) return;
  loading.value = true;
  try {
    project.value = (await projectsService.getById(props.projectId));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al cargar proyecto";
    alert(message);
  } finally {
    loading.value = false;
  }
}

function onUpdated(p: Project): void {
  project.value = p;
}

onMounted(load);
</script>
<template>
  <div>
    <div v-if="loading" class="p-10 text-center">Cargando proyecto...</div>
    <template v-else-if="project">
      <div
        class="rounded-2xl border bg-white dark:bg-white/5 dark:border-gray-800 overflow-hidden"
      >
        <v-tabs v-model="tab" color="primary" class="border-b">
          <v-tab value="general"
            ><FolderKanban class="h-4 w-4 mr-2" /> Datos Básicos</v-tab
          >
          <v-tab value="phases"><Layers class="h-4 w-4 mr-2" /> Fases</v-tab>
          <v-tab value="activities"
            ><ListChecks class="h-4 w-4 mr-2" /> Actividades</v-tab
          >
          <v-tab value="tasks"
            ><CheckSquare class="h-4 w-4 mr-2" /> Tareas</v-tab
          >
          <!-- <v-tab value="surveys"
            ><ClipboardList class="h-4 w-4 mr-2" /> Encuestas</v-tab
          > -->
        </v-tabs>
        <div class="p-6">
          <v-window v-model="tab">
            <v-window-item value="general">
              <ProjectGeneralForm
                :item="project"
                @close="emit('close')"
                @created="onUpdated"
              />
            </v-window-item>
            <v-window-item value="phases">
              <PhasesTab :project-id="project.id" />
            </v-window-item>
            <v-window-item value="activities">
              <ActivitiesTab :project-id="project.id" />
            </v-window-item>
            <v-window-item value="tasks">
              <TasksTab :project-id="project.id" />
            </v-window-item>
            <!-- <v-window-item value="surveys">
              <SurveysTab :project-id="project.id" />
            </v-window-item> -->
          </v-window>
        </div>
      </div>
    </template>
  </div>
</template>

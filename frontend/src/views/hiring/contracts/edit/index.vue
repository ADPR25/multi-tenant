<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  contractsService,
  type Contract,
} from "@/services/logic/hiring/contracts.service";
import ContractGeneralForm from "../create/index.vue";
import RequirementsTab from "../components/RequirementsTab.vue";
import ObligationsTab from "../components/ObligationsTab.vue";
import AddendumsTab from "../components/AddendumsTab.vue";
import { FileText, ListChecks, FilePlus, ClipboardList } from "lucide-vue-next";

defineOptions({ name: "ContractEditTabsView" });

const props = defineProps<{ contractId: string; item?: Contract }>();
const emit = defineEmits<{ (e: "close"): void }>();
const contract = ref<Contract | null>((props.item as Contract) || null);
const loading = ref(false);
const tab = ref("general");

async function load() {
  if (contract.value?.id) return;
  loading.value = true;
  try {
    contract.value = await contractsService.getById(props.contractId);
  } finally {
    loading.value = false;
  }
}
function onUpdated(c: Contract) {
  contract.value = c;
}
onMounted(load);
</script>
<template>
  <div>
    <div v-if="loading" class="p-10 text-center">Cargando contrato...</div>
    <template v-else-if="contract">
      <div class="rounded-2xl border bg-white dark:bg-white/5 overflow-hidden">
        <v-tabs v-model="tab" color="primary" class="border-b">
          <v-tab value="general"><FileText class="h-4 w-4 mr-2" />Datos</v-tab>
          <v-tab value="requirements"
            ><ListChecks class="h-4 w-4 mr-2" />Requisitos</v-tab
          >
          <v-tab value="obligations"
            ><ClipboardList class="h-4 w-4 mr-2" />Obligaciones</v-tab
          >
          <v-tab value="addendums"
            ><FilePlus class="h-4 w-4 mr-2" />Adendas / Otrosi</v-tab
          >
        </v-tabs>
        <div class="p-6">
          <v-window v-model="tab">
            <v-window-item value="general"
              ><ContractGeneralForm
                :item="contract"
                @close="emit('close')"
                @created="onUpdated"
            /></v-window-item>
            <v-window-item value="requirements"
              ><RequirementsTab :contract-id="contract.id"
            /></v-window-item>
            <v-window-item value="obligations"
              ><ObligationsTab :contract-id="contract.id"
            /></v-window-item>
            <v-window-item value="addendums"
              ><AddendumsTab :contract-id="contract.id"
            /></v-window-item>
          </v-window>
        </div>
      </div>
    </template>
  </div>
</template>

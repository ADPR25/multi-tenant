<template>
  <div class="dashboard-page">
    <div ref="dashboardRef" style="min-height: 600px; width: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import { surveysService } from "@/services";
import { onMounted, ref, nextTick, watch } from "vue";

defineOptions({ name: "SurveyGraphicsDashboard" });

const props = defineProps<{ surveyId?: string }>();

const dashboardRef = ref<HTMLDivElement | null>(null);

type CountMap = Record<string, number>;
type StatsValue = CountMap | unknown[] | string | number;
type StatsObject = Record<string, StatsValue>;

type AuraDashboardInstance = {
  getStats?: () => {
    total: number;
    questions: number;
    avgCompletion: string | number;
  };
};

type AuraDashboardOptions = {
  tier?: string;
  brandColors?: string[];
  schema?: unknown;
  responses?: unknown[];
  stats?: StatsObject;
};

interface AuraWindow extends Window {
  AuraSurveyDashboard: new (
    el: HTMLElement,
    options: AuraDashboardOptions,
  ) => AuraDashboardInstance;
}

type BackendResult = {
  data?: unknown;
  schema?: unknown;
  responses?: Record<string, unknown>[];
  stats?: StatsObject;
  survey?: unknown;
} & Record<string, unknown>;

function isCountMap(v: unknown): v is CountMap {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const obj = v as Record<string, unknown>;
  const vals = Object.values(obj);
  if (!vals.length) return false;
  return vals.every((x) => typeof x === "number");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isStatsObject(o: unknown): o is StatsObject {
  if (!isRecord(o)) return false;
  if ("pages" in o) return false;
  const keys = Object.keys(o);
  if (!keys.length) return false;
  return keys.every((k) => {
    const v = o[k];
    if (Array.isArray(v)) return true;
    if (isCountMap(v)) return true;
    return typeof v === "string" || typeof v === "number";
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      const loaded = (existing as unknown as { _loaded?: boolean })._loaded;
      if (loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      (s as unknown as { _loaded?: boolean })._loaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}

async function initDashboard(): Promise<void> {
  const id = String(props.surveyId ?? "");
  if (!id || id === "undefined" || id === "null") return;

  const rawResponse = (await surveysService.getByChar(id)) as unknown;
  const raw = rawResponse as BackendResult;

  const rawDataCandidate = raw.data;
  const rawStatsCandidate = raw.stats;

  let data: Record<string, unknown>;
  if (isRecord(rawDataCandidate)) {
    data = rawDataCandidate;
  } else if (isRecord(rawStatsCandidate)) {
    data = rawStatsCandidate;
  } else if (isRecord(raw)) {
    data = raw;
  } else {
    data = {};
  }

  await nextTick();
  if (!dashboardRef.value) return;

  dashboardRef.value.innerHTML = "";
  await loadScript("/aura-survey/js/aura-survey-dashboard.js");

  const win = window as unknown as AuraWindow;
  if (!win.AuraSurveyDashboard) return;

  const options: AuraDashboardOptions = {
    tier: "pro",
    brandColors: ["#123a2e", "#e36f55", "#c9a227"],
  };

  if (isStatsObject(data)) {
    options.stats = data;
  } else if (raw.stats && isStatsObject(raw.stats)) {
    options.stats = raw.stats;
  } else {
    return;
  }

  new win.AuraSurveyDashboard(dashboardRef.value, options);
}

onMounted(() => {
  void initDashboard();
});

watch(
  () => props.surveyId,
  () => {
    void initDashboard();
  },
);
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
  min-height: 100vh;
  background: #eaf1eb;
}
</style>

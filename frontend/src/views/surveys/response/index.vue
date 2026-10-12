<script setup lang="ts">
defineOptions({ name: "SurveyResponseIndexView" });

import { surveysService } from "@/services";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";

const route = useRoute();
const mount = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const IdSurvey = ref("");

interface AuraSurveyInstance {
  on: (event: string, cb: (data: Record<string, unknown>) => void) => void;
  destroy?: () => void;
}

interface AuraSurveyConstructor {
  new (el: HTMLElement, schema: Record<string, unknown>): AuraSurveyInstance;
}

declare global {
  interface Window {
    AuraSurvey: AuraSurveyConstructor;
  }
}

type SurveyResponse = Record<string, unknown> & {
  survey?: Record<string, unknown>;
};

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing?.dataset.loaded) {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Not found ${src}`));
    document.body.appendChild(script);
  });
};

const loadAura = async (schema: Record<string, unknown>) => {
  if (!document.querySelector('link[data-aura="survey"]')) {
    const l2 = document.createElement("link");
    l2.rel = "stylesheet";
    l2.href = "/aura-survey/css/aura-survey.css";
    l2.dataset.aura = "survey";
    document.head.appendChild(l2);
  }
  await loadScript("/aura-survey/js/aura-survey.js");
  if (!mount.value) return;
  mount.value.innerHTML = "";

  const instance = new window.AuraSurvey(mount.value, schema);
  instance.on("complete", (result) => {
    const payload = {
      surveyId: IdSurvey.value,
      response: { ...result },
    };
    void surveysService.createResponse(payload);
  });
};

const find = async () => {
  try {
    loading.value = true;
    const code = String(route.params.code);
    const data = (await surveysService.getByCode(code)) as SurveyResponse;
    IdSurvey.value = String(data.id);
    const schema = data.survey ?? data;
    await loadAura(schema);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void find();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex justify-center py-8">
    <div class="w-full max-w-3xl px-4">
      <div v-if="loading" class="text-center py-20">Cargando encuesta...</div>
      <div ref="mount" />
    </div>
  </div>
</template>

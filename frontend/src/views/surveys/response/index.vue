<script setup lang="ts">
defineOptions({ name: "SurveyResponseIndexView" });

import { surveysService } from "@/services";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { get } from "@/store/authstore";

const route = useRoute();
const mount = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const IdSurvey = ref("");

const pendingFiles = ref<Map<string, File>>(new Map());

interface CanvasFormValueChanged {
  name: string;
  value: unknown;
  data: Record<string, unknown>;
}

interface CanvasFormInstance {
  on: (
    event:
      "valueChanged" | "complete" | "fileUploaded" | "pageChanged" | "restart",
    cb: (data: Record<string, unknown>) => void,
  ) => void;
  destroy?: () => void;
}
interface CanvasFormConstructor {
  new (el: HTMLElement, schema: Record<string, unknown>): CanvasFormInstance;
}

interface UploadResult {
  url: string;
  storageKey: string;
  filename: string;
  subFolder?: string;
}

interface CanvasFormConfig {
  UPLOAD_URL: string;
  TOKEN: string;
  MAX_FILE_MB: number;
  uploadHandler: (
    file: File | Blob,
    fieldName?: string,
    type?: string,
  ) => Promise<UploadResult>;
}

declare global {
  interface Window {
    CanvasForm: CanvasFormConstructor;
    CanvasFormSurvey: CanvasFormConstructor;
    CanvasFormResponse: CanvasFormConstructor;
    CANVASFORM_CONFIG: CanvasFormConfig;
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
      existing.addEventListener("load", () => {
        resolve();
      });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Not found ${src}`));
    };
    document.body.appendChild(script);
  });
};

const loadCanvasForm = async (
  schema: Record<string, unknown>,
): Promise<void> => {
  if (!document.querySelector('link[data-canvasform="survey"]')) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/canvasform/css/canvasform.css";
    l.dataset.canvasform = "survey";
    document.head.appendChild(l);
  }

  const backend_api =
    (get.useAuth("backend_api") as string) ||
    import.meta.env.VITE_BACKEND_API_URL;

  window.CANVASFORM_CONFIG = {
    UPLOAD_URL: `${backend_api}/uploads/survey/${IdSurvey.value}`,
    TOKEN: "",
    MAX_FILE_MB: 5,
    uploadHandler: (
      file: File | Blob,
      fieldName?: string,
    ): Promise<UploadResult> => {
      const name = fieldName || `file_${Date.now()}`;
      const f =
        file instanceof File
          ? file
          : new File([file], `${name}-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });

      pendingFiles.value.set(name, f);
      const previewUrl = URL.createObjectURL(f);

      return Promise.resolve({
        url: previewUrl,
        storageKey: `pending:${name}`,
        filename: f.name,
        subFolder: "pending",
      });
    },
  };

  await loadScript("/canvasform/js/canvasform.js");

  if (!mount.value) return;
  mount.value.innerHTML = "";

  const CanvasFormClass =
    window.CanvasFormSurvey || window.CanvasForm || window.CanvasFormResponse;
  if (!CanvasFormClass) {
    console.error("CanvasForm no encontrado");
    return;
  }

  const instance = new CanvasFormClass(mount.value, schema);

  instance.on("valueChanged", (data: Record<string, unknown>) => {
    const ev = data as unknown as CanvasFormValueChanged;
    if (
      ev.value === "" ||
      ev.value == null ||
      (Array.isArray(ev.value) && ev.value.length === 0)
    ) {
      if (pendingFiles.value.has(ev.name)) {
        pendingFiles.value.delete(ev.name);
      }
    }
  });

  instance.on("complete", (result: Record<string, unknown>) => {
    void (async (): Promise<void> => {
      try {
        loading.value = true;
        const finalResponse: Record<string, unknown> = { ...result };

        if (pendingFiles.value.size > 0) {
          for (const [fieldName, file] of pendingFiles.value.entries()) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("fieldName", fieldName);

            const res = await fetch(
              `${backend_api}/uploads/survey/${IdSurvey.value}`,
              {
                method: "POST",
                body: fd,
              },
            );

            if (!res.ok) {
              throw new Error(`Error subiendo ${fieldName}`);
            }

            const json = (await res.json()) as {
              url: string;
              storageKey: string;
              filename: string;
              subFolder: string;
            };

            finalResponse[fieldName] = {
              url: json.url,
              storageKey: json.storageKey,
              filename: json.filename,
              subFolder: json.subFolder,
              originalName: file.name,
            };
          }
        }

        const payload = {
          surveyId: IdSurvey.value,
          response: finalResponse,
        };

        await surveysService.createResponse(payload);
        pendingFiles.value.clear();
      } catch (e) {
        console.error("Error enviando encuesta", e);
      } finally {
        loading.value = false;
      }
    })();
  });
};

const find = async (): Promise<void> => {
  try {
    loading.value = true;
    const code = String(route.params.code);
    const data = (await surveysService.getByCode(code)) as SurveyResponse;
    IdSurvey.value = String(data.id);
    const schema = (data.survey ?? data);
    await loadCanvasForm(schema);
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

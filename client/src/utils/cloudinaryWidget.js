const CLOUDINARY_WIDGET_SCRIPT = "https://upload-widget.cloudinary.com/latest/global/all.js";

let cloudinaryScriptPromise = null;

export function loadCloudinaryWidgetScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window is not available"));
  }

  if (window.cloudinary?.createUploadWidget) {
    return Promise.resolve();
  }

  if (!cloudinaryScriptPromise) {
    cloudinaryScriptPromise = new Promise((resolve, reject) => {
      const finishOk = () => {
        if (window.cloudinary?.createUploadWidget) resolve();
        else reject(new Error("Cloudinary 위젯을 불러오지 못했습니다."));
      };

      const existing = document.querySelector(`script[src="${CLOUDINARY_WIDGET_SCRIPT}"]`);
      if (existing) {
        if (window.cloudinary?.createUploadWidget) {
          finishOk();
          return;
        }
        existing.addEventListener("load", finishOk, { once: true });
        existing.addEventListener("error", () => reject(new Error("Cloudinary 스크립트 로드 실패")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = CLOUDINARY_WIDGET_SCRIPT;
      script.async = true;
      script.onload = finishOk;
      script.onerror = () => reject(new Error("Cloudinary 스크립트 로드 실패"));
      document.body.appendChild(script);
    }).catch((err) => {
      cloudinaryScriptPromise = null;
      throw err;
    });
  }

  return cloudinaryScriptPromise;
}

export function getCloudinaryEnv() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  return {
    cloudName,
    uploadPreset,
    ready: Boolean(cloudName && uploadPreset),
  };
}

/**
 * @param {{ onSuccess: (secureUrl: string) => void, onError?: (message: string) => void }} options
 */
export async function openCloudinaryUploadWidget({ onSuccess, onError }) {
  const { cloudName, uploadPreset, ready } = getCloudinaryEnv();

  if (!ready) {
    onError?.("Cloudinary 환경 변수(VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)를 설정하세요.");
    return;
  }

  await loadCloudinaryWidgetScript();
  const { cloudinary } = window;
  if (!cloudinary?.createUploadWidget) {
    onError?.("업로드 위젯을 초기화할 수 없습니다.");
    return;
  }

  const widget = cloudinary.createUploadWidget(
    { cloudName, uploadPreset },
    (error, result) => {
      if (error) {
        onError?.(error.statusText || "업로드 중 오류가 발생했습니다.");
        return;
      }
      if (result?.event === "success" && result.info?.secure_url) {
        onSuccess(result.info.secure_url);
      }
    }
  );
  widget.open();
}

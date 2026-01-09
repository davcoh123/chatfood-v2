export type AssistantPayload = {
  message: string;
  plat: unknown[];
  commande: unknown[];
  price: unknown[];
  total: string;
  checkout_stage: string;
  fulfillment: {
    mode: string | null;
    first_name: string | null;
    last_name: string | null;
    arrival_time_iso: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
  };
  assets: string[]; // 0, 1, ou 2 URLs
  submit_order: boolean;
};

const ASSET_REQUEST_TIMEOUT_MS = 12000;
const ASSET_MAX_RETRIES = 3;

// Cache session des ObjectURLs
const assetBlobCache = new Map<string, string>();

// Helper sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction de téléchargement binaire avec retry et exponential backoff
async function fetchWithRetryBinary(
  url: string,
  body: Record<string, unknown>,
  maxRetries = ASSET_MAX_RETRIES,
  timeoutMs = ASSET_REQUEST_TIMEOUT_MS
): Promise<Blob> {
  let attempt = 0;
  let backoff = 300;

  while (true) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch("https://n8n.chatfood.fr/webhook/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (blob.size === 0) throw new Error("Empty blob");
      
      return blob;
    } catch (err) {
      clearTimeout(timeoutId);
      if (attempt >= maxRetries) throw err;
      
      await sleep(backoff);
      backoff = Math.min(backoff * 3, 2000);
    }
  }
}

// Résoudre tous les assets en ObjectURLs
export async function resolveAssetsToObjectURLs(
  assets: string[],
  ctx: { chatId: string; messageId: string }
): Promise<string[]> {
  if (assets.length === 0) return [];

  const results: (string | null)[] = Array(assets.length).fill(null);

  await Promise.all(
    assets.map(async (src, index) => {
      try {
        // Cache hit
        if (assetBlobCache.has(src)) {
          results[index] = assetBlobCache.get(src)!;
          return;
        }

        // Télécharger le binaire
        const blob = await fetchWithRetryBinary(src, {
          url: src,
          chatId: ctx.chatId,
          messageId: ctx.messageId,
          index,
        });

        const objUrl = URL.createObjectURL(blob);
        assetBlobCache.set(src, objUrl);
        results[index] = objUrl;
      } catch {
        // Fallback : URL directe si échec binaire
        results[index] = src;
      }
    })
  );

  return results.map((v, i) => v ?? assets[i]);
}

// Attendre que toutes les images soient chargées
export function waitImagesLoad(urls: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (!urls.length) return resolve();

    let loaded = 0;
    const total = urls.length;

    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded >= total) resolve();
      };
      img.onerror = () => {
        // Débloquer même en cas d'erreur
        loaded++;
        if (loaded >= total) resolve();
      };
      img.src = url;
      img.loading = "eager";
      img.decoding = "async";
    });
  });
}

// Fonction pour libérer un ObjectURL du cache
export function revokeAssetObjectURL(url: string): void {
  const objectUrl = assetBlobCache.get(url);
  if (objectUrl && objectUrl.startsWith('blob:')) {
    URL.revokeObjectURL(objectUrl);
    assetBlobCache.delete(url);
  }
}

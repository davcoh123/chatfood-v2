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
  assets: string[];
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

  const results: string[] = [];

  for (const assetUrl of assets) {
    // Vérifier le cache
    const cacheKey = `${ctx.chatId}:${assetUrl}`;
    if (assetBlobCache.has(cacheKey)) {
      results.push(assetBlobCache.get(cacheKey)!);
      continue;
    }

    try {
      const blob = await fetchWithRetryBinary(assetUrl, {
        chatId: ctx.chatId,
        messageId: ctx.messageId,
        assetUrl,
      });

      const objectUrl = URL.createObjectURL(blob);
      assetBlobCache.set(cacheKey, objectUrl);
      results.push(objectUrl);
    } catch (error) {
      console.error(`Failed to load asset: ${assetUrl}`, error);
      // On continue sans l'image en cas d'erreur
    }
  }

  return results;
}

// Attendre que les images soient chargées
export function waitImagesLoad(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Résoudre même en cas d'erreur
          img.src = url;
        })
    )
  );
}

// Nettoyer les ObjectURLs
export function revokeObjectURLs(urls: string[]): void {
  urls.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}

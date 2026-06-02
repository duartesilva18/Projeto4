import { randomUUID } from 'crypto';
import type { DgesImportPreview } from './dges-statcol.types';

const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 200;

const store = new Map<string, DgesImportPreview>();

export function savePreview(preview: Omit<DgesImportPreview, 'previewId' | 'createdAt'>): DgesImportPreview {
  purgeExpired();
  if (store.size >= MAX_ENTRIES) {
    const oldest = [...store.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) store.delete(oldest[0]);
  }
  const entry: DgesImportPreview = {
    ...preview,
    previewId: randomUUID(),
    createdAt: Date.now()
  };
  store.set(entry.previewId, entry);
  return entry;
}

export function getPreview(previewId: string): DgesImportPreview | undefined {
  purgeExpired();
  return store.get(previewId);
}

/** Obtém e remove preview (single-use para apply) */
export function getAndDeletePreview(previewId: string): DgesImportPreview | undefined {
  purgeExpired();
  const entry = store.get(previewId);
  if (entry) {
    store.delete(previewId);
  }
  return entry;
}

export function deletePreview(previewId: string): void {
  store.delete(previewId);
}

function purgeExpired(): void {
  const now = Date.now();
  for (const [id, p] of store.entries()) {
    if (now - p.createdAt > TTL_MS) store.delete(id);
  }
}

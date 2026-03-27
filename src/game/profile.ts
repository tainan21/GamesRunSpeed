import { DEFAULT_PERSISTENT_PROFILE, PROFILE_STORAGE_KEY } from "./config/progression";
import type { PersistentProfile } from "./types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function sanitizeProfile(raw: unknown): PersistentProfile {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PERSISTENT_PROFILE };
  }

  const candidate = raw as Partial<PersistentProfile> & { lastCharacterId?: string };

  return {
    // Keep profile validation explicit so the saved character can't drift to an invalid id.
    lastCharacterId:
      candidate.lastCharacterId === "soldier" ||
      candidate.lastCharacterId === "scout" ||
      candidate.lastCharacterId === "tank" ||
      candidate.lastCharacterId === "sniper" ||
      candidate.lastCharacterId === "pyromancer" ||
      candidate.lastCharacterId === "chemist" ||
      candidate.lastCharacterId === "engineer" ||
      candidate.lastCharacterId === "berserker" ||
      candidate.lastCharacterId === "lightningAdept" ||
      candidate.lastCharacterId === "guardian" ||
      candidate.lastCharacterId === "ranger" ||
      candidate.lastCharacterId === "assassin" ||
      candidate.lastCharacterId === "necromancer" ||
      candidate.lastCharacterId === "gladiator" ||
      candidate.lastCharacterId === "alchemist" ||
      candidate.lastCharacterId === "trickster"
        ? candidate.lastCharacterId
        : DEFAULT_PERSISTENT_PROFILE.lastCharacterId
  };
}

export function loadProfile(storage: Pick<StorageLike, "getItem"> | undefined): PersistentProfile {
  if (!storage) {
    return sanitizeProfile(DEFAULT_PERSISTENT_PROFILE);
  }

  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return sanitizeProfile(DEFAULT_PERSISTENT_PROFILE);
    }

    return sanitizeProfile(JSON.parse(raw));
  } catch {
    return sanitizeProfile(DEFAULT_PERSISTENT_PROFILE);
  }
}

export function saveProfile(storage: Pick<StorageLike, "setItem"> | undefined, profile: PersistentProfile): void {
  if (!storage) {
    return;
  }

  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(sanitizeProfile(profile)));
}

import { MusicProvider } from "../music.interface";
import { IMusicProviderService } from "./base.provider";
import { JamendoProvider } from "./jamendo.provider";
import { InternalProvider } from "./internal.provider";

/**
 * Provider registry.
 * Maps provider enum to provider implementation.
 */
const providerInstances = new Map<MusicProvider, IMusicProviderService>();

/**
 * Initialize provider instances (singleton pattern).
 */
function initializeProviders(): void {
  if (providerInstances.size > 0) return;

  providerInstances.set(MusicProvider.JAMENDO, new JamendoProvider());
  providerInstances.set(MusicProvider.INTERNAL, new InternalProvider());
  // Add more providers here as they're implemented:
  // providerInstances.set(MusicProvider.FREE_MUSIC_ARCHIVE, new FMAProvider());
}

/**
 * Get a specific provider instance.
 */
export function getProvider(provider: MusicProvider): IMusicProviderService | undefined {
  initializeProviders();
  return providerInstances.get(provider);
}

/**
 * Get all enabled providers.
 */
export function getAllEnabledProviders(): IMusicProviderService[] {
  initializeProviders();
  return Array.from(providerInstances.values()).filter((p) => p.isEnabled());
}

/**
 * Get the first enabled provider (fallback for when user doesn't specify).
 */
export function getDefaultProvider(): IMusicProviderService | undefined {
  const enabled = getAllEnabledProviders();
  return enabled.length > 0 ? enabled[0] : undefined;
}

export { JamendoProvider, InternalProvider };
export type { IMusicProviderService };

import axios from "axios";
import { IMusicProviderTrack, IMusicSearchQuery, MusicGenre, MusicLicense, MusicMood } from "../music.interface";
import { MUSIC_PROVIDER_CONFIG } from "../music.constants";
import { BaseMusicProvider } from "./base.provider";

/**
 * Jamendo API integration.
 * Docs: https://developer.jamendo.com/v3.0
 *
 * Jamendo provides royalty-free music with Creative Commons licensing.
 * All tracks require attribution. Always check license terms before use.
 */
export class JamendoProvider extends BaseMusicProvider {
  readonly name = "Jamendo";
  private readonly config = MUSIC_PROVIDER_CONFIG.JAMENDO;
  private readonly baseUrl = this.config.apiUrl;
  private readonly clientId = this.config.clientId;

  isEnabled(): boolean {
    return this.config.enabled && Boolean(this.clientId);
  }

  async searchTracks(query: IMusicSearchQuery): Promise<{
    tracks: IMusicProviderTrack[];
    total: number;
    hasMore: boolean;
  }> {
    console.log("🎵 Jamendo searchTracks called with:", JSON.stringify(query, null, 2));

    if (!this.isEnabled()) {
      console.log("❌ Jamendo provider is NOT enabled. ClientID:", this.clientId ? "EXISTS" : "MISSING");
      return { tracks: [], total: 0, hasMore: false };
    }

    console.log("✅ Jamendo provider is enabled");

    try {
      const params: Record<string, string | number> = {
        client_id: this.clientId,
        format: "json",
        limit: query.limit || 20,
        offset: query.offset || 0,
      };

      // Text search
      if (query.query) {
        params.search = query.query;
      }

      // Genre filter (map our enums to Jamendo tags)
      if (query.genre) {
        params.tags = this.mapGenreToTag(query.genre);
      }

      // Duration filter
      if (query.minDuration) {
        params.duration_min = query.minDuration;
      }
      if (query.maxDuration) {
        params.duration_max = query.maxDuration;
      }

      // Include audio URLs and licensing info
      params.include = "musicinfo+licenses";
      // Request audio format explicitly for valid stream URLs
      params.audioformat = "mp32"; // Request MP3 192kbps format

      console.log("Jamendo API request:", `${this.baseUrl}/tracks/`, params);

      const response = await axios.get(`${this.baseUrl}/tracks/`, {
        params,
        timeout: 10000,
      });

      console.log("Jamendo API response:", {
        status: response.status,
        resultsCount: response.data?.results?.length || 0,
        headers: response.data?.headers,
      });

      if (!response.data?.results) {
        console.log("No results from Jamendo API");
        return { tracks: [], total: 0, hasMore: false };
      }

      const tracks = response.data.results
        .map((track: Record<string, unknown>) => {
          const normalized = this.normalizeTrack(track);
          if (!normalized) {
            console.log("⚠️ Track filtered out during normalization:", { id: track.id, name: track.name });
          }
          return normalized;
        })
        .filter((track: IMusicProviderTrack | null) => track !== null) as IMusicProviderTrack[];

      console.log(`✅ Successfully normalized ${tracks.length} tracks out of ${response.data.results.length} raw results`);

      const total = response.data.headers?.results_count || tracks.length;
      const hasMore = (query.offset || 0) + tracks.length < total;

      return { tracks, total, hasMore };
    } catch (error) {
      console.error("Jamendo API error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      return { tracks: [], total: 0, hasMore: false };
    }
  }

  async getTrackById(providerTrackId: string): Promise<IMusicProviderTrack | null> {
    if (!this.isEnabled()) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/tracks/`, {
        params: {
          client_id: this.clientId,
          format: "json",
          id: providerTrackId,
          include: "musicinfo+licenses",
          audioformat: "mp32",
        },
        timeout: 10000,
      });

      if (!response.data?.results?.[0]) return null;

      return this.normalizeTrack(response.data.results[0]);
    } catch (error) {
      console.error(`Jamendo getTrackById error (${providerTrackId}):`, error);
      return null;
    }
  }

  async getTrendingTracks(limit = 20): Promise<IMusicProviderTrack[]> {
    if (!this.isEnabled()) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/tracks/`, {
        params: {
          client_id: this.clientId,
          format: "json",
          limit,
          order: "popularity_total", // Most popular
          include: "musicinfo+licenses",
          audioformat: "mp32",
        },
        timeout: 10000,
      });

      if (!response.data?.results) return [];

      return response.data.results
        .map((track: Record<string, unknown>) => this.normalizeTrack(track))
        .filter((track: IMusicProviderTrack | null) => track !== null) as IMusicProviderTrack[];
    } catch (error) {
      console.error("Jamendo getTrendingTracks error:", error);
      return [];
    }
  }

  async getTracksByGenre(genre: string, limit = 20): Promise<IMusicProviderTrack[]> {
    return (
      await this.searchTracks({
        genre: genre as MusicGenre,
        limit,
      })
    ).tracks;
  }

  async getTracksByMood(mood: string, limit = 20): Promise<IMusicProviderTrack[]> {
    // Jamendo doesn't have explicit mood tags, use genre as fallback
    const moodToGenre: Record<string, MusicGenre> = {
      [MusicMood.HAPPY]: MusicGenre.POP,
      [MusicMood.SAD]: MusicGenre.ACOUSTIC,
      [MusicMood.ENERGETIC]: MusicGenre.ELECTRONIC,
      [MusicMood.CALM]: MusicGenre.AMBIENT,
      [MusicMood.ROMANTIC]: MusicGenre.JAZZ,
      [MusicMood.EPIC]: MusicGenre.CLASSICAL,
      [MusicMood.DARK]: MusicGenre.ROCK,
      [MusicMood.UPLIFTING]: MusicGenre.POP,
      [MusicMood.CHILL]: MusicGenre.AMBIENT,
      [MusicMood.DRAMATIC]: MusicGenre.CLASSICAL,
    };

    const genre = moodToGenre[mood] || MusicGenre.POP;
    return this.getTracksByGenre(genre, limit);
  }

  /**
   * Normalize Jamendo track response to our interface.
   */
  private normalizeTrack(track: Record<string, unknown>): IMusicProviderTrack | null {
    try {
      // Validate required fields
      if (!track.id || !track.name || !track.artist_name) {
        console.log("⚠️ Missing required fields:", { id: track.id, name: track.name, artist: track.artist_name });
        return null;
      }

      // Jamendo API provides different audio URLs based on format requested
      // Priority: audiodownload_allowed -> audiodownload -> audio
      let audioUrl = "";

      if (track.audiodownload_allowed && track.audiodownload) {
        audioUrl = String(track.audiodownload);
      } else if (track.audio) {
        audioUrl = String(track.audio);
      }

      if (!this.validateUrl(audioUrl)) {
        console.log("⚠️ Invalid audio URL:", { trackId: track.id, audioUrl });
        return null;
      }

      // Determine license (Jamendo uses CC licenses)
      const license = this.mapLicense(track.license_ccurl as string | undefined);

      const trackName = String(track.name);
      const artistName = String(track.artist_name);

      return {
        providerTrackId: String(track.id),
        title: this.sanitizeString(trackName) || "Untitled",
        artist: this.sanitizeString(artistName) || "Unknown Artist",
        album: this.sanitizeString(track.album_name as string | undefined) || undefined,
        duration: this.normalizeDuration(Number(track.duration) || 0),
        artworkUrl: this.validateUrl(String(track.image)) ? String(track.image) : undefined,
        previewUrl: audioUrl,
        downloadUrl: this.validateUrl(String(track.audiodownload)) ? String(track.audiodownload) : undefined,
        genre: this.mapTagToGenre((track.musicinfo as Record<string, unknown> | undefined)?.tags as Record<string, unknown>),
        mood: undefined, // Jamendo doesn't provide mood
        trackLanguage: undefined,
        license,
        attributionRequired: true, // All CC licenses require attribution
        attributionText: `Music: "${trackName}" by ${artistName} (Jamendo)`,
        commercialUse: license === MusicLicense.CC_BY || license === MusicLicense.CC_BY_SA,
      };
    } catch (error) {
      console.error("Jamendo normalizeTrack error:", error);
      return null;
    }
  }

  /**
   * Map Jamendo license URL to our license enum.
   */
  private mapLicense(licenseUrl: string | undefined): MusicLicense {
    if (!licenseUrl) return MusicLicense.ROYALTY_FREE;

    if (licenseUrl.includes("by-nc")) return MusicLicense.CC_BY_NC;
    if (licenseUrl.includes("by-nd")) return MusicLicense.CC_BY_ND;
    if (licenseUrl.includes("by-sa")) return MusicLicense.CC_BY_SA;
    if (licenseUrl.includes("/by/")) return MusicLicense.CC_BY;
    if (licenseUrl.includes("/zero/")) return MusicLicense.CC0;

    return MusicLicense.ROYALTY_FREE;
  }

  /**
   * Map our genre enum to Jamendo tags.
   */
  private mapGenreToTag(genre: MusicGenre): string {
    const map: Record<MusicGenre, string> = {
      [MusicGenre.POP]: "pop",
      [MusicGenre.ROCK]: "rock",
      [MusicGenre.ELECTRONIC]: "electronic",
      [MusicGenre.JAZZ]: "jazz",
      [MusicGenre.CLASSICAL]: "classical",
      [MusicGenre.HIP_HOP]: "hiphop",
      [MusicGenre.AMBIENT]: "ambient",
      [MusicGenre.FOLK]: "folk",
      [MusicGenre.INDIE]: "indie",
      [MusicGenre.WORLD]: "world",
      [MusicGenre.ACOUSTIC]: "acoustic",
      [MusicGenre.INSTRUMENTAL]: "instrumental",
    };
    return map[genre] || "pop";
  }

  /**
   * Map Jamendo tags to our genre enum.
   */
  private mapTagToGenre(tags: Record<string, unknown>): MusicGenre | undefined {
    if (!tags?.genres || !Array.isArray(tags.genres) || tags.genres.length === 0) {
      return undefined;
    }

    const genreTag = tags.genres[0]?.toLowerCase();
    const map: Record<string, MusicGenre> = {
      pop: MusicGenre.POP,
      rock: MusicGenre.ROCK,
      electronic: MusicGenre.ELECTRONIC,
      jazz: MusicGenre.JAZZ,
      classical: MusicGenre.CLASSICAL,
      hiphop: MusicGenre.HIP_HOP,
      ambient: MusicGenre.AMBIENT,
      folk: MusicGenre.FOLK,
      indie: MusicGenre.INDIE,
      world: MusicGenre.WORLD,
      acoustic: MusicGenre.ACOUSTIC,
      instrumental: MusicGenre.INSTRUMENTAL,
    };

    return map[genreTag];
  }
}

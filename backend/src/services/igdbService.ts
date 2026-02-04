import "dotenv/config";

/**
 * IGDB / Twitch OAuth token caching
 */
let accessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get (and cache) Twitch OAuth access token
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const response = await fetch(
    "https://id.twitch.tv/oauth2/token" +
      `?client_id=${process.env.TWITCH_CLIENT_ID}` +
      `&client_secret=${process.env.TWITCH_CLIENT_SECRET}` +
      `&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get Twitch access token");
  }

  const data: {
    access_token: string;
    expires_in: number;
  } = await response.json();

  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return accessToken;
}

/**
 * Generic IGDB request helper
 */
async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IGDB request failed: ${text}`);
  }

  return response.json();
}

/**
 * IGDB game type
 */
type IgdbGame = {
  id: number;
  name: string;
  summary?: string; // description from IGDB
  cover?: {
    url: string;
  };
};

/**
 * Search games by name (used for import)
 */
export async function searchGames(query: string) {
  return igdbRequest<IgdbGame[]>(
    "games",
    `
      search "${query}";
      fields id, name, summary, cover.url;
      limit 10;
    `
  );
}

/**
 * Get single game by IGDB ID
 */
export async function getGameByIgdbId(igdbId: number) {
  const result = await igdbRequest<IgdbGame[]>(
    "games",
    `
      where id = ${igdbId};
      fields id, name, summary, cover.url;
      limit 1;
    `
  );

  return result[0] ?? null;
}

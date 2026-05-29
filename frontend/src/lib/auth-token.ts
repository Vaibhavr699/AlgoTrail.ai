// In-memory cache of the backend-issued JWT access token.
//
// The NextAuth session is the source of truth; `TokenSync` (in providers.tsx)
// mirrors `session.accessToken` here on every session change so the API client
// can attach the bearer header synchronously without a network round-trip.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

import Config from '../models/Config';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET is missing in environment variables');
  }

  // 1. Try to get token from DB
  const config = await Config.findOne({ key: 'igdb_access_token' });
  if (config) {
    return config.value;
  }

  // 2. If not found, refresh token
  return await refreshAccessToken();
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET is missing in environment variables');
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh IGDB token: ${response.statusText} - ${errorBody}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  // Save to DB
  await Config.findOneAndUpdate(
    { key: 'igdb_access_token' },
    { value: data.access_token },
    { upsert: true, new: true }
  );

  return data.access_token;
}

export default { getAccessToken, refreshAccessToken };

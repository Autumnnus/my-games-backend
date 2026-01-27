import igdbAuthHelper from '../helpers/igdb-auth.helper';
import { IgdbData } from '../types/models';

async function fetchIgdbGames(body: string, isRetry = false): Promise<IgdbData[]> {
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) {
    throw new Error('IGDB_CLIENT_ID is missing');
  }

  const accessToken = await igdbAuthHelper.getAccessToken();

  const response = await fetch(`https://api.igdb.com/v4/games`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body,
  });

  if (response.status === 401 && !isRetry) {
    await igdbAuthHelper.refreshAccessToken();
    return await fetchIgdbGames(body, true);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as IgdbData[];
}

export default { fetchIgdbGames };

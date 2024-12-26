import { IgdbData } from "../types/models";

async function fetchIgdbGames(body: string): Promise<IgdbData[]> {
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
    throw new Error("IGDB credentials are missing");
  }

  fetch(`https://api.igdb.com/v4/games`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: body
  });
  const response = await fetch(`https://api.igdb.com/v4/games`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: body
  });
  return await response.json();
}

export default { fetchIgdbGames };

async function getIGDBGames(search: string) {
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
    throw new Error("IGDB credentials are missing");
  }
  const body = `
        fields name,id,cover.game,cover.url,slug,summary,genres.name,themes.name,player_perspectives.name,game_modes.name,release_dates.date,involved_companies.publisher,involved_companies.developer,aggregated_rating,involved_companies.company.name,aggregated_rating_count,category;
        where category = (0,4,8,9,10);
        limit 30;
        search "${search}";
      `;
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
  const data = await response.json();
  return data;
}

export default { getIGDBGames };

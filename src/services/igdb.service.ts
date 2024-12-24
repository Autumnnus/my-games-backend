import { color } from "console-log-colors";
import Games from "../models/Games";
import igdbRepository from "../repository/igdb.repository";

const field =
  "name,id,cover.game,cover.url,slug,summary,genres.name,themes.name,player_perspectives.name,game_modes.name,release_dates.date,involved_companies.publisher,involved_companies.developer,aggregated_rating,involved_companies.company.name,aggregated_rating_count,category,first_release_date";

async function getIGDBGamesService(search: string) {
  const body = `
    fields ${field};
    where category = (0,4,8,9,10);
    limit 30;
    search "${search}";
  `;
  return await igdbRepository.fetchIgdbGames(body);
}

async function getIGDBGameService(gameId: number) {
  const body = `
    fields ${field};
    where id = ${gameId};
    limit 1;
  `;
  const game = await igdbRepository.fetchIgdbGames(body);
  return game[0];
}

async function updateGameIGDBDataService(mongoId: string) {
  const mongoGame = await Games.findOne({ _id: mongoId });

  if (!mongoGame?.igdb?.id) {
    throw new Error("Game does not have an IGDB ID");
  }
  const igdbGame = await getIGDBGameService(mongoGame.igdb.id);
  if (mongoGame) {
    mongoGame.igdb = igdbGame;
  }
  const updatedGame = Games.updateOne(
    { _id: mongoId },
    { $set: { igdb: igdbGame } },
    { timestamps: false }
  );

  return updatedGame;
}

async function updateAllGamesIGDBDataService() {
  try {
    const allGames = await Games.find({});
    const updatedGames = [];

    for (const game of allGames) {
      const index = allGames.indexOf(game);
      if (!game?.igdb?.id) {
        console.log(
          color.cyan(
            `${index}.Game ID ${game._id} + ${game.name}  does not have an IGDB ID`
          )
        );
        continue;
      }

      try {
        const igdbGame = await getIGDBGameService(game.igdb.id);

        await Games.updateOne(
          { _id: game._id },
          { $set: { igdb: igdbGame } },
          { timestamps: false }
        );
        updatedGames.push(game);

        console.log(
          color.green(
            `${index}.Game ID ${game._id} + ${game.name}  successfully updated`
          )
        );
      } catch (error) {
        console.log(
          color.red(`${index}.Error updating Game ID ${game._id}:`),
          error
        );
      }
    }
    return {
      count: updatedGames.length,
      games: updatedGames
    };
  } catch (error) {
    console.error("Error fetching games:", error);
  }
}

export default {
  getIGDBGamesService,
  getIGDBGameService,
  updateGameIGDBDataService,
  updateAllGamesIGDBDataService
};

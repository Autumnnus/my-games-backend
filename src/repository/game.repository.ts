import Games from "../models/Games";

async function getGameById(id: string) {
  return await Games.findById(id);
}

export default {
  getGameById
};

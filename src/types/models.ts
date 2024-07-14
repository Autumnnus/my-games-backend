import mongoose from "mongoose";

export type GamesData = {
  name: string;
  photo?: string;
  lastPlay: Date;
  platform:
    | "steam"
    | "epicGames"
    | "ubisoft"
    | "xboxPc"
    | "eaGames"
    | "torrent"
    | "playstation"
    | "xboxSeries"
    | "nintendo"
    | "mobile"
    | "otherPlatforms";
  review?: string;
  rating?: number;
  status: "completed" | "abandoned" | "toBeCompleted" | "activePlaying";
  playTime: number;
  isFavorite?: boolean;
  screenshotSize?: number;
  userId: mongoose.Schema.Types.ObjectId;
  firstFinished?: Date;
  igdb?: {
    id: number;
    cover: {
      id: number;
      url: string;
      game: number;
    };
    aggregated_rating?: number;
    aggregated_rating_count?: number;
    game_modes?: {
      id: number;
      name: string;
    }[];
    genres?: {
      id: number;
      name: string;
    }[];
    developers?: {
      id: number;
      name: string;
    }[];
    publishers?: {
      id: number;
      name: string;
    }[];
    player_perspectives?: {
      id: number;
      name: string;
    }[];
    release_date?: {
      id: number;
      date: number;
    };
    themes?: {
      id: number;
      name: string;
    }[];
  };
  slug?: string;
};

export type UserData = {
  name: string;
  password: string;
  email: string;
  isVerified?: boolean;
  verificationToken?: string;
  verificationExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  profileImage?: string;
  role?: string;
  gameSize?: number;
  completedGameSize?: number;
  screenshotSize?: number;
  favoriteGames?: {
    game: mongoose.Schema.Types.ObjectId;
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    rating?: number;
    photo?: string;
    ref: "Games";
  }[];
  createdAt: Date;
  updatedAt: Date;
  getResetPasswordTokenFromUser(): string;
  generateJwtFromUser(): string;
  getVerificationTokenFromUser(): string;
};
export type ScreenshotData = {
  name?: string;
  url: string;
  thumbnail?: string;
  key?: string;
  user: mongoose.Schema.Types.ObjectId;
  game: mongoose.Schema.Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

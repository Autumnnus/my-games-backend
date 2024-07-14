import { color } from "console-log-colors";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connectDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be provided in .env file");
    }
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(color.c106(`MongoDB connect: ${connect.connection.host}`))
    return connect;
  } catch (error) {
    console.error(error);
  }
};

export default connectDatabase;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connect: ${connect.connection.host}`);
    return connect;
  } catch (error) {
    console.error(error);
  }
};

export default connectDatabase;

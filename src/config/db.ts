import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // const uri = process.env.MONGODB_URI || "";
    // if (uri == "") {
    //   throw new Error("Error connecting to MongoDB")
    // }
    await mongoose.connect("mongodb+srv://vercel-admin-user:g8cAGDvYxeXrqd4t@learn1.kd9vc1c.mongodb.net/socialApp?retryWrites=true&w=majority");
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;

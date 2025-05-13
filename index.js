import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://mern-blog-client-orpin.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);
config();
app.get("/", (req, res) => {
  res.send("ok");
});

//--------------------------

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

//error handling middleware

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const errorCode = error.code;
  const resObject = { success: false, statusCode, message, errorCode };
  console.error(resObject);
  res.status(statusCode).json(resObject);
});
//--------------------------

const PORT = process.env.PORT || 3000;
const MONGO_STRING = process.env.MONGO_STRING;

async function connectToDb() {
  try {
    await mongoose.connect(MONGO_STRING);
    app.listen(PORT, () => {
      console.log(`Connected to DB and server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

connectToDb();

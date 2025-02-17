import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import MongoStore from "connect-mongo";

// Import authentication and API routes
import authRoutes from "./routes/auth"
import mistralRoutes from "./routes/mistralAPI";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB Connection Error:", err));

app.use(express.json());
app.use(cors());

// Session setup (stored in MongoDB)
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI as string }),
}));

app.use(passport.initialize());
app.use(passport.session());

// Use authentication and Mistral API routes
app.use("/auth", authRoutes);  // Routes from auth.ts
app.use("/mistral", mistralRoutes);  // Routes from mistralAPI.ts

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
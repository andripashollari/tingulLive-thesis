import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import spotifyRoutes from "./routes/spotify.route.js"
import roomRoutes from "./routes/room.route.js"
import userRouter from "./routes/user.route.js"
import followRouter from "./routes/follow.route.js"
import adminRouter from "./routes/admin.route.js"
import { app, server } from "./lib/socket.js"

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    })
);
console.log("Mounting route at:", "/api/auth");
app.use("/api/auth", authRoutes);
console.log("Mounting route at:", "/api/messages");
app.use("/api/messages", messageRoutes);
console.log("Mounting route at:", "/api/spotify");
app.use("/api/spotify", spotifyRoutes);
console.log("Mounting route at:", "/api/room");
app.use("/api/room", roomRoutes);
console.log("Mounting route at:", "/api/user");
app.use("/api/user", userRouter);
console.log("Mounting route at:", "/api/follow");
app.use("/api/follow", followRouter);
console.log("Mounting route at:", "/api/admin");
app.use("/api/admin", adminRouter);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    console.log("Serving static files from:", path.join(__dirname, "../frontend/dist"));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
    console.log("Catch-all route configured to serve index.html");
}

server.listen(PORT, () => {
    console.log("server is running on port: " + PORT);
    connectDB();
})
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //extended: true allows for nested objects in the request body
app.use(express.static("public"));//static is used to store flies like image,pdfs etc in public folder
//public is a folder
app.use(cookieParser()); //cookie-parser is used to access cookies from the user's browser and perform curd operations on them
//only server can read and remove cookies

//routes import
import userRouter from "./routes/user.routes.js";

//routes diclaration
app.use("/api/v1/users", userRouter)

export { app };
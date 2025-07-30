import express from "express"
import dotenv from "dotenv"
import routes from "./routes"
import cors from "cors"

dotenv.config();

const app=express()

app.use(cors({
  origin: "http://localhost:5173", 
}));


app.use(express.json());
app.use("/api",routes)

const PORT=process.env.PORT || 5678;
app.listen(PORT,()=>console.log(`running on ${PORT}`))

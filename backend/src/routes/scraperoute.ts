import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());

app.post("/api/check-availability", async (req, res) => {
  const { lat, lng } = req.body;
  
  try {
    const { data } = await axios.get(`https://api.rapido.com/nearby?lat=${lat}&lng=${lng}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Authorization": "Bearer YOUR_AUTH_TOKEN_IF_REQUIRED"
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
export default app;
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const clientId = "bd8d25dac6e248f7b86fad927ae5879a";
const clientSecret = "YOUR_CLIENT_SECRET";
const redirectUri = "http://localhost:3000/callback";

app.get("/api/token", async (req, res) => {
    const code = req.query.code;

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
    });

    const data = await response.json();
    res.json(data);
});

app.listen(5000, () => console.log("Server running"));
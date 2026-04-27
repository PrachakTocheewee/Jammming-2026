import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001

// ✅ test route
app.get('/', (req, res) => {
    res.send('Server is working!')
})

/*
========================================
🎧 Spotify API
========================================
*/

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

let accessToken = ''

// 🔑 ขอ token ใหม่ทุกครั้ง (กันพัง)
const getAccessToken = async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization':
                'Basic ' +
                Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })

    const data = await response.json()

    console.log('🔑 TOKEN RESPONSE:', data)

    accessToken = data.access_token
}

// 🔍 search endpoint
app.get('/search', async (req, res) => {
    const query = req.query.q

    try {
        // ✅ ขอ token ใหม่ทุกครั้ง (แก้ปัญหา 401 / empty)
        await getAccessToken()

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        const data = await response.json()

        console.log('🔥 SPOTIFY DATA:', JSON.stringify(data, null, 2))

        res.json(data.tracks?.items || [])
    } catch (error) {
        console.error('❌ ERROR:', error)
        res.status(500).json([])
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
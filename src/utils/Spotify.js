const clientId = "43ae679652474f76819431e38e322c03";
const redirectUri = window.location.href.includes('localhost')
    ? "http://localhost:5173/"
    : "https://spotify-jammming-olive.vercel.app/";

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // ตรวจสอบว่ามี access token ใน URL หรือไม่
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            // ล้าง token เมื่อหมดอายุ
            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
            // ล้าง parameter ออกจาก URL เพื่อความเป็นระเบียบ
            window.history.pushState("Access Token", null, "/");
            return accessToken;
        } else {
            // ถ้าไม่มี token ให้พาผู้ใช้ไปหน้า Login ของ Spotify
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location = accessUrl;
        }
    },

    async search(term) {
        const token = Spotify.getAccessToken();
        // แก้ไข URL เป็น v1/search และระบุ type=track
        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const jsonResponse = await response.json();
        if (!jsonResponse.tracks) {
            return [];
        }

        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));
    },

    async savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            return;
        }

        const token = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        let userId;

        // 1. ดึง User ID ของเรามาก่อน
        const userRes = await fetch("https://api.spotify.com/v1/me", { headers: headers });
        const userJson = await userRes.json();
        userId = userJson.id;

        // 2. สร้าง Playlist ใหม่ในบัญชีของเรา
        const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ name: name })
        });
        const playlistJson = await createRes.json();
        const playlistId = playlistJson.id;

        // 3. เพิ่มเพลงเข้าไปใน Playlist ที่เพิ่งสร้าง
        return await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ uris: trackUris })
        });
    }
};

export default Spotify;
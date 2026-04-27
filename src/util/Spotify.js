const clientId = "43ae679652474f76819431e38e322c03";
const redirectUri = "https://spotify-jammming-olive.vercel.app/";

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
            window.history.pushState("Access Token", null, "/");
            return accessToken;
        } else {
            // แก้ไข: ต้องใช้ URL จริงของ Spotify (accounts.spotify.com)
            // และต้องใช้เครื่องหมาย ` (Backtick) พร้อมกับ ${clientId} เท่านั้น
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location = accessUrl;
        }
    },

    async search(term) {
        const token = Spotify.getAccessToken();
        if (!token) return [];

        // แก้ไข: ใช้ API ของ Spotify จริงๆ (api.spotify.com)
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

        const userRes = await fetch("https://api.spotify.com/v1/me", { headers: headers });
        const userJson = await userRes.json();
        userId = userJson.id;

        const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ name: name })
        });
        const playlistJson = await createRes.json();
        const playlistId = playlistJson.id;

        return await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ uris: trackUris })
        });
    }
};

export default Spotify;
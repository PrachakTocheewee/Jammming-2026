const clientId = "b2592ea953504e46bafdef956d077f24";
// ปรับเป็นพอร์ต 5173 ตามหน้าจอของคุณ
const redirectUri = window.location.href.includes('localhost')
    ? "http://localhost:5173/"
    : "https://jammming-prachak-2026.surge.sh/";

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) return accessToken;

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
            window.history.pushState("Access Token", null, "/");
            return accessToken;
        } else {
            // ใส่ response_type=token เพื่อใช้ Implicit Grant แบบเดิม
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location = accessUrl;
        }
    },

    async search(term) {
        const token = Spotify.getAccessToken();
        if (!token) return [];

        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jsonResponse = await response.json();
        if (!jsonResponse.tracks) return [];
        return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));
    },

    async savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) return;
        const token = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await fetch("https://api.spotify.com/v1/me", { headers: headers });
        const userJson = await userRes.json();
        const userId = userJson.id;

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
const clientId = "bd8d25dac6e248f7b86fad927ae5879a"
const redirectUri = "https://spotify-jammming-olive.vercel.app";

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // Check URL for access token
        const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (tokenMatch && expiresMatch) {
            accessToken = tokenMatch[1];
            const expiresIn = Number(expiresMatch[1]);

            // Clear token after expiry
            window.setTimeout(() => (accessToken = ""), expiresIn * 1000);

            // Clear URL
            window.history.pushState("Access Token", null, "/");

            return accessToken;
        }

        // Redirect to Spotify authorization
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

        window.location = authUrl;
    },

    async search(term) {
        const token = Spotify.getAccessToken();

        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((jsonResponse) => {
                if (!jsonResponse.tracks) return [];

                return jsonResponse.tracks.items.map((track) => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri,
                }));
            });
    },

    async savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) return;

        const token = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        let userId;

        return fetch("https://api.spotify.com/v1/me", { headers })
            .then((res) => res.json())
            .then((json) => {
                userId = json.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                    headers,
                    method: "POST",
                    body: JSON.stringify({ name }),
                });
            })
            .then((res) => res.json())
            .then((json) => {
                const playlistId = json.id;
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                    headers,
                    method: "POST",
                    body: JSON.stringify({ uris: trackUris }),
                });
            });
    },
};

export default Spotify;
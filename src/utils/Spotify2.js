// TODO: Get Client ID from https://developer.spotify.com/dashboard/ and put it here
const clientId = "43ae679652474f76819431e38e322c03";

// แก้ไข redirectUri ให้ตรงกับที่ใช้รันจริง (Vite มักใช้ 5173)
const redirectUri = "http://127.0.0.1:5173/";

// แก้ไข URL: เพิ่ม response_type=token และ scope เพื่อให้ระบบยอมรับการทำงาน
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

let accessToken;

const Spotify2 = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // ตรวจสอบ access token จาก URL hash
    const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

    if (urlAccessToken && urlExpiresIn) {
      accessToken = urlAccessToken[1];
      const expiresIn = Number(urlExpiresIn[1]);

      // ตั้งเวลาล้าง token เมื่อหมดอายุ
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);

      // ล้าง URL เพื่อความปลอดภัยและสวยงาม
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      // ถ้าไม่มี token ให้ส่งไปหน้า Login ของ Spotify
      window.location = spotifyUrl;
    }
  },

  search(term) {
    const token = Spotify2.getAccessToken(); // ดึง token ก่อนเริ่มค้นหา
    if (!token) return Promise.resolve([]);

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.json())
      .then(jsonResponse => {
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
      });
  },

  savePlaylist(name, trackUris) {
    // แก้เงื่อนไข: ถ้าไม่มีชื่อ หรือ ไม่มีเพลง (trackUris ว่าง) ให้หยุดทำงาน
    if (!name || !trackUris || trackUris.length === 0) {
      return Promise.resolve();
    }

    const token = Spotify2.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    let userId;

    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name })
        });
      })
      .then(response => response.json())
      .then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ uris: trackUris })
        });
      });
  }
};

export default Spotify2;
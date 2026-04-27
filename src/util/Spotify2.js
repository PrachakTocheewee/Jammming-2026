// TODO: Get Client ID from https://developer.spotify.com/dashboard/
const clientId = "43ae679652474f76819431e38e322c03";

// ต้องตรงกับที่ตั้งไว้ใน Spotify Developer Dashboard และที่รันในเครื่อง (Vite คือ 5173)
const redirectUri = "http://127.0.0.1:5173/";

// แก้ไข URL: เพิ่ม response_type=token และ scope เพื่อให้บันทึก Playlist ได้จริง
// บรรทัดนี้ต้องเป๊ะทุกตัวอักษรครับ
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

let accessToken;

const Spotify2 = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // ตรวจสอบ access token จาก URL หลังจากการ Login
    const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

    if (urlAccessToken && urlExpiresIn) {
      accessToken = urlAccessToken[1];
      const expiresIn = Number(urlExpiresIn[1]);

      // ตั้งเวลาล้าง token เมื่อหมดอายุ
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);

      // ล้าง URL เพื่อความปลอดภัยและลบพารามิเตอร์ที่รกหน้าจอ
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      // ถ้าไม่มี token ให้เด้งไปหน้า Login ของ Spotify ทันที
      window.location = spotifyUrl;
    }
  },

  search(term) {
    const token = Spotify2.getAccessToken();
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
    // แก้เงื่อนไข: ต้องมีชื่อ และ มีเพลง ถึงจะทำงาน (ของเดิมเขียนสลับกัน)
    if (!name || !trackUris || trackUris.length === 0) {
      return Promise.resolve();
    }

    const token = Spotify2.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    let userId;

    // 1. ดึง User ID ของเราก่อน
    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userId = jsonResponse.id;
        // 2. สร้าง Playlist ใหม่ใน Account ของเรา
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name })
        });
      })
      .then(response => response.json())
      .then(jsonResponse => {
        const playlistId = jsonResponse.id;
        // 3. เพิ่มเพลงลงใน Playlist ที่เพิ่งสร้าง
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ uris: trackUris })
        });
      });
  }
};

// จุดที่ทำให้หน้าขาว (จากรูป Console ของคุณ) คือขาดบรรทัดนี้ครับ
export default Spotify2;
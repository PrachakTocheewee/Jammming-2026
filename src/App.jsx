import React, { useState, useEffect } from 'react'
import './App.css'
import SearchBar from './components/SearchBar/SearchBar'
import SearchResults from './components/SearchResults/SearchResults'
import Playlist from './components/Playlist/Playlist'
import Spotify2 from './utils/Spotify2'
import ReactGA from 'react-ga4'

// Initialize GA4 ด้วย ID ของคุณ
ReactGA.initialize('G-2WGTN5Q4ZX')

function App() {
  const [searchResults, setSearchResults] = useState([])
  const [playlistName, setPlaylistName] = useState('New Playlist')
  const [playlistTracks, setPlaylistTracks] = useState([])

  useEffect(() => {
    // ส่งข้อมูล Pageview ทุกครั้งที่โหลดหน้าเว็บ
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname })

    // ตรวจสอบ Token ตั้งแต่เริ่มโหลดแอปฯ เพื่อลดปัญหาหน้าขาว
    Spotify2.getAccessToken()
  }, [])

  const addTrack = (track) => {
    if (playlistTracks.find((savedTrack) => savedTrack.id === track.id)) {
      return
    }
    setPlaylistTracks([...playlistTracks, track])
  }

  const removeTrack = (track) => {
    setPlaylistTracks(
      playlistTracks.filter((savedTrack) => savedTrack.id !== track.id),
    )
  }

  const updatePlaylistName = (name) => {
    setPlaylistName(name)
  }

  const savePlaylist = () => {
    const trackUris = playlistTracks.map((track) => track.uri)
    Spotify2.savePlaylist(playlistName, trackUris).then(() => {
      setPlaylistName('New Playlist')
      setPlaylistTracks([])
    })
  }

  const search = (term) => {
    Spotify2.search(term).then((results) => {
      setSearchResults(results)
    })
  }

  return (
    <div>
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </div>
  )
}

export default App

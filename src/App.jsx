// App.jsx (fix: handle search + remove "response_type must be code" error)

import { useState } from 'react'
import './App.css'

export default function App() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async () => {
    if (!term) return

    try {
      // 🔴 IMPORTANT: replace with your backend or Spotify API later
      // temporary mock data so UI works
      const mockResults = [
        { id: 1, name: 'Song 1', artist: 'Artist A', album: 'Album X' },
        { id: 2, name: 'Song 2', artist: 'Artist B', album: 'Album Y' },
      ]

      setResults(mockResults)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Jammming</h1>
      </header>

      <div className="search-section">
        <input
          type="text"
          placeholder="Enter A Song, Album, or Artist"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button onClick={handleSearch}>SEARCH</button>
      </div>

      <div className="container">
        <div className="results">
          <h2>Results</h2>

          {results.length === 0 ? (
            <p>No results</p>
          ) : (
            results.map((track) => (
              <div key={track.id} className="track">
                <h3>{track.name}</h3>
                <p>
                  {track.artist} | {track.album}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="playlist">
          <h2>New Playlist</h2>
          <button>SAVE TO SPOTIFY</button>
        </div>
      </div>
    </div>
  )
}

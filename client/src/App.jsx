import { useState } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query) return

    setLoading(true)
    setError('')
    setTracks([])

    try {
      const res = await fetch(
        `http://localhost:3001/search?q=${encodeURIComponent(query)}`,
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Server error')
      }

      setTracks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🎧 Spotify Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search song..."
        style={{ padding: 10, width: 250 }}
      />

      <button onClick={search} style={{ marginLeft: 10, padding: 10 }}>
        Search
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        {tracks.map((track) => (
          <div key={track.id} style={{ marginBottom: 20 }}>
            <img src={track.album?.images?.[0]?.url} width="100" alt="" />
            <div>
              <b>{track.name}</b>
              <p>{track.artists?.[0]?.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

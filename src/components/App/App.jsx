import React from 'react'
import './App.css'
import SearchBar from '../SearchBar/SearchBar'
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist'
import Spotify from '../../util/Spotify' // ถอย 2 ชั้น (../../) เพื่อออกไปหาโฟลเดอร์ util

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: [],
    }

    this.addTrack = this.addTrack.bind(this)
    this.removeTrack = this.removeTrack.bind(this)
    this.updatePlaylistName = this.updatePlaylistName.bind(this)
    this.savePlaylist = this.savePlaylist.bind(this)
    this.search = this.search.bind(this)
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks
    if (tracks.find((savedTrack) => savedTrack.id === track.id)) return
    this.setState({ playlistTracks: [...tracks, track] })
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks
    tracks = tracks.filter((currentTrack) => currentTrack.id !== track.id)
    this.setState({ playlistTracks: tracks })
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name })
  }

  savePlaylist() {
    const trackUris = this.state.playlistTracks.map((track) => track.uri)
    if (!trackUris.length) {
      alert('Please add some tracks first!')
      return
    }

    Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
      alert('Successfully saved to Spotify!')
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: [],
      })
    })
  }

  search(term) {
    Spotify.search(term).then((results) => {
      this.setState({ searchResults: results })
    })
  }

  render() {
    return (
      <div>
        <h1>
          Ja<span className="highlight">mmm</span>ing
        </h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
            />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default App

const Track = ({ track, onAdd, onRemove }) => {
  return (
    <div>
      <p>
        {track.name} - {track.artist}
      </p>

      {onAdd && <button onClick={() => onAdd(track)}>+</button>}
      {onRemove && <button onClick={() => onRemove(track)}>-</button>}
    </div>
  )
}

export default Track

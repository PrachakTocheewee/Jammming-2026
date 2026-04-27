import React from 'react'
import ReactDOM from 'react-dom/client'
// แก้ไข Path จาก './App.jsx' เป็น './components/App/App'
import App from './components/App/App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

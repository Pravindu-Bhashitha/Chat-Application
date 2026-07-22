
import './App.css'
import { SocketProvider } from './context/SocketContext'
import Router from './router/router'

function App() {

  return (
    <>
      <SocketProvider>
        <Router />
      </SocketProvider>
    </>
  )
}

export default App

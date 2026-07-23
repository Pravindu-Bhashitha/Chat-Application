
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Router from './router/router'

function App() {

  return (
    <>
      <AuthProvider>
        <SocketProvider>
          <Router />
        </SocketProvider>
      </AuthProvider>
    </>
  )
}

export default App

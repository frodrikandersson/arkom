import { Route, Routes, useLocation } from 'react-router-dom'
import { StackHandler, useUser } from '@stackframe/react'
import { stackClientApp } from './stack'
import { useState } from 'react'

function HandlerRoutes() {
  const location = useLocation()
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />
}

function Home() {
  const user = useUser()
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Arkom</h1>
      <p>Art showcase platform</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {user ? (
        <div>
          <p>Welcome, {user.displayName || user.primaryEmail}!</p>
          <button onClick={() => stackClientApp.signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <a href="/handler/sign-in">Sign In</a>
          {' | '}
          <a href="/handler/sign-up">Sign Up</a>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/handler/*" element={<HandlerRoutes />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
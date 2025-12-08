import { StackHandler, StackProvider, StackTheme, useUser } from '@stackframe/react'
import { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { stackClientApp } from './stack'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function HandlerRoutes() {
  const location = useLocation()
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />
}

function Home() {
  const user = useUser()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Fetch current count
      fetch(`${API_URL}/api/counter/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setCount(data.count)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch count:', err)
          setLoading(false)
        })
    }
  }, [user])

  const handleIncrement = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`${API_URL}/api/counter/${user.id}/increment`, {
        method: 'POST',
      })
      const data = await res.json()
      setCount(data.count)
    } catch (err) {
      console.error('Failed to increment:', err)
    }
  }

  return (
    <div className="app">
      <h1>Arkom</h1>
      <p>Art showcase platform</p>
      
      {user ? (
        <div>
          <p>Welcome, {user.displayName || user.primaryEmail}!</p>
          <div>
            <button onClick={handleIncrement}>
              {loading ? 'Loading...' : `Count: ${count}`}
            </button>
          </div>
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

export default function App() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Routes>
              <Route path="/handler/*" element={<HandlerRoutes />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  )
}
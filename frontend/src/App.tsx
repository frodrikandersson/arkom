import { StackHandler, StackProvider, StackTheme, useUser } from '@stackframe/react'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { stackClientApp } from './stack'

function HandlerRoutes() {
  const location = useLocation()
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />
}

function Home() {
  const user = useUser()

  return (
    <div className="app">
      <h1>Arkom</h1>
      <p>Art showcase platform</p>
      
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
import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      
      <h1 className="rubik-vinyl-regular">Arkom</h1>
      <p>Art showcase platform</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      
      <SignedIn>
        <UserButton />
        <p>Welcome! You're signed in.</p>
      </SignedIn>
    </div>
  )
}

export default App
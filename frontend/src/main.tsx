import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StackProvider, StackTheme } from '@stackframe/react'
import { stackClientApp } from './stack'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <App />
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
)
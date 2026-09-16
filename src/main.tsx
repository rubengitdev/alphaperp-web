import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { WalletContextProvider } from './providers/WalletContextProvider.tsx'
import { NetworkProvider } from './contexts/NetworkContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NetworkProvider>
        <WalletContextProvider>
          <App />
        </WalletContextProvider>
      </NetworkProvider>
    </BrowserRouter>
  </StrictMode>,
)

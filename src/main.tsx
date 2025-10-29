import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import "./lib/i18n"
import { AuthProvider } from "./providers/AuthProvider"

// Import the mock service worker in development
if (import.meta.env.DEV) {
  import('./mocks/browser')
    .then(() => {
      console.log('Mock service worker started')
    })
    .catch(err => {
      console.error('Failed to start mock service worker:', err)
    });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

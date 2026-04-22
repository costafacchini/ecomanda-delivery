import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import './custom.scss'
import './index.css'
import { AppContextProvider } from './contexts/App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
);

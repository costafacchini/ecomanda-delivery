import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import 'bootstrap/dist/js/bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './custom.scss'
import './index.css'
import { AppContextProvider } from './contexts/App'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <I18nextProvider i18n={i18n}>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </I18nextProvider>
);

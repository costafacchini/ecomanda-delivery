import React from 'react'
import './App.css'
import RootRoutes from './pages/routes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer />
      <RootRoutes />
    </>
  )
}

export default App

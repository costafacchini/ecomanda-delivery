import React from 'react'
import { Route, Routes } from 'react-router'
import MessagesIndex from './scenes/Index'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { useApp } from '../../contexts/App'

function MessagesRoutes() {
  const { currentUser } = useApp()

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path='/' element={<MessagesIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default MessagesRoutes

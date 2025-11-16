import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import MessagesIndex from './scenes/Index'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { AppContext } from '../../contexts/App'

function MessagesRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path='/' element={<MessagesIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default MessagesRoutes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MessagesIndex from './scenes/Index'
import { useSelector } from 'react-redux'

function MessagesRoutes() {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <Routes>
      <Route path='/' element={<MessagesIndex loggedUser={loggedUser} />} />
    </Routes>
  )
}

export default MessagesRoutes

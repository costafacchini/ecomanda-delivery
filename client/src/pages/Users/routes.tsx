import React from 'react'
import { Route, Routes } from 'react-router'
import UsersIndex from './scenes/Index'
import UserNew from './scenes/New'
import UserEdit from './scenes/Edit'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { useApp } from '../../contexts/App'

function UsersRoutes() {
  const { currentUser } = useApp()

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path="/new" element={<UserNew currentUser={currentUser} />} />
        <Route path=":id" element={<UserEdit currentUser={currentUser} />} />
        <Route path="/" element={<UsersIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default UsersRoutes

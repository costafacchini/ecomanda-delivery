import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import UsersIndex from './scenes/Index'
import UserNew from './scenes/New'
import UserEdit from './scenes/Edit'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { AppContext } from '../../contexts/App'

function UsersRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path="/new" element={<UserNew currentUser={currentUser} />} />
        <Route path=":id" element={<UserEdit currentUser={currentUser} />} />
        <Route exact path="/" element={<UsersIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default UsersRoutes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import UsersIndex from './scenes/Index'
import UserNew from './scenes/New'
import UserEdit from './scenes/Edit'
import { useSelector } from 'react-redux'

function UsersRoutes() {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <Routes>
      <Route path="/new" element={<UserNew loggedUser={loggedUser} />} />
      <Route path=":id" element={<UserEdit loggedUser={loggedUser} />} />
      <Route exact path="/" element={<UsersIndex loggedUser={loggedUser} />} />
    </Routes>
  )
}

export default UsersRoutes

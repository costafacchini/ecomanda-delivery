import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import UsersIndex from './scenes/Index'
import UserNew from './scenes/New'
import UserEdit from './scenes/Edit'
import { LicenseeContextProvider } from '../../contexts/Licensees'
import { AppContext } from '../../contexts/App'

function UsersRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <LicenseeContextProvider>
      <Routes>
        <Route path="/new" element={<UserNew currentUser={currentUser} />} />
        <Route path=":id" element={<UserEdit currentUser={currentUser} />} />
        <Route exact path="/" element={<UsersIndex currentUser={currentUser} />} />
      </Routes>
    </LicenseeContextProvider>
  )
}

export default UsersRoutes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ContactsIndex from './scenes/Index'
import ContactNew from './scenes/New'
import ContactEdit from './scenes/Edit'
import { useSelector } from 'react-redux'

function ContactsRoutes() {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <Routes>
      <Route path="/new" element={<ContactNew loggedUser={loggedUser} />} />
      <Route path=":id" element={<ContactEdit loggedUser={loggedUser} />} />
      <Route path="/" element={<ContactsIndex loggedUser={loggedUser} />} />
    </Routes>
  )
}

export default ContactsRoutes

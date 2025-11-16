import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import ContactsIndex from './scenes/Index'
import ContactNew from './scenes/New'
import ContactEdit from './scenes/Edit'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { AppContext } from '../../contexts/App'

function ContactsRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path="/new" element={<ContactNew currentUser={currentUser} />} />
        <Route path=":id" element={<ContactEdit currentUser={currentUser} />} />
        <Route path="/" element={<ContactsIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default ContactsRoutes

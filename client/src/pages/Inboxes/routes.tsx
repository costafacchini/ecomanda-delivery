import React from 'react'
import { Route, Routes } from 'react-router'
import InboxesIndex from './scenes/Index'
import InboxNew from './scenes/New'
import InboxEdit from './scenes/Edit'
import { useApp } from '../../contexts/App'

function InboxesRoutes() {
  const { currentUser } = useApp()

  return (
    <Routes>
      <Route path='/new' element={<InboxNew currentUser={currentUser} />} />
      <Route path=':id/edit' element={<InboxEdit currentUser={currentUser} />} />
      <Route path='/' element={<InboxesIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default InboxesRoutes

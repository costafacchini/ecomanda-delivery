import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import SetoresIndex from './scenes/Index'
import SetorNew from './scenes/New'
import SetorEdit from './scenes/Edit'
import { AppContext } from '../../contexts/App'

function SetoresRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <Routes>
      <Route path='/new' element={<SetorNew currentUser={currentUser} />} />
      <Route path=':id/edit' element={<SetorEdit currentUser={currentUser} />} />
      <Route path='/' element={<SetoresIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default SetoresRoutes

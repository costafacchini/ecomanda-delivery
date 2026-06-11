import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import SectorsIndex from './scenes/Index'
import SectorNew from './scenes/New'
import SectorEdit from './scenes/Edit'
import { AppContext } from '../../contexts/App'

function SectorsRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <Routes>
      <Route path='/new' element={<SectorNew currentUser={currentUser} />} />
      <Route path=':id/edit' element={<SectorEdit currentUser={currentUser} />} />
      <Route path='/' element={<SectorsIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default SectorsRoutes

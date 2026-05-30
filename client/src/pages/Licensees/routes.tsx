import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import LicenseesIndex from './scenes/Index'
import LicenseeNew from './scenes/New'
import LicenseeEdit from './scenes/Edit'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { AppContext } from '../../contexts/App'

function LicenseesRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path='/new' element={<LicenseeNew currentUser={currentUser} />} />
        <Route path=':id' element={<LicenseeEdit currentUser={currentUser} />} />
        <Route exact path='/' element={<LicenseesIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default LicenseesRoutes

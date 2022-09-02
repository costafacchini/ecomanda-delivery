import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LicenseesIndex from './scenes/Index'
import LicenseeNew from './scenes/New'
import LicenseeEdit from './scenes/Edit'
import { LicenseeContextProvider } from '../../contexts/Licensees'

function LicenseesRoutes() {
  return (
    <LicenseeContextProvider>
      <Routes>
        <Route path="/new" element={<LicenseeNew />} />
        <Route path=":id" element={<LicenseeEdit />} />
        <Route exact path="/" element={<LicenseesIndex />} />
      </Routes>
    </LicenseeContextProvider>
  )
}

export default LicenseesRoutes

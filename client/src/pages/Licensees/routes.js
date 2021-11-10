import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LicenseesIndex from './scenes/Index'
import LicenseeNew from './scenes/New'
import LicenseeEdit from './scenes/Edit'

function LicenseesRoutes() {
  return (
    <Routes>
      <Route path="/new" element={<LicenseeNew />} />
      <Route path=":id" element={<LicenseeEdit />} />
      <Route exact path="/" element={<LicenseesIndex />} />
    </Routes>
  )
}

export default LicenseesRoutes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BillingIndex from './Billing/scenes/Index'

function ReportsRoutes() {
  return (
    <Routes>
      <Route path='/billing' element={<BillingIndex />} />
    </Routes>
  )
}

export default ReportsRoutes

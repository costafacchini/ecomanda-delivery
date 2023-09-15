import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import BillingIndex from './Billing/scenes/Index'
import IntegrationlogIndex from './Integrationlog/scenes/Index'
import { AppContext } from '../../contexts/App'

function ReportsRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <Routes>
      <Route path='/billing' element={<BillingIndex />} />
      <Route path='/integrationlog' element={<IntegrationlogIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default ReportsRoutes

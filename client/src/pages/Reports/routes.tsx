import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import BillingIndex from './Billing/scenes/Index'
import IntegrationlogIndex from './Integrationlog/scenes/Index'
import MessageIndex from './Message/scenes/Index'
import { AppContext } from '../../contexts/App'

function ReportsRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <Routes>
      <Route path='/billing' element={<BillingIndex />} />
      <Route path='/integrationlog' element={<IntegrationlogIndex currentUser={currentUser} />} />
      <Route path='/message' element={<MessageIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default ReportsRoutes

import React from 'react'
import { Route, Routes } from 'react-router'
import MessageIndex from './Message/scenes/Index'

function ReportsRoutes() {
  return (
    <Routes>
      <Route path='/message' element={<MessageIndex />} />
    </Routes>
  )
}

export default ReportsRoutes

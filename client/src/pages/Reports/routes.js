import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ReportsIndex from './scenes/Index'

function ReportsRoutes() {
  return (
    <Routes>
      <Route exact path='/' element={<ReportsIndex />} />
    </Routes>
  )
}

export default ReportsRoutes

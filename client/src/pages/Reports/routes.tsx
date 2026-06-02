import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import MessageIndex from './Message/scenes/Index'
import { AppContext } from '../../contexts/App'

function ReportsRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <Routes>
      <Route path='/message' element={<MessageIndex currentUser={currentUser} />} />
    </Routes>
  )
}

export default ReportsRoutes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TriggersIndex from './scenes/Index'
import TriggerNew from './scenes/New'
import TriggerEdit from './scenes/Edit'
import { useSelector } from 'react-redux'

function TriggersRoutes() {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <Routes>
      <Route path="/new" element={<TriggerNew loggedUser={loggedUser} />} />
      <Route path=":id" element={<TriggerEdit loggedUser={loggedUser} />} />
      <Route path="/" element={<TriggersIndex loggedUser={loggedUser} />} />
    </Routes>
  )
}

export default TriggersRoutes

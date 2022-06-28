import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TemplatesIndex from './scenes/Index'
import TemplateShow from './scenes/Show'
import { useSelector } from 'react-redux'

function TemplatesRoutes() {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <Routes>
      <Route path=':id' element={<TemplateShow loggedUser={loggedUser} />} />
      <Route path='/' element={<TemplatesIndex loggedUser={loggedUser} />} />
    </Routes>
  )
}

export default TemplatesRoutes

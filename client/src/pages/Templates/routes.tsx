import React, { useContext } from 'react'
import { Route, Routes } from 'react-router'
import TemplatesIndex from './scenes/Index'
import TemplateShow from './scenes/Show'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { AppContext } from '../../contexts/App'

function TemplatesRoutes() {
  const { currentUser } = useContext(AppContext)

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path=':id' element={<TemplateShow currentUser={currentUser} />} />
        <Route path='/' element={<TemplatesIndex currentUser={currentUser} />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default TemplatesRoutes

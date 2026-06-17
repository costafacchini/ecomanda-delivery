import React from 'react'
import { Route, Routes } from 'react-router'
import TriggersIndex from './scenes/Index'
import TriggerNew from './scenes/New'
import TriggerEdit from './scenes/Edit'
import TriggerImportation from './scenes/Importation'
import { SimpleCrudContextProvider } from '../../contexts/SimpleCrud'
import { useApp } from '../../contexts/App'

function TriggersRoutes() {
  const { currentUser } = useApp()

  return (
    <SimpleCrudContextProvider>
      <Routes>
        <Route path='/new' element={<TriggerNew currentUser={currentUser} />} />
        <Route path=':id' element={<TriggerEdit currentUser={currentUser} />} />
        <Route path='/' element={<TriggersIndex currentUser={currentUser} />} />
        <Route path=':id/importation' element={<TriggerImportation />} />
      </Routes>
    </SimpleCrudContextProvider>
  )
}

export default TriggersRoutes

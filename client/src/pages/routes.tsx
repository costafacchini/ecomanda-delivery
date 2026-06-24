import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HashRouter, Route, Routes } from 'react-router'
import i18n from '../i18n'
import SignIn from './SignIn'
import LicenseesRoutes from './Licensees/routes'
import UsersRoutes from './Users/routes'
import SectorsRoutes from './Sectors/routes'
import ContactsRoutes from './Contacts/routes'
import TriggersRoutes from './Triggers/routes'
import TemplatesRoutes from './Templates/routes'
import MessagesRoutes from './Messages/routes'
import ReportsRoutes from './Reports/routes'
import Dashboard from './Dashboard'
import ChatPage from './Chat'
import { isAuthenticated, fetchLoggedUser } from '../services/auth'
import BaseLayout from './BaseLayout/index'
import PrivateRoute from './PrivateRoute/index'
import { useApp } from '../contexts/App'

function NotFoundPage() {
  const { t } = useTranslation()
  return <h1>{t('navbar.notFound')}</h1>
}

function RootRoutes() {
  const { currentUser, setCurrentUser } = useApp()

  useEffect(() => {
    if (isAuthenticated() && !currentUser) {
      fetchLoggedUser().then(user => {
        setCurrentUser(user ?? undefined)
        if (user?.language) i18n.changeLanguage(user.language)
      })
    }
  }, [currentUser, setCurrentUser])

  return (
    <HashRouter>
      <Routes>
        <Route
          path='/'
          element={
            <PrivateRoute redirectTo='/signin'>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path='/signin' element={<SignIn />} />
        <Route
          path='/licensees/*'
          element={
            <PrivateRoute redirectTo='/'>
              <LicenseesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/users/*'
          element={
            <PrivateRoute redirectTo='/'>
              <UsersRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/sectors/*'
          element={
            <PrivateRoute redirectTo='/'>
              <SectorsRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/contacts/*'
          element={
            <PrivateRoute redirectTo='/'>
              <ContactsRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/triggers/*'
          element={
            <PrivateRoute redirectTo='/'>
              <TriggersRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/templates/*'
          element={
            <PrivateRoute redirectTo='/'>
              <TemplatesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/messages/*'
          element={
            <PrivateRoute redirectTo='/'>
              <MessagesRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/reports/*'
          element={
            <PrivateRoute redirectTo='/'>
              <ReportsRoutes />
            </PrivateRoute>
          }
        />
        <Route
          path='/chat'
          element={
            <PrivateRoute redirectTo='/signin' noLayout>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path='*'
          element={
            <BaseLayout>
              <NotFoundPage />
            </BaseLayout>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default RootRoutes

import React from 'react'
import { Navigate } from 'react-router'
import BaseLayout from '../BaseLayout/index'
import { isAuthenticated } from '../../services/auth'

export default function PrivateRoute({ children, redirectTo }) {
  return isAuthenticated() ? (
    <BaseLayout>
      {children}
    </BaseLayout>
  ) : ( <Navigate to={redirectTo} /> )
}
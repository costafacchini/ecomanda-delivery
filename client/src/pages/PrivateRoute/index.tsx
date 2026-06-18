import React, { ReactNode } from 'react'
import { Navigate } from 'react-router'
import BaseLayout from '../BaseLayout/index'
import { isAuthenticated } from '../../services/auth'

interface PrivateRouteProps {
  children: ReactNode
  redirectTo: string
  noLayout?: boolean
}

export default function PrivateRoute({ children, redirectTo, noLayout }: PrivateRouteProps) {
  if (!isAuthenticated()) return <Navigate to={redirectTo} />
  if (noLayout) return <>{children}</>
  return <BaseLayout>{children}</BaseLayout>
}

import { combineReducers } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import billingIndex from '../pages/Reports/Billing/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  reports: combineReducers({
    billingIndex,
  })
}

export default combinedReducers

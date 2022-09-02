import { combineReducers } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import messagesIndex from '../pages/Messages/scenes/Index/slice'
import billingIndex from '../pages/Reports/Billing/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  messagesIndex,
  reports: combineReducers({
    billingIndex,
  })
}

export default combinedReducers

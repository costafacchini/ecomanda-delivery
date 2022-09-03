import { configureStore, combineReducers } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import billingIndex from '../pages/Reports/Billing/scenes/Index/slice'

export default configureStore({
  reducer: {
    signin: signinReducer,
    reports: combineReducers({
      billingIndex,
    })
  }
})

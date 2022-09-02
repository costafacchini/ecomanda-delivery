import { configureStore, combineReducers } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import messagesIndex from '../pages/Messages/scenes/Index/slice'
import billingIndex from '../pages/Reports/Billing/scenes/Index/slice'
import templatesIndex from '../pages/Templates/scenes/Index/slice'

export default configureStore({
  reducer: {
    signin: signinReducer,
    templatesIndex,
    messagesIndex,
    reports: combineReducers({
      billingIndex,
    })
  }
})

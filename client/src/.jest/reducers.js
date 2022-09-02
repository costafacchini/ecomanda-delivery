import { combineReducers } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import contactsIndex from '../pages/Contacts/scenes/Index/slice'
import triggersIndex from '../pages/Triggers/scenes/Index/slice'
import messagesIndex from '../pages/Messages/scenes/Index/slice'
import billingIndex from '../pages/Reports/Billing/scenes/Index/slice'
import templatesIndex from '../pages/Templates/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  contactsIndex,
  triggersIndex,
  templatesIndex,
  messagesIndex,
  reports: combineReducers({
    billingIndex,
  })
}

export default combinedReducers

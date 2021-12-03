import { configureStore } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'
import contactsIndex from '../pages/Contacts/scenes/Index/slice'
import triggersIndex from '../pages/Triggers/scenes/Index/slice'

export default configureStore({
  reducer: {
    signin: signinReducer,
    licenseesIndex,
    contactsIndex,
    triggersIndex,
  }
})

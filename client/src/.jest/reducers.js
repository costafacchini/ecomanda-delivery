import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'
import contactsIndex from '../pages/Contacts/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  licenseesIndex,
  contactsIndex
}

export default combinedReducers

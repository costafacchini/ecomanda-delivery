import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'
import contactsIndex from '../pages/Contacts/scenes/Index/slice'
import messagesIndex from '../pages/Messages/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  licenseesIndex,
  contactsIndex,
  messagesIndex
}

export default combinedReducers

import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'
import contactsIndex from '../pages/Contacts/scenes/Index/slice'
import triggersIndex from '../pages/Triggers/scenes/Index/slice'
import messagesIndex from '../pages/Messages/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  licenseesIndex,
  contactsIndex,
  triggersIndex,
  messagesIndex,
}

export default combinedReducers

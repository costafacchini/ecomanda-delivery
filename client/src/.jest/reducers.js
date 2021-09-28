import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'

const combinedReducers = {
  signin: signinReducer,
  licenseesIndex
}

export default combinedReducers

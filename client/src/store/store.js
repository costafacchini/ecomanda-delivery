import { configureStore } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'
import licenseesIndex from '../pages/Licensees/scenes/Index/slice'

export default configureStore({
  reducer: {
    signin: signinReducer,
    licenseesIndex
  }
})

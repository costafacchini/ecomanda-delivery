import { configureStore } from '@reduxjs/toolkit'
import signinReducer from '../pages/SignIn/slice'

export default configureStore({
  reducer: {
    signin: signinReducer
  }
})

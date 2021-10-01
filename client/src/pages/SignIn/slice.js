import { createSlice } from '@reduxjs/toolkit'

export const signinSlice = createSlice({
  name: 'signin',
  initialState: {
    loggedUser: null,
  },
  reducers: {
    loadLoggedUser: (state, action) => {
      state.loggedUser = action.payload
    }
  }
})

export const { loadLoggedUser } = signinSlice.actions

export default signinSlice.reducer
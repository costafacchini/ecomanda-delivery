import { createSlice } from '@reduxjs/toolkit'

export const slice = createSlice({
  name: 'billingIndex',
  initialState: {
    filters: {},
    licensees: []
  },
  reducers: {
    loadData: (state, action) => {
      state.licensees = action.payload
    }
  },
})

export const { loadData } = slice.actions
export default slice.reducer

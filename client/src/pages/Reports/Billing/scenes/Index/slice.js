import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getBilling } from '../../../../../services/report'

const fetchBilling = createAsyncThunk(
  'users/fetchReportBillingStatus',
  async (filters) => {
    const response = await getBilling(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'billingIndex',
  initialState: {
    filters: {},
    licensees: []
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBilling.fulfilled, (state, action) => {
      state.licensees = action.payload
    })
  }
})

export { fetchBilling }
export default slice.reducer

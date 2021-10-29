import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getReports } from '../../../../services/reports'

const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async () => {
    const response = await getReports()
    return response.data
  }
)

export const slice = createSlice({
  name: 'reports',
  initialState: {
    filters: {},
    reports: []
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchReports.fulfilled, (state, action)=>{
      state.reports = action.payload
    })
  }
})

export { fetchReports }
export default slice.reducer

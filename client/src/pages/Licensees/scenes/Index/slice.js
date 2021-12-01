import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getLicensees } from '../services/licensee'

const fetchLicensees = createAsyncThunk(
  'users/fetchLicenseesStatus',
  async (filters) => {
    const response = await getLicensees(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'licenseesIndex',
  initialState: {
    licensees: [],
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLicensees.fulfilled, (state, action) => {
      state.licensees = action.meta.arg.page === 1 ? action.payload : [...state.licensees, ...action.payload]
    })
  }
})

export { fetchLicensees }
export default slice.reducer

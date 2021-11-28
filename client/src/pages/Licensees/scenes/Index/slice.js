import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getLicensees } from '../services/licensee'

const fetchLicensees = createAsyncThunk(
  'users/fetchByIdStatus',
  async () => {
    const response = await getLicensees()
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
      state.licensees = action.payload
    })
  }
})

export { fetchLicensees }
export default slice.reducer

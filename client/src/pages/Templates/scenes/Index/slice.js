import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getTemplates } from '../../../../services/template'

const fetchTemplates = createAsyncThunk(
  'users/fetchTemplatesStatus',
  async (filters) => {
    const response = await getTemplates(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'templatesIndex',
  initialState: {
    templates: [],
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      state.templates = action.meta.arg.page === 1 ? action.payload : [...state.templates, ...action.payload]
    })
  }
})

export { fetchTemplates }
export default slice.reducer

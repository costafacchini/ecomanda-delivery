import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getTriggers } from '../../../../services/trigger'

const fetchTriggers = createAsyncThunk(
  'users/fetchTriggersStatus',
  async (filters) => {
    const response = await getTriggers(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'triggers',
  initialState: {
    triggers: [],
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchTriggers.fulfilled, (state, action)=>{
      state.triggers = action.meta.arg.page === 1 ? action.payload : [...state.triggers, ...action.payload]
    })
  }
})

export { fetchTriggers }
export default slice.reducer

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMessages } from '../../../../services/message'

const fetchMessages = createAsyncThunk(
  'users/fetchMessagesStatus',
  async (filters) => {
    const response = await getMessages(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'messagesIndex',
  initialState: {
    filters: {},
    messages: []
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchMessages.fulfilled, (state, action)=>{
      state.messages = action.meta.arg.page === 1 ? action.payload : [...state.messages, ...action.payload]
    })
  }
})

export { fetchMessages }
export default slice.reducer

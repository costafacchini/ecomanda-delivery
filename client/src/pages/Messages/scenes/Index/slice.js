import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMessages } from '../../../../services/messages'

const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async () => {
    const response = await getMessages()
    return response.data
  }
)

export const slice = createSlice({
  name: 'messages',
  initialState: {
    filters: {},
    messages: []
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchMessages.fulfilled, (state, action)=>{
      state.messages = action.payload
    })
  }
})

export { fetchMessages }
export default slice.reducer

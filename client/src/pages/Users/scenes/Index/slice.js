import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getUsers } from '../../../../services/user'

const fetchUsers = createAsyncThunk(
  'users/fetchUsersStatus',
  async (filters) => {
    const response = await getUsers(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'usersIndex',
  initialState: {
    users: [],
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchUsers.fulfilled, (state, action)=>{
      state.users = action.meta.arg.page === 1 ? action.payload : [...state.users, ...action.payload]
    })
  }
})

export { fetchUsers }
export default slice.reducer

import reducer, { fetchUsers } from './slice'
import  { createStore } from '../../../../.jest/redux-testing'
import { userFactory } from '../../../../factories/user'
import { getUsers } from '../../../../services/user'

jest.mock('../../../../services/user')

describe('Users slice', () => {
  const initialState = {
    users: [],
  }

  it('has an initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('users/fetchUsersStatus/fulfilled', () => {
    it('dispatches an action to fetch the users', async () => {
      const user = userFactory.build()
      const store = createStore()

      getUsers.mockResolvedValue({ status: 201, data: [user] })

      await store.dispatch(fetchUsers({ page: 1, expression: '' }))

      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'users/fetchUsersStatus/fulfilled',
          payload: [user]
        })
      )
    })

    it('appends the users when the page is not 1', async () => {
      const user1 = userFactory.build()
      const user2 = userFactory.build()

      expect(
        reducer(
          { ...initialState, users: [] },
          fetchUsers.fulfilled([user1], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ users: [user1] }))

      expect(
        reducer(
          { ...initialState, users: [user1] },
          fetchUsers.fulfilled([user2], null, { page: 2 })
        )
      ).toEqual(expect.objectContaining({ users: [user1, user2] }))

      expect(
        reducer(
          { ...initialState, users: [user1] },
          fetchUsers.fulfilled([user2], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ users: [user2] }))
    })
  })

})

import reducer, { fetchContacts } from './slice'
import  { createStore } from '../../../../.jest/redux-testing'
import { contactFactory } from '../../../../factories/contact'
import { getContacts } from '../../../../services/contact'

jest.mock('../../../../services/contact')

describe('Contacts slice', () => {
  const initialState = {
    contacts: [],
  }

  it('has an initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('users/fetchContactsStatus/fulfilled', () => {
    it('dispatches an action to fetch the contacts', async () => {
      const contact = contactFactory.build()
      const store = createStore()

      getContacts.mockResolvedValue({ status: 201, data: [contact] })

      await store.dispatch(fetchContacts({ page: 1, expression: '' }))

      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'users/fetchContactsStatus/fulfilled',
          payload: [contact]
        })
      )
    })

    it('appends the contacts when the page is not 1', async () => {
      const contact1 = contactFactory.build()
      const contact2 = contactFactory.build()

      expect(
        reducer(
          { ...initialState, contacts: [] },
          fetchContacts.fulfilled([contact1], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ contacts: [contact1] }))

      expect(
        reducer(
          { ...initialState, contacts: [contact1] },
          fetchContacts.fulfilled([contact2], null, { page: 2 })
        )
      ).toEqual(expect.objectContaining({ contacts: [contact1, contact2] }))

      expect(
        reducer(
          { ...initialState, contacts: [contact1] },
          fetchContacts.fulfilled([contact2], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ contacts: [contact2] }))
    })
  })

})

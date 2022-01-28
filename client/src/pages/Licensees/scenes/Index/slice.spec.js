import reducer, { fetchLicensees } from './slice'
import { createStore } from '../../../../.jest/redux-testing'
import { licenseeFactory } from '../../../../factories/licensee'
import { getLicensees } from '../../../../services/licensee'

jest.mock('../../../../services/licensee')

describe('Licensees slice', () => {
  const initialState = {
    licensees: [],
  }

  it('has an initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('users/fetchLicenseesStatus/fulfilled', () => {
    it('dispatches an action to fetch the licensees', async () => {
      const licensee = licenseeFactory.build()
      const store = createStore()

      getLicensees.mockResolvedValue({ status: 201, data: [licensee] })

      await store.dispatch(fetchLicensees({ page: 1, expression: '' }))

      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'users/fetchLicenseesStatus/fulfilled',
          payload: [licensee]
        })
      )
    })

    it('appends the licensees when the page is not 1', async () => {
      const licensee1 = licenseeFactory.build()
      const licensee2 = licenseeFactory.build()

      expect(
        reducer(
          { ...initialState, licensees: [] },
          fetchLicensees.fulfilled([licensee1], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ licensees: [licensee1] }))

      expect(
        reducer(
          { ...initialState, licensees: [licensee1] },
          fetchLicensees.fulfilled([licensee2], null, { page: 2 })
        )
      ).toEqual(expect.objectContaining({ licensees: [licensee1, licensee2] }))

      expect(
        reducer(
          { ...initialState, licensees: [licensee1] },
          fetchLicensees.fulfilled([licensee2], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ licensees: [licensee2] }))
    })
  })

})
import reducer, { fetchTriggers } from './slice'
import  { createStore } from '../../../../.jest/redux-testing'
import { triggerFactory } from '../../../../factories/trigger'
import { getTriggers } from '../../../../services/trigger'

jest.mock('../../../../services/trigger')

describe('Triggers slice', () => {
  const initialState = {
    triggers: [],
  }

  it('has an initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('users/fetchTriggersStatus/fulfilled', () => {
    it('dispatches an action to fetch the triggers', async () => {
      const trigger = triggerFactory.build()
      const store = createStore()

      getTriggers.mockResolvedValue({ status: 201, data: [trigger] })

      await store.dispatch(fetchTriggers({ page: 1, expression: '' }))

      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'users/fetchTriggersStatus/fulfilled',
          payload: [trigger]
        })
      )
    })

    it('appends the triggers when the page is not 1', async () => {
      const trigger1 = triggerFactory.build()
      const trigger2 = triggerFactory.build()

      expect(
        reducer(
          { ...initialState, triggers: [] },
          fetchTriggers.fulfilled([trigger1], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ triggers: [trigger1] }))

      expect(
        reducer(
          { ...initialState, triggers: [trigger1] },
          fetchTriggers.fulfilled([trigger2], null, { page: 2 })
        )
      ).toEqual(expect.objectContaining({ triggers: [trigger1, trigger2] }))

      expect(
        reducer(
          { ...initialState, triggers: [trigger1] },
          fetchTriggers.fulfilled([trigger2], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ triggers: [trigger2] }))
    })
  })

})

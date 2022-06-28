import reducer, { fetchTemplates } from './slice'
import  { createStore } from '../../../../.jest/redux-testing'
import { templateFactory } from '../../../../factories/template'
import { getTemplates } from '../../../../services/template'

jest.mock('../../../../services/template')

describe('Templates slice', () => {
  const initialState = {
    templates: [],
  }

  it('has an initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('users/fetchTemplatesStatus/fulfilled', () => {
    it('dispatches an action to fetch the templates', async () => {
      const template = templateFactory.build()
      const store = createStore()

      getTemplates.mockResolvedValue({ status: 201, data: [template] })

      await store.dispatch(fetchTemplates({ page: 1, expression: '' }))

      expect(store.getActions()).toContainEqual(
        expect.objectContaining({
          type: 'users/fetchTemplatesStatus/fulfilled',
          payload: [template]
        })
      )
    })

    it('appends the templates when the page is not 1', async () => {
      const template1 = templateFactory.build()
      const template2 = templateFactory.build()

      expect(
        reducer(
          { ...initialState, templates: [] },
          fetchTemplates.fulfilled([template1], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ templates: [template1] }))

      expect(
        reducer(
          { ...initialState, templates: [template1] },
          fetchTemplates.fulfilled([template2], null, { page: 2 })
        )
      ).toEqual(expect.objectContaining({ templates: [template1, template2] }))

      expect(
        reducer(
          { ...initialState, templates: [template1] },
          fetchTemplates.fulfilled([template2], null, { page: 1 })
        )
      ).toEqual(expect.objectContaining({ templates: [template2] }))
    })
  })

})

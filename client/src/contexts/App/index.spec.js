import { fireEvent, screen } from '@testing-library/react'
import { useContext, useEffect } from 'react'
import { AppContext, AppContextProvider } from '.'
import { userFactory } from '../../factories/user'
import mountWithRedux, { createStore } from '../../.jest/redux-testing'

describe('<AppContextProvider />', () => {
  describe('#setCurrentUser', () => {
    it('updates the current user', () => {
      const user = userFactory.build()
      const user2 = userFactory.build()
      const callback = jest.fn()

      function Sandbox() {
        const { currentUser, setCurrentUser } = useContext(AppContext)

        useEffect(() => {
          setCurrentUser(user)
        }, [setCurrentUser])

        callback(currentUser)

        return <button onClick={() => setCurrentUser(user2)}>Action</button>
      }

      const store = createStore()
      mountWithRedux(store)(
        <AppContextProvider>
          <Sandbox />
        </AppContextProvider>)

      expect(callback).toHaveBeenNthCalledWith(1, undefined)
      expect(callback).toHaveBeenNthCalledWith(2, user)

      fireEvent.click(screen.getByText('Action'))

      expect(callback).toHaveBeenNthCalledWith(3, user2)
    })
  })
})

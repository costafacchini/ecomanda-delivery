import { createContext, useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { loadLoggedUser } from '../../pages/SignIn/slice'

const AppContext = createContext(null)

const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState()
  const dispatch = useDispatch()

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: useCallback(
          (user) => {
            setCurrentUser(user)
            dispatch(loadLoggedUser(user))
          },
          [dispatch]
        ),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContextProvider, AppContext }

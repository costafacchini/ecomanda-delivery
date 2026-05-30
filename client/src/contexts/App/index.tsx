import { createContext, useCallback, useState } from 'react'

const AppContext = createContext(null)

const AppContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState()

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: useCallback(
          (user) => {
            setCurrentUser(user)
          },
          []
        ),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContextProvider, AppContext }

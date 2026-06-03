import { createContext, useCallback, useState } from 'react'
import { saveActiveLicensee, loadActiveLicensee } from '../../services/auth'

const AppContext = createContext<any>(null)

const AppContextProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState()
  const [activeLicensee, setActiveLicensee] = useState(loadActiveLicensee)

  const updateActiveLicensee = useCallback((licensee: any) => {
    saveActiveLicensee(licensee)
    setActiveLicensee(licensee)
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: useCallback(
          (user: any) => {
            setCurrentUser(user)
          },
          []
        ),
        activeLicensee,
        updateActiveLicensee,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContextProvider, AppContext }

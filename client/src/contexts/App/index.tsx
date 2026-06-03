import { createContext, useCallback, useState } from 'react'
import { saveActiveLicensee, loadActiveLicensee, saveLicenseeModalSeen, loadLicenseeModalSeen } from '../../services/auth'

const AppContext = createContext<any>(null)

const AppContextProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useState()
  const [activeLicensee, setActiveLicensee] = useState(loadActiveLicensee)
  const [licenseeModalSeen, setLicenseeModalSeen] = useState(loadLicenseeModalSeen)

  const updateActiveLicensee = useCallback((licensee: any) => {
    saveActiveLicensee(licensee)
    setActiveLicensee(licensee)
  }, [])

  const markLicenseeModalSeen = useCallback(() => {
    saveLicenseeModalSeen(true)
    setLicenseeModalSeen(true)
  }, [])

  const resetLicenseeModal = useCallback(() => {
    saveLicenseeModalSeen(false)
    setLicenseeModalSeen(false)
    saveActiveLicensee(null)
    setActiveLicensee(null)
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: useCallback((user: any) => { setCurrentUser(user) }, []),
        activeLicensee,
        updateActiveLicensee,
        licenseeModalSeen,
        markLicenseeModalSeen,
        resetLicenseeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContextProvider, AppContext }

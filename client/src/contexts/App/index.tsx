import { createContext, useCallback, useContext, useState } from 'react'
import { saveActiveLicensee, loadActiveLicensee, saveLicenseeModalSeen, loadLicenseeModalSeen } from '../../services/auth'
import type { IUser, ILicensee } from '../../types'

interface IAppContext {
  currentUser: IUser | undefined
  setCurrentUser: (user: IUser | undefined) => void
  activeLicensee: ILicensee | null
  updateActiveLicensee: (licensee: ILicensee | null) => void
  licenseeModalSeen: boolean
  markLicenseeModalSeen: () => void
  resetLicenseeModal: () => void
}

const AppContext = createContext<IAppContext | null>(null)

export function useApp(): IAppContext {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppContextProvider')
  return ctx
}

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<IUser | undefined>()
  const [activeLicensee, setActiveLicensee] = useState<ILicensee | null>(loadActiveLicensee as unknown as ILicensee | null)
  const [licenseeModalSeen, setLicenseeModalSeen] = useState<boolean>(loadLicenseeModalSeen)

  const updateActiveLicensee = useCallback((licensee: ILicensee | null) => {
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
        setCurrentUser: useCallback((user: IUser | undefined) => { setCurrentUser(user) }, []),
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

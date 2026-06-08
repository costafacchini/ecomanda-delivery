import React, { useContext } from 'react'
import Navbar from '../Navbar'
import SelectLicenseeModal from '../../components/SelectLicenseeModal'
import { AppContext } from '../../contexts/App'

export default function BaseLayout({ children }: any) {
  const { currentUser, activeLicensee, updateActiveLicensee, licenseeModalSeen, markLicenseeModalSeen } = useContext(AppContext)

  const showModal =
    (currentUser?.role === 'super' && !licenseeModalSeen) ||
    (currentUser?.role === 'admin' && !currentUser?.licensee && !activeLicensee)

  if (showModal) {
    return (
      <SelectLicenseeModal
        required={currentUser?.role === 'admin'}
        onSelect={(licensee: any) => {
          updateActiveLicensee(licensee)
          markLicenseeModalSeen()
        }}
      />
    )
  }

  return (
    <>
      <Navbar currentUser={currentUser} />
      <div className='container'>
        <div className='row'>
          <div className='col pb-5 mt-3'>{children}</div>
        </div>
      </div>
    </>
  )
}

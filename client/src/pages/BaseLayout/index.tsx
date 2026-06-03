import React, { useContext } from 'react'
import Navbar from '../Navbar'
import SelectLicenseeModal from '../../components/SelectLicenseeModal'
import { AppContext } from '../../contexts/App'

export default function BaseLayout({ children }: any) {
  const { currentUser, activeLicensee, updateActiveLicensee } = useContext(AppContext)

  if (currentUser?.role === 'super' && !activeLicensee) {
    return <SelectLicenseeModal onSelect={updateActiveLicensee} />
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

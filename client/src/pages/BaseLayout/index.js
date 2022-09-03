import React, { useContext } from 'react'
import Navbar from '../Navbar'
import { AppContext } from '../../contexts/App'

export default function BaseLayout({ children }) {
  const { currentUser } = useContext(AppContext)

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

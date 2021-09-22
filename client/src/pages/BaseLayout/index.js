import React from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../Navbar'

export default function BaseLayout({ children }) {
  const loggedUser = useSelector(state => state.signin.loggedUser)

  return (
    <>
      <Navbar loggedUser={loggedUser} />
      <div className='container'>
        <div className='row'>
          <div className='col pb-5 mt-3'>{children}</div>
        </div>
      </div>
    </>
  )
}

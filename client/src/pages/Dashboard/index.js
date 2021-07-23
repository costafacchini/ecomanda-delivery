import React from 'react'
import Navbar from '../Navbar'

export default function Dashboard({ loggedUser }) {
  return (
    <>
      <Navbar loggedUser={loggedUser} />
    </>
  )
}
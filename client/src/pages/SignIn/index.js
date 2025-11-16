import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router'
import api from '../../services/api'
import { login, fetchLoggedUser } from '../../services/auth'
import styles from './index.module.scss'
import { AppContext } from '../../contexts/App'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  let navigate = useNavigate()
  const { setCurrentUser } = useContext(AppContext)

  async function handleSignIn(e) {
    e.preventDefault()

    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar!')
    } else {
      const body = { email, password }
      const response = await api().post('/login', { body })
      if (response.status === 200) {
        login(email, response.data.token)

        fetchLoggedUser().then(user => {
          setCurrentUser(user)
        })

        navigate('/#/')
      } else {
        console.log(response)
        setError(response.data.message)
      }
    }
  }

  return (
    <>
      <div style={{ background: "linear-gradient(to right, #f1faee, #a8dadc)" }} className='h-100'>
        <div className='h-100 container'>
          <div className='row h-100 justify-content-center pb-5'>
            <div className={`col h-100 col-12 col-md-8 col-lg-6 col-xl-4 ${styles.login}`}>
              <div className='h-100 px-4 d-flex justify-content-center flex-column'>
                <h3 className='text-center mb-4'>e-comanda</h3>

                <div className="">
                  <label htmlFor="email" className="form-label">email</label>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span style={{ fontSize: '1.1rem' }} className="input-group-text"><i className="bi bi-person-fill" /></span>
                    </div>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="nome@exemplo.com"
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label htmlFor="password" className="form-label">senha</label>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span style={{ fontSize: '1.1rem' }} className="input-group-text"><i className="bi bi-key-fill"></i></span>
                    </div>
                    <input
                      type='password'
                      className="form-control"
                      id="password"
                      rows="3"
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-danger mt-3">
                  {error && <p>{error}</p>}
                </div>

                <button
                  className='btn btn-primary mt-4 w-100'
                  onClick={handleSignIn}>
                  Entrar
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default SignIn

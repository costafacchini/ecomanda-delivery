import React, { useState } from 'react'
import { useHistory, withRouter } from 'react-router-dom'
import api from '../../services/api'
import { login } from '../../services/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import Logo from '../../assets/chatbot-3589528_1920.jpg'
import './styles.css'

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  let history = useHistory();

  async function handleSignIn(e) {
    e.preventDefault();

    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar!');
    } else {
      try {
        const body = { email, password }
        const response = await api().post('/login', { body });
        login(response.data.token);
        history.push('/dashboard');
      } catch (err) {
        console.log(err)
        setError('Houve um problema com o login, verifique suas credenciais. T.T')
      }
    }
  }

  return (
    <>
      <div className='container signin-form signin-container' style={{ backgroundImage: `url(${Logo})` }}>
      <div className='row'>
        <div className='col-md-offset-5 col-md-4 text-center'>
          <h1 className='signin-text-white signin-h1'>e-comanda delivery</h1>
          <div className='signin-form-login'>
            <br/>
              {error && <p>{error}</p>}
            <br/>
            <input
              type='email'
              className='form-control signin-form-control input-sm chat-input'
              placeholder='e-mail'
              onChange={e => setEmail(e.target.value)}
            />
            <br/><br/>
            <input
              type='text'
              className='form-control signin-form-control input-sm chat-input'
              placeholder='senha'
              onChange={e => setPassword(e.target.value)}
            />
            <br/><br/>
            <div className='wrapper'>
                <button className='btn btn-danger btn-md' onClick={handleSignIn}>login <FontAwesomeIcon icon={faSignInAlt} /></button>
            </div>
          </div>
        </div>
      </div>
      <br/><br/><br/>
        <div className='footer signin-text-white'>
          <p>© 2021 All rights reserved | Design by <a href='https://github.com/costafacchini'>Alan</a></p>
      </div>
    </div >
    </>
  )
}

export default withRouter(SignIn);
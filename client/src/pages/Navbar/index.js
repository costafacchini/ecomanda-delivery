import React from 'react'
import { logout } from '../../services/auth'

export default function Navbar({ currentUser }) {
  return (
      <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
        <div className='container-fluid'>
          <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarSupportedContent'>
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
              <li className='nav-item'>
                <a className='nav-link active' aria-current='page' href='/#/'>Dashboard</a>
              </li>
              {currentUser && currentUser.isAdmin && (
                <li className='nav-item dropdown'>
                  <a className='nav-link dropdown-toggle' role='button' data-bs-toggle='dropdown' id='admin-dropdown'>
                    Admin
                  </a>

                  <div className='dropdown-menu' aria-labelledby='admin-dropdown'>
                    <a href='/#/licensees' className='dropdown-item'>
                      Licenciados
                    </a>

                    <a href='/#/users' className='dropdown-item'>
                      Usuários
                    </a>
                  </div>
                </li>
              )}
              <li className='nav-item dropdown'>
                <a className='nav-link dropdown-toggle' role='button' data-bs-toggle='dropdown' id='cadastros-dropdown'>
                  Cadastros
                </a>

                <div className='dropdown-menu' aria-labelledby='cadastros-dropdown'>
                  <a className='dropdown-item' href='/#/contacts'>
                    Contatos
                  </a>

                  <a className='dropdown-item' href='/#/triggers'>
                    Gatilhos
                  </a>

                  <a className='dropdown-item' href='/#/templates'>
                    Templates
                  </a>
                </div>
              </li>
              <li className='nav-item'>
                <a className='nav-link' href='/#/messages'>Mensagens</a>
              </li>
              {currentUser && currentUser.isAdmin && currentUser.isSuper && (
                <li className='nav-item dropdown'>
                  <a className='nav-link dropdown-toggle' id='reports-menu' role='button' data-bs-toggle='dropdown'>
                    Relatórios
                  </a>
                  <div className='dropdown-menu' aria-labelledby='reports-menu'>
                    <a className='dropdown-item' href='/#/reports/billing'>Faturamento</a>
                  </div>
                </li>
              )}
            </ul>
            <div className='btn-item'>
              <a className='btn btn-primary' href='/' onClick={logout}>Sair</a>
            </div>
          </div>
        </div>
      </nav>
  )
}

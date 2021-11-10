import React from 'react'
import { logout } from '../../services/auth'

export default function Navbar({ loggedUser }) {
  return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/#/">Dashboard</a>
              </li>
              {loggedUser && loggedUser.isAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/#/licensees">Licenciados</a>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link" href="/#/reports">Relatórios</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/configurations">Configurações</a>
              </li>
              {/* <li className="nav-item">
                <a className="nav-link" href="/#/messages">Mensagens</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/sendmessages">Enviar mensagem</a>
              </li> */}
            </ul>
            <div className="btn-item">
              <a className="btn btn-primary" href="/" onClick={logout}>Sair</a>
            </div>
          </div>
        </div>
      </nav>
  )
}

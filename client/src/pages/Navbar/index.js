import React from 'react'
import { logout } from '../../services/auth'

export default function Navbar({ loggedUser }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/#/">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/configurations">Licenciados</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/configurations">Usuários</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/configurations">Configurações</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/contacts">Contatos</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/messages">Mensagens</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/#/sendmessages">Enviar mensagem</a>
              </li>
              <li class="nav-item justify-content-end">
                <a class="nav-link" href="/" onClick={logout}>Sair</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}
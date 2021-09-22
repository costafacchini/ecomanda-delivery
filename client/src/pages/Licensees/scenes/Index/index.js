import { Link } from "react-router-dom"
import { connect } from 'react-redux'
import { fetchLicensees } from './slice'
import { useEffect } from "react"

function LicenseesIndex({ licensees, dispatch }) {

  useEffect(() => {
    dispatch(fetchLicensees())
  }, [dispatch])

  return (
    <>
      <div className='d-flex justify-content-between pb-2'>
        <div className=''>
          <h3 className='pr-3'>Licenciados</h3>
        </div>
        <div className=''>
          <Link to='/licensees/new' className='btn btn-primary'>Criar +</Link>
        </div>
      </div>
      <div className='row'>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Tipo</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {licensees.map((licensee) => (
              <tr key={licensee.id}>
                <td>{licensee.name}</td>
                <td>{licensee.email}</td>
                <td>{licensee.licenseKind}</td>
                <td><Link to={`/licensees/${licensee.id}`}><i className="bi bi-pencil" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    licensees: state.licenseesIndex.licensees
  }
}

export default connect(mapStateToProps)(LicenseesIndex)

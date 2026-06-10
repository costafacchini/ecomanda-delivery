import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { getSectors, deleteSector } from '../../../../services/sector'
import { toast } from 'react-toastify'

function SectorsIndex({ currentUser }: any) {
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSectors = useCallback(async () => {
    if (!currentUser?.licensee?._id) return

    setLoading(true)
    try {
      const { data } = await getSectors({ licensee: currentUser.licensee._id })
      setSectors(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este setor?')) return

    const response = await deleteSector(id)
    if (response.status === 200) {
      toast.success('Setor excluído com sucesso!')
      fetchSectors()
    } else {
      toast.error('Ops! Não foi possível excluir o setor.')
    }
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Setores</h3>
          </div>
          <div className=''>
            <Link to='/sectors/new' className='btn btn-primary'>Criar +</Link>
          </div>
        </div>
      </div>

      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>Ativo</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {!loading && sectors.map((sector: any) => (
              <tr key={sector.id}>
                <td>{sector.name}</td>
                <td>{sector.active ? 'Sim' : 'Não'}</td>
                <td>
                  <Link to={`/sectors/${sector.id}/edit`} className='me-2'>
                    <i className='bi bi-pencil' />
                  </Link>
                  <button
                    className='btn btn-link p-0 text-danger'
                    onClick={() => handleDelete(sector.id)}
                    title='Excluir setor'
                  >
                    <i className='bi bi-trash' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default SectorsIndex

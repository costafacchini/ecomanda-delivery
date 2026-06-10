import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import { getSetores, deleteSetor } from '../../../../services/setor'
import { toast } from 'react-toastify'

function SetoresIndex({ currentUser }: any) {
  const [setores, setSetores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSetores = useCallback(async () => {
    if (!currentUser?.licensee?._id) return

    setLoading(true)
    try {
      const { data } = await getSetores({ licensee: currentUser.licensee._id })
      setSetores(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchSetores()
  }, [fetchSetores])

  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este setor?')) return

    const response = await deleteSetor(id)
    if (response.status === 200) {
      toast.success('Setor excluído com sucesso!')
      fetchSetores()
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
            <Link to='/setores/new' className='btn btn-primary'>Criar +</Link>
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
            {!loading && setores.map((setor: any) => (
              <tr key={setor.id}>
                <td>{setor.name}</td>
                <td>{setor.active ? 'Sim' : 'Não'}</td>
                <td>
                  <Link to={`/setores/${setor.id}/edit`} className='me-2'>
                    <i className='bi bi-pencil' />
                  </Link>
                  <button
                    className='btn btn-link p-0 text-danger'
                    onClick={() => handleDelete(setor.id)}
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

export default SetoresIndex

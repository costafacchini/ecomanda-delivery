import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { getSetor, updateSetor } from '../../../../services/setor'
import { useNavigate, useParams } from 'react-router'

function SetorEdit({ currentUser }: any) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [setor, setSetor] = useState<any>(null)

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchSetor() {
      try {
        const { data } = await getSetor(id)
        setSetor(data)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchSetor()
    return () => {
      abortController.abort()
    }
  }, [id])

  if (!setor) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Setor editando</h3>
        <Form
          initialValues={setor}
          currentUser={currentUser}
          errors={errors}
          setorId={setor.id}
          onSubmit={async (values: any) => {
            const response = await updateSetor({ ...values, id: setor.id })

            if (response.status === 200) {
              toast.success('Setor atualizado com sucesso!')
              navigate('/setores')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o setor.')
            }
          }}
        />
      </div>
    </div>
  )
}

export default SetorEdit

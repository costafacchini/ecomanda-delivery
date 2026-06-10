import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { getSector, updateSector } from '../../../../services/sector'
import { useNavigate, useParams } from 'react-router'

function SectorEdit({ currentUser }: any) {
  const navigate = useNavigate()
  let { id } = useParams()
  const [errors, setErrors] = useState(null)
  const [sector, setSector] = useState<any>(null)

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchSector() {
      try {
        const { data } = await getSector(id)
        setSector(data)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchSector()
    return () => {
      abortController.abort()
    }
  }, [id])

  if (!sector) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Setor editando</h3>
        <Form
          initialValues={sector}
          currentUser={currentUser}
          errors={errors}
          sectorId={sector.id}
          onSubmit={async (values: any) => {
            const response = await updateSector({ ...values, id: sector.id })

            if (response.status === 200) {
              toast.success('Setor atualizado com sucesso!')
              navigate('/sectors')
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

export default SectorEdit

import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useContext } from 'react'
import { createContact } from '../../../../services/contact'
import { useNavigate } from 'react-router'
import { AppContext } from '../../../../contexts/App'
import type { IUser } from '../../../../types'
import type { ILicensee } from '../../../../types'

interface ContactNewProps {
  currentUser: IUser | null | undefined
}

function ContactNew({ currentUser }: ContactNewProps) {
  const { activeLicensee }: { activeLicensee: ILicensee | null } = useContext(AppContext)
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Array<{ message: string }> | null>(null)

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato criando</h3>
        <Form errors={errors} currentUser={currentUser} activeLicensee={activeLicensee} onSubmit={async (values: { licensee?: string | null; [key: string]: unknown }) => {
          if (!values.licensee) {
            if (currentUser?.role !== 'super') {
              // licensee may be a string id or an object — preserve the raw value as-is
              values.licensee = (currentUser?.licensee as unknown) as string | null | undefined
            } else if (activeLicensee) {
              values.licensee = activeLicensee._id
            }
          }
          const response = await createContact(values)

          if (response.status === 201) {
            toast.success('Contato criado com sucesso!');
            navigate('/contacts')
            setErrors(null)
          } else {
            setErrors(response.data.errors)
            toast.error('Ops! Não foi possível criar o contato.');
          }
        }} />
      </div>
    </div>
  )
}

export default ContactNew

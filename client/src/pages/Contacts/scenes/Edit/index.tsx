import Form from '../Form'
import { toast } from 'react-toastify'
import { useState, useContext } from 'react'
import { getContact, updateContact } from '../../../../services/contact'
import { useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import { AppContext } from '../../../../contexts/App'
import type { IContact, IUser, ILicensee } from '../../../../types'

interface ContactEditProps {
  currentUser?: IUser | null
}

function ContactEdit({ currentUser }: ContactEditProps) {
  const { activeLicensee }: { activeLicensee: ILicensee | null } = useContext(AppContext)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [errors, setErrors] = useState<Array<{ message: string }> | null>(null)
  const [contact, setContact] = useState<IContact | null>(null)

  const contactId = id

  useEffect(() => {
    const abortController = new AbortController()

    async function fetchContact() {
      try {
        const { data: contactData } = await getContact(contactId)
        setContact(contactData)
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchContact()
    return () => {
      abortController.abort()
    }
  }, [contactId])

  if (!contact) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>Contato editando</h3>
        <Form
          initialValues={contact}
          currentUser={currentUser}
          activeLicensee={activeLicensee}
          errors={errors}
          onSubmit={async (values: { [key: string]: unknown }) => {
            const response = await updateContact(values)

            if (response.status === 200) {
              toast.success('Contato atualizado com sucesso!');
              navigate('/contacts')
              setErrors(null)
            } else {
              setErrors(response.data.errors)
              toast.error('Ops! Não foi possível atualizar o contato.');
            }
          }}
        />
      </div>
    </div>
  )
}

export default ContactEdit

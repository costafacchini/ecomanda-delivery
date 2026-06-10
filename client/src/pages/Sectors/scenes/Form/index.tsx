import { useEffect, useState } from 'react'
import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useNavigate } from 'react-router'
import Select from 'react-select'
import { getUsers } from '../../../../services/user'
import SectorBaileysPanel from '../Edit/SectorBaileysPanel'

const sectorSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
})

const sectorInitialValues = {
  name: '',
  users: [] as string[],
  active: true,
}

function SectorForm(props: any) {
  const { onSubmit, errors, initialValues, currentUser, sectorId } = props
  let navigate = useNavigate()
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    async function fetchUsers() {
      const licenseeId = currentUser?.licensee?._id || currentUser?.licensee
      if (!licenseeId) return
      const { data } = await getUsers({ licensee: licenseeId })
      const users = Array.isArray(data) ? data : []
      setUserOptions(users.map((u: any) => ({ value: u.id, label: u.name })))
    }
    fetchUsers()
  }, [currentUser])

  const mergedInitialValues = { ...sectorInitialValues, ...initialValues }

  return (
    <div>
      <Form
        validationSchema={sectorSchema}
        initialValues={mergedInitialValues}
        onSubmit={(values: any) => {
          onSubmit(values)
        }}
      >
        {(formikProps: any) => {
          const selectedUserValues: string[] = formikProps.values.users.map((opt: any) => opt._id) || []
          const selectedOptions = userOptions.filter(opt => selectedUserValues.includes(opt.value))

          return (
            <form onSubmit={formikProps.handleSubmit}>
              <fieldset className='pb-4'>
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='name'>Nome</label>
                    <FieldWithError
                      id='name'
                      type='text'
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      value={formikProps.values.name}
                      name='name'
                    />
                  </div>
                  <div className='form-group col-5'>
                    <div className='form-check mt-4'>
                      <input
                        checked={formikProps.values.active}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        type='checkbox'
                        className='form-check-input'
                        id='active'
                        name='active'
                      />
                      <label className='form-check-label' htmlFor='active'>Ativo</label>
                    </div>
                  </div>
                </div>

                <div className='row'>
                  <div className='form-group col-8'>
                    <label htmlFor='users'>Usuários</label>
                    <Select
                      inputId='users'
                      isMulti
                      options={userOptions}
                      value={selectedOptions}
                      onChange={(selected) => {
                        const ids = selected ? selected.map((opt: any) => opt.value) : []
                        formikProps.setFieldValue('users', ids)
                      }}
                      placeholder='Selecione os usuários...'
                    />
                  </div>
                </div>
              </fieldset>

              {errors && (
                <div className='alert alert-danger'>
                  <ul>
                    {errors.map((error: any) => (<li key={error.message}>{error.message}</li>))}
                  </ul>
                </div>
              )}

              {sectorId && <SectorBaileysPanel sectorId={sectorId} isActive={initialValues.active} />}

              <div className='row'>
                <div className='col-5'>
                  <div className='mt-4 d-flex justify-content-between'>
                    <button onClick={() => navigate('/sectors')} className='btn btn-secondary' type='button'>Voltar</button>
                    <button className='btn btn-success' type='submit'>Salvar</button>
                  </div>
                </div>
              </div>
            </form>
          )
        }}
      </Form>
    </div>
  )
}

export default SectorForm

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FieldWithError } from './'
import { Formik } from 'formik'
import * as Yup from "yup";
import userEvent from '@testing-library/user-event'

describe('FieldWithError', () => {
  it('receives any props', () => {
    render(
      <Formik>
        {() => (
          <FieldWithError name='field' type='textbox' />
        )}
      </Formik>
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders the input errors', async () => {
    const Validation = Yup.object().shape({
      field: Yup.string()
        .required('Required')
    });

    render(
      <Formik initialValues={{ field: '' }} initialErrors={{ field: 'Too Short!' }} validationSchema={Validation} >
        {props => (
          <>
            <FieldWithError
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              value={props.values.field}
              name='field'
              type='textbox'
            />
          </>
        )}
      </Formik>
    )

    expect(screen.queryByText('Too Short!')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '921873281921' } })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})

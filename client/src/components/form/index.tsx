import { Field, ErrorMessage, Formik, FormikConfig, FormikValues } from 'formik'

interface FieldWithErrorProps {
  name: string
  id?: string
  type?: string
  value?: unknown
  onChange?: React.ChangeEventHandler
  onBlur?: React.FocusEventHandler
  className?: string
  autoComplete?: string
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
}

const FieldWithError = (props: FieldWithErrorProps) => {
  return (
    <div className='pb-2'>
      <Field  {...props} className={`form-control ${props.className ?? ''}`} />
      <ErrorMessage name={props.name} />
    </div>
  )
}

function Form<T extends FormikValues = FormikValues>(props: FormikConfig<T>) {
  return (
    <Formik {...props}>{props.children}</Formik>
  )
}

export { FieldWithError, Form }

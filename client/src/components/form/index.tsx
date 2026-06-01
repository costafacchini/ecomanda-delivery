import { Field, ErrorMessage, Formik } from 'formik'

const FieldWithError = (props: any) => {
  return (
    <div className='pb-2'>
      <Field  {...props} className={`form-control ${props.className}`} />
      <ErrorMessage name={props.name} />
    </div>
  )
}

const Form = (props: any) => {
  return (
    <Formik {...props}>{props.children}</Formik>
  )
}

export { FieldWithError, Form }

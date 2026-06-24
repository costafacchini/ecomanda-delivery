import { FieldWithError, Form } from '../../../../components/form'
import * as Yup from 'yup'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import SelectLicenseesWithFilter from '../../../../components/SelectLicenseesWithFilter'
import styles from './styles.module.scss'
import type { IUser, TriggerKind } from '../../../../types'
import { useTranslation } from 'react-i18next'

interface ITriggerFormValues {
  name: string
  triggerKind: TriggerKind
  expression: string
  catalogMulti: string
  licensee: string | null
  catalogSingle: string
  textReplyButton: string
  messagesList: string
  catalogId: string
  order: number
  text?: string
}

interface IFormError {
  message: string
}

interface TriggerFormProps {
  onSubmit: (values: ITriggerFormValues) => void
  errors?: IFormError[] | null
  initialValues?: Partial<ITriggerFormValues>
  currentUser?: IUser | null
  activeLicensee?: { _id: string } | null
}

const triggerInitialValues: ITriggerFormValues = {
  name: '',
  triggerKind: 'multi_product',
  expression: '',
  catalogMulti: '',
  licensee: '',
  catalogSingle: '',
  textReplyButton: '',
  messagesList: '',
  catalogId: '',
  order: 1,
}

function TriggerForm({ onSubmit, errors, initialValues, currentUser, activeLicensee }: TriggerFormProps) {
  const { t } = useTranslation()
  let navigate = useNavigate()

  const validationSchema = useMemo(
    () => Yup.object().shape({ name: Yup.string() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  )

  return (
    <div>
      <Form
        validationSchema={validationSchema}
        initialValues={{...triggerInitialValues, ...initialValues}}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <fieldset className='pb-4'>
              <div className='row'>
                <div className='form-group col-4'>
                  <label htmlFor='name'>{t('triggers.nameLabel')}</label>
                  <FieldWithError
                    id='name'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    name='name'
                  />
                </div>

                <div className='form-group col-1'>
                  <label htmlFor='order'>{t('triggers.orderLabel')}</label>
                  <FieldWithError
                    id='order'
                    type='number'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.order}
                    name='order'
                  />
                </div>
              </div>

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='expression'>{t('triggers.expressionLabel')}</label>
                  <FieldWithError
                    id='expression'
                    name='expression'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.expression}
                  />
                </div>
              </div>

              {currentUser && currentUser.role === 'super' && !activeLicensee && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='licensee'>{t('triggers.licenseeFilter')}</label>
                    <SelectLicenseesWithFilter selectedItem={typeof formik.values.licensee === 'string' ? null : formik.values.licensee} onChange={(e: any) => (
                      formik.setFieldValue('licensee', e?.value ?? null, false)
                    )} />
                  </div>
                </div>
              )}

              <div className='row'>
                <div className='form-group col-5'>
                  <label htmlFor='triggerKind'>{t('triggers.kindLabel')}</label>
                  <select
                    value={formik.values.triggerKind}
                    className='form-select'
                    id='triggerKind'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value='multi_product'>{t('triggers.kindMultiProduct')}</option>
                    <option value='single_product'>{t('triggers.kindSingleProduct')}</option>
                    <option value='reply_button'>{t('triggers.kindReplyButton')}</option>
                    <option value='list_message'>{t('triggers.kindListMessage')}</option>
                    <option value='text'>{t('triggers.kindText')}</option>
                  </select>
                </div>
              </div>

              { formik.values.triggerKind === 'multi_product' && (
                <>
                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='catalogId'>{t('triggers.catalogIdLabel')}</label>
                      <FieldWithError
                        id='catalogId'
                        type='text'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.catalogId}
                        name='catalogId'
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <div className='form-group col-5'>
                      <label htmlFor='catalogMulti'>{t('triggers.catalogLabel')}</label>
                      <div className='pb-2'>
                        <textarea
                          id='catalogMulti'
                          name='catalogMulti'
                          className='form-control'
                          rows={10}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.catalogMulti}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formik.values.triggerKind === 'single_product' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='catalogSingle'>{t('triggers.catalogLabel')}</label>
                    <div className='pb-2'>
                      <textarea
                        id='catalogSingle'
                        name='catalogSingle'
                        className='form-control'
                        rows={10}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.catalogSingle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'reply_button' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='textReplyButton'>{t('triggers.scriptLabel')}</label>
                    <div className='pb-2'>
                      <textarea
                        id='textReplyButton'
                        name='textReplyButton'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.textReplyButton}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'list_message' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='messagesList'>{t('triggers.messagesLabel')}</label>
                    <div className='pb-2'>
                      <textarea
                        id='messagesList'
                        name='messagesList'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.messagesList}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formik.values.triggerKind === 'text' && (
                <div className='row'>
                  <div className='form-group col-5'>
                    <label htmlFor='text'>{t('triggers.textLabel')}</label>
                    <div className='pb-2'>
                      <textarea
                        id='text'
                        name='text'
                        className='form-control'
                        rows={8}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.text}
                      />
                    </div>
                    <div className={`${styles.textHelp}`}>
                      <span>{t('triggers.textHelpTitle')}</span>
                      <ul>
                        <li>{t('triggers.textHelpCartResume')}</li>
                        <li>{t('triggers.textHelpContactName')}</li>
                        <li>{t('triggers.textHelpContactNumber')}</li>
                        <li>{t('triggers.textHelpContactAddress')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            {errors && (
              <div className='alert alert-danger'>
                <ul>
                  {errors.map((error: any) => (<li key={error.message}>{error.message}</li>))}
                </ul>
              </div>
            )}

            <div className='row'>
              <div className='col-5'>
                <div className='mt-4 d-flex justify-content-between'>
                  <button onClick={() => navigate('/triggers')} className='btn btn-secondary' type='button'>{t('common.back')}</button>
                  <button className='btn btn-success' type='submit'>{t('common.save')}</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Form>
    </div>
  )
}

export default TriggerForm

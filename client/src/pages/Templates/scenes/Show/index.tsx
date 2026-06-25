import Form from '../Form'
import { useState } from 'react'
import { getTemplate } from '../../../../services/template'
import { useParams } from 'react-router'
import { useEffect } from 'react'
import { useApp } from '../../../../contexts/App'
import type { IUser, ITemplate } from '../../../../types'
import { useTranslation } from 'react-i18next'

interface TemplateShowProps {
  currentUser?: IUser | null
}

function TemplateShow({ currentUser }: TemplateShowProps) {
  const { t } = useTranslation()
  const { activeLicensee } = useApp()
  let { id } = useParams()
  const [template, setTemplate] = useState<ITemplate | null>(null)

  const templateId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchTemplate() {
      try {
        const { data: licensee } = await getTemplate(templateId!)
        setTemplate(licensee as ITemplate)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Handling error thrown by aborting request
        }
      }
    }

    fetchTemplate()
    return () => {
      abortController.abort()
    }
  }, [templateId])

  if (!template) return null

  return (
    <div className='row'>
      <div className='col'>
        <h3>{t('templates.viewTitle')}</h3>
        <Form
          initialValues={template}
          currentUser={currentUser}
          activeLicensee={activeLicensee as any}
        />
      </div>
    </div>
  )
}

export default TemplateShow

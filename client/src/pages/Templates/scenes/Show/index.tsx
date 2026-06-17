import Form from '../Form'
import { useState, useContext } from 'react'
import { getTemplate } from '../../../../services/template'
import { useParams } from 'react-router'
import { useEffect } from 'react'
import { AppContext } from '../../../../contexts/App'
import type { IUser, ITemplate } from '../../../../types'

interface TemplateShowProps {
  currentUser?: IUser | null
}

function TemplateShow({ currentUser }: TemplateShowProps) {
  const { activeLicensee } = useContext(AppContext)
  let { id } = useParams()
  const [template, setTemplate] = useState<ITemplate | null>(null)

  const templateId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchTemplate() {
      try {
        const { data: licensee } = await getTemplate(templateId)
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
        <h3>Template consultando</h3>
        <Form
          initialValues={template}
          currentUser={currentUser}
          activeLicensee={activeLicensee}
        />
      </div>
    </div>
  )
}

export default TemplateShow

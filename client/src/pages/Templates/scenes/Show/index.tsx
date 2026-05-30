import Form from '../Form'
import { useState } from 'react'
import { getTemplate } from '../../../../services/template'
import { useParams } from 'react-router'
import { useEffect } from 'react'

function TemplateShow({ currentUser }) {
  let { id } = useParams()
  const [template, setTemplate] = useState(null)

  const templateId = id

  useEffect(() => {
    let abortController = new AbortController()

    async function fetchTemplate() {
      try {
        const { data: licensee } = await getTemplate(templateId)
        setTemplate(licensee)
      } catch (error) {
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
        />
      </div>
    </div>
  )
}

export default TemplateShow

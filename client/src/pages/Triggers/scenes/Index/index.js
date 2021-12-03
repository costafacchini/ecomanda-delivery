import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchTriggers } from './slice'
import { useEffect, useState } from 'react'

function TriggersIndex({ triggers, dispatch }) {
  const [filters, setFilters] = useState({ expression: '', page: 1 })
  const [expression, setExpression] = useState('')

  useEffect(() => {
    let abortController = new AbortController()

    try {
      dispatch(fetchTriggers(filters))
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [dispatch, filters])

  function changeExpression(event) {
    setExpression(event.target.value)
  }

  return (
    <>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
            <h3 className='pr-3'>Gatilhos</h3>
          </div>
          <div className=''>
            <Link to='/triggers/new' className='btn btn-primary'>Criar +</Link>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='d-flex justify-content-between pb-2'>
          <div className=''>
          </div>
          <div className=''>
            <div className='input-group'>
              <input
                className='form-control'
                name='expression'
                type='text'
                value={expression}
                placeholder='Digite a expressão'
                onChange={changeExpression}
              />
              <div className='input-group-append'>
                <button className='btn btn-primary' title='Filtre pelo gatilho' onClick={() => {
                  setFilters({ ...filters, expression })
                }}>
                  <i className='bi bi-search'></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='row'>
        <table className='table'>
          <thead>
            <tr>
              <th scope='col'>Nome</th>
              <th scope='col'>Expressão</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Conteúdo</th>
              <th scope='col'></th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((trigger) => (
              <tr key={trigger.id}>
                <td>{trigger.name}</td>
                <td>{trigger.expression}</td>
                <td>{trigger.triggerKind}</td>
                {trigger.triggerKind === 'multi_product' && (<td>{trigger.catalogMulti}</td>)}
                {trigger.triggerKind === 'single_product' && (<td>{trigger.catalogSingle}</td>)}
                {trigger.triggerKind === 'reply_button' && (<td>{trigger.textReplyButton}</td>)}
                {trigger.triggerKind === 'list_message' && (<td>{trigger.messagesList}</td>)}
                <td><Link to={`/triggers/${trigger.id}`}><i className='bi bi-pencil' /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <div className='container'>
          {expression === '' && (triggers.length > 29) && (
            <div className='row'>
              <div className='col text-center mt-3'>
                <button
                  type='button'
                  className='btn btn-outline-primary d-print-none'
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Carregar mais
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    triggers: state.triggersIndex.triggers
  }
}

export default connect(mapStateToProps)(TriggersIndex)

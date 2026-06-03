import React, { useState } from 'react'
import SelectLicenseesWithFilter from '../SelectLicenseesWithFilter'

export default function SelectLicenseeModal({ onSelect, required = true }: any) {
  const [selected, setSelected] = useState<any>(null)

  function handleConfirm() {
    onSelect(selected ? { _id: selected.value, name: selected.label } : null)
  }

  return (
    <div
      className='modal d-block'
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Selecione o licenciado</h5>
          </div>
          <div className='modal-body'>
            <SelectLicenseesWithFilter onChange={setSelected} />
            {!selected && required && (
              <small className='text-muted'>Selecione um licenciado para continuar.</small>
            )}
            {!selected && !required && (
              <small className='text-muted'>Selecione um licenciado ou confirme para ver todos.</small>
            )}
          </div>
          <div className='modal-footer'>
            <button
              className='btn btn-primary'
              onClick={handleConfirm}
              disabled={required && !selected}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

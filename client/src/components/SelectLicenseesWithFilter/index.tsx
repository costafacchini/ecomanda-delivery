import React, { useState } from 'react'
import Select, { createFilter } from 'react-select'
import debounce from 'lodash/debounce'
import { getLicensees } from '../../services/licensee'

export default function SelectLicenseesWithFilter({ isDisabled, onChange, selectedItem, ...props }: any) {
  const [defaultValue, setDefaultValue] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [optionsLoaded, setOptionsLoaded] = useState(false)

  const filterConfig: any = {
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: true
  }

  function handleOnChange(value: any) {
    if (value !== selectedOption) {
      setSelectedOption(value)

      onChange(value)
    }
  }

  function transformData(values: any) {
    return values.map((value: any) => ({ value: value._id, label: value.name }))
  }

  function handleSetSearchInput(value: any) {
    if (value.length > 2) handleFetch(value)
  }

  async function onFetch(value?: any) {
    try {
      setIsLoading(true)
      const { data: licensees } = await getLicensees({ expression: value, active: true })
      setOptions(transformData(licensees))
    } catch (_) {}
    setIsLoading(false)
  }

  const handleFetch = debounce(onFetch, 500)

  if (selectedItem && !defaultValue) {
    const newSelectedOption = { value: selectedItem._id, label: selectedItem.name, ...selectedItem }

    const hasItem = options.find(item => item.value === selectedItem._id)
    if (!hasItem) {
      const newOptions = [...options, newSelectedOption]
      setOptions(newOptions)
    }

    setDefaultValue(newSelectedOption)
  }

  if (!isDisabled && !isLoading && !optionsLoaded) {
    onFetch()
    setOptionsLoaded(true)
  }

  return(
      <Select
        defaultValue={defaultValue}
        isClearable
        isSearchable
        isLoading={isLoading}
        isDisabled={isDisabled}
        options={options}
        filterOption={createFilter(filterConfig)}
        onChange={handleOnChange}
        onInputChange={handleSetSearchInput}
        {...props}
      />
  )
}

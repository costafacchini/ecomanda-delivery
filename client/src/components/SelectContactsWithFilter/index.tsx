import React, { useState, useEffect } from 'react'
import Select, { createFilter, SingleValue } from 'react-select'
import debounce from 'lodash/debounce'
import { getContacts } from '../../services/contact'
import type { IContactFilters } from '../../types'

interface IContactOption {
  value: string
  label: string
  [key: string]: unknown
}

interface SelectContactsWithFilterProps {
  isDisabled?: boolean
  onChange: (value: SingleValue<IContactOption>) => void
  selectedItem?: string | IContactOption | null
  licensee?: string
  name?: string
  'aria-labelledby'?: string
  [key: string]: unknown
}

export default function SelectContactsWithFilter({
  isDisabled,
  onChange,
  selectedItem,
  licensee,
  ...props
}: SelectContactsWithFilterProps) {
  const [defaultValue, setDefaultValue] = useState<IContactOption | null>(null)
  const [selectedOption, setSelectedOption] = useState<IContactOption | null>(null)
  const [options, setOptions] = useState<IContactOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [optionsLoaded, setOptionsLoaded] = useState(false)
  const [selectedLicensee, setSelectedLicensee] = useState(licensee)

  useEffect(() => {
    setSelectedLicensee(licensee)
  }, [licensee])

  const filterConfig = {
    ignoreCase: true,
    ignoreAccents: true,
    trim: true,
    matchFrom: 'any' as const
  }

  function handleOnChange(value: SingleValue<IContactOption>) {
    if (value !== selectedOption) {
      setSelectedOption(value)

      onChange(value)
    }
  }

  function transformData(values: Array<{ _id: string; name: string; number?: string }>) {
    return values.map((value) => ({ value: value._id, label: `${value.name}  |  ${value.number}` }))
  }

  function handleSetSearchInput(value: string) {
    if (value.length > 2) handleFetch(value)
  }

  async function onFetch(value?: string) {
    try {
      setIsLoading(true)
      const filters: IContactFilters & { expression?: string; active?: boolean } = { expression: value, active: true }
      if (selectedLicensee) {
        filters.licensee = selectedLicensee
      }
      const { data: contacts } = await getContacts(filters)

      setOptions(transformData(contacts as unknown as Array<{ _id: string; name: string; number?: string }>))
    } catch (_) {}
    setIsLoading(false)
  }

  const handleFetch = debounce(onFetch, 500)

  if (selectedItem && !defaultValue) {
    const item = selectedItem as IContactOption
    const optionValue = (item._id as string | undefined) ?? item.value
    const optionLabel = (item.name as string | undefined) ?? item.label
    const newSelectedOption: IContactOption = { ...item, value: optionValue, label: optionLabel }

    const hasItem = options.find((opt) => opt.value === newSelectedOption.value)
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

  return (
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

import { useEffect, useState } from "react"
import { getLicensees } from '../../services/licensees'

export default function LicenseeTypeahead(props) {
  const [licensees, setLicensees] = useState([])

  useEffect(() => {
    async function fetchLicensees() {
      const { data: licensees } = await getLicensees()
      setLicensees(licensees)
    }

    fetchLicensees()
  }, [])

  return (
    <select {...props}>
      <option value=''>Nenhum selecionado</option>
      {licensees.map((licensee) => (
        <option key={licensee.name} value={licensee.id}>{licensee.name}</option>
      ))}
    </select>
  )
}

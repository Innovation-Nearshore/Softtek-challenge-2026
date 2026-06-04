import { useInitiatives } from '../context/InitiativesContext'
import InitiativeForm from '../components/InitiativeForm'

export default function NewInitiative() {
  const { addInitiative } = useInitiatives()

  return (
    <InitiativeForm
      title="Nueva Iniciativa"
      onSubmit={addInitiative}
    />
  )
}

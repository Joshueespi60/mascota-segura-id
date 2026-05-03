import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import RegisterPet from './pages/RegisterPet'
import PetLanding from './pages/PetLanding'
import MaintenanceScreen from './components/MaintenanceScreen'

function App() {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode) {
    return <MaintenanceScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registro" element={<RegisterPet />} />
      <Route path="/mascota/:id" element={<PetLanding />} />
    </Routes>
  )
}

export default App

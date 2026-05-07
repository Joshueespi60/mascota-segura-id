import { Route, Routes } from 'react-router'
import MaintenanceScreen from './components/MaintenanceScreen'
import AdminQRGenerator from './pages/AdminQRGenerator'
import Home from './pages/Home'
import PetLanding from './pages/PetLanding'
import QRRegister from './pages/QRRegister'
import QRResolver from './pages/QRResolver'
import RegisterPet from './pages/RegisterPet'

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
      <Route path="/qr/:qrId/registro" element={<QRRegister />} />
      <Route path="/qr/:qrId" element={<QRResolver />} />
      <Route path="/admin/qr" element={<AdminQRGenerator />} />
    </Routes>
  )
}

export default App

import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import RegisterPet from './pages/RegisterPet'
import PetLanding from './pages/PetLanding'
import { emptyPet } from './data/demoPet'
import { savePet } from './data/petsStorage'

function App() {
  const handleSavePet = (formData) => savePet(formData)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/registro"
        element={
          <RegisterPet
            initialData={emptyPet}
            onSave={handleSavePet}
          />
        }
      />
      <Route path="/mascota/:id" element={<PetLanding />} />
    </Routes>
  )
}

export default App

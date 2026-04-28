const PETS_STORAGE_KEY = 'pets'

function getSafeStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

export function getPetsFromStorage() {
  const storage = getSafeStorage()
  if (!storage) {
    return []
  }

  try {
    const storedPets = storage.getItem(PETS_STORAGE_KEY)
    if (!storedPets) {
      return []
    }

    const parsed = JSON.parse(storedPets)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePetsToStorage(pets) {
  const storage = getSafeStorage()
  if (!storage) {
    return
  }

  storage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets))
}

export function generatePetId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `pet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createPetRecord(formData) {
  return {
    id: generatePetId(),
    nombre: formData.nombre,
    raza: formData.raza,
    edad: formData.edad,
    nombreDueno: formData.nombreDueno,
    telefono: formData.telefono,
    foto: formData.foto,
    createdAt: new Date().toISOString(),
  }
}

export function savePet(formData) {
  const pet = createPetRecord(formData)
  const pets = getPetsFromStorage()
  const nextPets = [...pets, pet]
  savePetsToStorage(nextPets)
  return pet
}

export function findPetById(id) {
  if (!id) {
    return null
  }

  const pets = getPetsFromStorage()
  return pets.find((pet) => pet.id === id) || null
}

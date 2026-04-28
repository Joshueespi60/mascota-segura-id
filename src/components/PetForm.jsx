import { useState } from 'react'
import { useNavigate } from 'react-router'
import { emptyPet } from '../data/demoPet'
import { createPet } from '../services/petService'

function PetForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => ({ ...emptyPet }))
  const [imageFile, setImageFile] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setPhotoName('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecciona un archivo de imagen valido.')
      setImageFile(null)
      setPhotoName('')
      return
    }

    setImageFile(file)
    setPhotoName(file.name)
    setErrorMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      nombre: formData.nombre.trim(),
      raza: formData.raza.trim(),
      edad: formData.edad.trim(),
      nombreDueno: formData.nombreDueno.trim(),
      telefono: formData.telefono.trim(),
    }

    const hasMissingField = Object.values(payload).some((value) => !value)
    if (hasMissingField || !imageFile) {
      setErrorMessage('Completa todos los campos y sube una foto.')
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')
      const createdPet = await createPet(payload, imageFile)
      navigate(`/mascota/${createdPet.id}`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la mascota. Intenta de nuevo.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="pet-photo"
          className="block text-sm font-semibold text-slate-700"
        >
          Foto de la mascota
        </label>
        <input
          id="pet-photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={isSaving}
          className="block w-full rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="text-xs text-slate-500">
          {photoName || 'Sube una foto clara para la pagina publica.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="pet-name"
            className="block text-sm font-semibold text-slate-700"
          >
            Nombre
          </label>
          <input
            id="pet-name"
            type="text"
            value={formData.nombre}
            onChange={updateField('nombre')}
            placeholder="Ej: Kira"
            disabled={isSaving}
            className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pet-breed"
            className="block text-sm font-semibold text-slate-700"
          >
            Raza
          </label>
          <input
            id="pet-breed"
            type="text"
            value={formData.raza}
            onChange={updateField('raza')}
            placeholder="Ej: Golden Retriever"
            disabled={isSaving}
            className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pet-age"
            className="block text-sm font-semibold text-slate-700"
          >
            Edad
          </label>
          <input
            id="pet-age"
            type="text"
            value={formData.edad}
            onChange={updateField('edad')}
            placeholder="Ej: 4 anios"
            disabled={isSaving}
            className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="owner-name"
            className="block text-sm font-semibold text-slate-700"
          >
            Nombre del duenio
          </label>
          <input
            id="owner-name"
            type="text"
            value={formData.nombreDueno}
            onChange={updateField('nombreDueno')}
            placeholder="Ej: Ana Torres"
            disabled={isSaving}
            className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="owner-phone"
          className="block text-sm font-semibold text-slate-700"
        >
          Telefono de contacto
        </label>
        <input
          id="owner-phone"
          type="tel"
          value={formData.telefono}
          onChange={updateField('telefono')}
          placeholder="Ej: 0985415236"
          disabled={isSaving}
          className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:bg-orange-300 sm:w-auto"
      >
        {isSaving ? 'Guardando...' : 'Guardar y ver landing publica'}
      </button>
    </form>
  )
}

export default PetForm

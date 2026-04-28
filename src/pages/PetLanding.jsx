import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import PetPublicCard from '../components/PetPublicCard'
import QRCodeBox from '../components/QRCodeBox'
import { getPetById } from '../services/petService'

function PetLanding() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadPet = async () => {
      if (!id) {
        if (isMounted) {
          setPet(null)
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        const foundPet = await getPetById(id)
        if (isMounted) {
          setPet(foundPet)
        }
      } catch {
        if (isMounted) {
          setPet(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPet()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-900/10">
            <p className="text-base font-semibold text-slate-700">Cargando mascota...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!pet || !pet.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-xl shadow-blue-900/10">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Mascota no encontrada
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Verifica el enlace o registra una nueva mascota.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Ir al inicio
              </Link>
              <Link
                to="/registro"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Registrar mascota
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            Inicio
          </Link>
          <Link
            to="/registro"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Registrar otra mascota
          </Link>
        </div>
        <PetPublicCard pet={pet} />
        <QRCodeBox pet={pet} />
      </main>
    </div>
  )
}

export default PetLanding

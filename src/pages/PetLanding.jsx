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
      <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-brand-secondary/30 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <p className="text-base font-semibold text-brand-text/85">Cargando mascota...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!pet || !pet.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-brand-secondary/35 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <h1 className="text-2xl font-extrabold text-brand-text">
              Mascota no encontrada
            </h1>
            <p className="mt-3 text-sm text-brand-text/75 sm:text-base">
              Verifica el enlace o registra una nueva mascota.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-bg"
              >
                Ir al inicio
              </Link>
              <Link
                to="/registro"
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A24F30]"
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
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-bg"
          >
            Inicio
          </Link>
          <Link
            to="/registro"
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A24F30]"
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

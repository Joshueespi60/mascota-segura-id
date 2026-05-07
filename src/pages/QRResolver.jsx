import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import PetPublicCard from '../components/PetPublicCard'
import QRStatusBadge from '../components/QRStatusBadge'
import Home from './Home'
import { getPetByQrId } from '../services/petService'
import { getQrCodeById } from '../services/qrService'
import { normalizeQrId } from '../utils/qrId'

function QRResolver() {
  const { qrId: rawQrId } = useParams()
  const qrId = useMemo(() => normalizeQrId(rawQrId), [rawQrId])

  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [qrCode, setQrCode] = useState(null)
  const [pet, setPet] = useState(null)

  useEffect(() => {
    let isMounted = true

    const resolveQr = async () => {
      if (!qrId) {
        if (isMounted) {
          setView('invalid')
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')
        setView('loading')
        setPet(null)

        const qrRecord = await getQrCodeById(qrId)
        if (!isMounted) {
          return
        }

        if (!qrRecord) {
          setView('invalid')
          setQrCode(null)
          return
        }

        setQrCode(qrRecord)

        if (qrRecord.status === 'available') {
          setView('available')
          return
        }

        if (qrRecord.status === 'disabled') {
          setView('disabled')
          return
        }

        if (qrRecord.status === 'registered') {
          const foundPet = await getPetByQrId(qrRecord.qrId)

          if (!isMounted) {
            return
          }

          if (foundPet?.id) {
            setPet(foundPet)
            setView('registered')
          } else {
            setView('inconsistent')
          }

          return
        }

        setView('error')
        setErrorMessage('El estado del QR no es reconocido por la aplicacion.')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setView('error')
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo validar el codigo QR. Intenta nuevamente.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    resolveQr()

    return () => {
      isMounted = false
    }
  }, [qrId])

  const collarLabel = qrCode?.qrId || qrId || 'QR-UNKNOWN'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-brand-secondary/30 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <p className="text-base font-semibold text-brand-text/85">Validando el codigo QR...</p>
          </div>
        </main>
      </div>
    )
  }

  if (view === 'available') {
    return <Home qrId={collarLabel} isQrEntry />
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
          <span className="rounded-full border border-brand-secondary/45 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
            Collar {collarLabel}
          </span>
        </div>

        {view === 'registered' && pet ? (
          <>
            <div className="mb-5 rounded-2xl border border-brand-secondary/35 bg-white p-4 text-sm text-brand-text/85 shadow-lg shadow-brand-text/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-brand-text">QR vinculado correctamente</p>
                <QRStatusBadge status={qrCode?.status} />
              </div>
              <p className="mt-1">Este collar ya esta asociado a la mascota registrada.</p>
            </div>
            <PetPublicCard pet={pet} />
          </>
        ) : null}

        {view === 'invalid' ? (
          <section className="rounded-3xl border border-brand-secondary/35 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <h1 className="text-2xl font-extrabold text-brand-text">QR invalido</h1>
            <p className="mt-3 text-sm text-brand-text/75 sm:text-base">
              Este codigo no existe en el inventario de collares.
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
                Registro general
              </Link>
            </div>
          </section>
        ) : null}

        {view === 'disabled' ? (
          <section className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <div className="mb-4 flex justify-center">
              <QRStatusBadge status={qrCode?.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-text">QR desactivado</h1>
            <p className="mt-3 text-sm text-brand-text/75 sm:text-base">
              Este collar fue desactivado y no acepta nuevos registros.
            </p>
          </section>
        ) : null}

        {view === 'inconsistent' ? (
          <section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <h1 className="text-2xl font-extrabold text-brand-text">Inconsistencia detectada</h1>
            <p className="mt-3 text-sm text-brand-text/75 sm:text-base">
              El QR aparece como registrado, pero no se encontro la mascota asociada.
            </p>
            <p className="mt-2 text-xs text-brand-text/60">
              Contacta al equipo administrador para revisar este collar.
            </p>
          </section>
        ) : null}

        {view === 'error' ? (
          <section className="rounded-3xl border border-brand-secondary/35 bg-white p-8 text-center shadow-xl shadow-brand-text/10">
            <h1 className="text-2xl font-extrabold text-brand-text">No se pudo resolver el QR</h1>
            <p className="mt-3 text-sm text-brand-text/75 sm:text-base">
              {errorMessage || 'Ocurrio un error inesperado al consultar Supabase.'}
            </p>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default QRResolver

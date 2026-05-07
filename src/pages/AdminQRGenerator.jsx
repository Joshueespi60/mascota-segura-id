import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import QRStatusBadge from '../components/QRStatusBadge'
import { createQrCode, listQrCodes, markQrAsDisabled } from '../services/qrService'

const ADMIN_SESSION_KEY = 'mascotasegura_admin_qr_unlocked'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function buildQrPublicUrl(qrId) {
  const encodedId = encodeURIComponent(qrId)
  if (typeof window === 'undefined') {
    return `/qr/${encodedId}`
  }

  return `${window.location.origin}/qr/${encodedId}`
}

function AdminQRGenerator() {
  const configuredPin = (import.meta.env.VITE_ADMIN_QR_PIN || '').trim()
  const requiresPin = configuredPin.length > 0

  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!requiresPin) {
      return true
    }

    if (typeof window === 'undefined') {
      return false
    }

    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  })

  const [qrCodes, setQrCodes] = useState([])
  const [selectedQrId, setSelectedQrId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [copyState, setCopyState] = useState({ qrId: '', status: 'idle' })
  const [downloadError, setDownloadError] = useState('')
  const [isDisabling, setIsDisabling] = useState('')

  useEffect(() => {
    if (!isUnlocked) {
      return
    }

    let isMounted = true

    const loadCodes = async () => {
      try {
        setIsLoading(true)
        setLoadError('')
        const data = await listQrCodes()

        if (!isMounted) {
          return
        }

        setQrCodes(data)
        setSelectedQrId((current) => {
          if (current && data.some((item) => item.qrId === current)) {
            return current
          }

          return data[0]?.qrId || ''
        })
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el inventario de QR.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCodes()

    return () => {
      isMounted = false
    }
  }, [isUnlocked])

  const selectedQr = useMemo(
    () => qrCodes.find((item) => item.qrId === selectedQrId) || null,
    [qrCodes, selectedQrId],
  )

  const selectedQrUrl = selectedQr ? buildQrPublicUrl(selectedQr.qrId) : ''

  const unlockWithPin = (event) => {
    event.preventDefault()

    if (pinInput.trim() !== configuredPin) {
      setPinError('PIN incorrecto. Intenta nuevamente.')
      return
    }

    setPinError('')
    setPinInput('')
    setIsUnlocked(true)

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    }
  }

  const handleLogout = () => {
    setIsUnlocked(false)
    setPinError('')

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
    }
  }

  const handleCreateQr = async () => {
    try {
      setIsGenerating(true)
      setCreateError('')
      const newQr = await createQrCode()

      setQrCodes((current) => [newQr, ...current.filter((item) => item.qrId !== newQr.qrId)])
      setSelectedQrId(newQr.qrId)
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'No se pudo crear el código QR.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyUrl = async (qrId) => {
    const qrUrl = buildQrPublicUrl(qrId)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qrUrl)
      } else {
        const input = document.createElement('textarea')
        input.value = qrUrl
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.focus()
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }

      setCopyState({ qrId, status: 'copied' })
      setTimeout(() => setCopyState({ qrId: '', status: 'idle' }), 2000)
    } catch {
      setCopyState({ qrId, status: 'error' })
      setTimeout(() => setCopyState({ qrId: '', status: 'idle' }), 2000)
    }
  }

  const downloadSvg = () => {
    setDownloadError('')

    const svgElement = document.getElementById('admin-qr-svg')
    if (!(svgElement instanceof SVGElement) || !selectedQr) {
      setDownloadError('No se pudo preparar el SVG para descargar.')
      return
    }

    if (!svgElement.getAttribute('xmlns')) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    const serializer = new XMLSerializer()
    const svgContent = serializer.serializeToString(svgElement)
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${selectedQr.qrId}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  }

  const downloadPng = () => {
    setDownloadError('')

    const canvasElement = document.getElementById('admin-qr-canvas')
    if (!(canvasElement instanceof HTMLCanvasElement) || !selectedQr) {
      setDownloadError('No se pudo preparar el PNG para descargar.')
      return
    }

    const dataUrl = canvasElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${selectedQr.qrId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDisableQr = async (qrId) => {
    try {
      setIsDisabling(qrId)
      const updatedQr = await markQrAsDisabled(qrId)

      setQrCodes((current) =>
        current.map((item) => (item.qrId === qrId ? updatedQr : item)),
      )
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo desactivar el código QR.',
      )
    } finally {
      setIsDisabling('')
    }
  }

  if (requiresPin && !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
        <main className="mx-auto w-full max-w-xl">
          <section className="rounded-3xl border border-brand-secondary/30 bg-white p-6 shadow-xl shadow-brand-text/10 sm:p-8">
            <h1 className="text-2xl font-extrabold text-brand-text">Acceso al panel de QR</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-text/75">
              Ingresa el PIN de administración para generar y gestionar collares.
            </p>

            <form className="mt-6 space-y-4" onSubmit={unlockWithPin}>
              <div className="space-y-2">
                <label htmlFor="admin-pin" className="block text-sm font-semibold text-brand-text/90">
                  PIN de administrador
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(event) => setPinInput(event.target.value)}
                  className="w-full rounded-xl border border-brand-secondary/45 bg-white px-4 py-3 text-sm text-brand-text shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/45"
                  placeholder="Ingresa tu PIN"
                />
              </div>

              {pinError ? (
                <p className="rounded-lg border border-brand-secondary/45 bg-brand-bg px-4 py-2 text-sm font-medium text-brand-primary">
                  {pinError}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-[#A24F30]"
              >
                Entrar al panel
              </button>
            </form>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
              Panel admin de QR únicos
            </h1>
            <p className="text-sm text-brand-text/75">
              Genera collares, copia enlaces y monitorea su estado en tiempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-bg"
            >
              Inicio
            </Link>
            {requiresPin ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-bg"
              >
                Cerrar sesión
              </button>
            ) : null}
          </div>
        </div>

        {!requiresPin ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            `VITE_ADMIN_QR_PIN` no está configurado. Este panel quedó abierto para entorno local.
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <article className="rounded-3xl border border-brand-secondary/30 bg-white p-6 shadow-xl shadow-brand-text/10">
            <h2 className="text-lg font-bold text-brand-text">Generar nuevo QR</h2>
            <p className="mt-2 text-sm text-brand-text/75">
              Cada botón crea un ID irrepetible con formato `COLLAR-XXXXXXXXXX`.
            </p>

            <button
              type="button"
              onClick={handleCreateQr}
              disabled={isGenerating}
              className="mt-5 w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-[#A24F30] disabled:cursor-not-allowed disabled:bg-brand-secondary"
            >
              {isGenerating ? 'Generando...' : 'Generar QR único'}
            </button>

            {createError ? (
              <p className="mt-4 rounded-lg border border-brand-secondary/45 bg-brand-bg px-4 py-2 text-sm font-medium text-brand-primary">
                {createError}
              </p>
            ) : null}

            {selectedQr ? (
              <div className="mt-6 rounded-2xl border border-brand-secondary/35 bg-brand-bg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-brand-text">QR seleccionado</p>
                  <QRStatusBadge status={selectedQr.status} />
                </div>
                <p className="mt-2 text-xs text-brand-text/70">{selectedQr.qrId}</p>
                <div className="mt-4 flex justify-center rounded-2xl border border-brand-secondary/30 bg-white p-4">
                  <QRCodeSVG
                    id="admin-qr-svg"
                    value={selectedQrUrl}
                    size={230}
                    bgColor="#FFF8F2"
                    fgColor="#4A2E24"
                    level="H"
                    includeMargin
                  />
                  <QRCodeCanvas
                    id="admin-qr-canvas"
                    value={selectedQrUrl}
                    size={230}
                    bgColor="#FFF8F2"
                    fgColor="#4A2E24"
                    level="H"
                    includeMargin
                    className="hidden"
                  />
                </div>
                <p className="mt-3 break-all text-xs text-brand-text/70">{selectedQrUrl}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(selectedQr.qrId)}
                    className="rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
                  >
                    {copyState.qrId === selectedQr.qrId && copyState.status === 'copied'
                      ? 'Enlace copiado'
                      : copyState.qrId === selectedQr.qrId && copyState.status === 'error'
                        ? 'Error al copiar'
                        : 'Copiar URL'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPng}
                    className="rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
                  >
                    Descargar PNG
                  </button>
                  <button
                    type="button"
                    onClick={downloadSvg}
                    className="rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
                  >
                    Descargar SVG
                  </button>
                </div>

                {downloadError ? (
                  <p className="mt-3 rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-medium text-brand-primary">
                    {downloadError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-brand-secondary/35 bg-brand-bg p-4 text-sm text-brand-text/75">
                Aún no hay QR disponibles. Genera el primero para comenzar.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-brand-secondary/30 bg-white p-6 shadow-xl shadow-brand-text/10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-brand-text">Inventario de QR</h2>
              <span className="rounded-full border border-brand-secondary/45 bg-brand-bg px-3 py-1 text-xs font-semibold text-brand-primary">
                {qrCodes.length} total
              </span>
            </div>

            {loadError ? (
              <p className="mt-4 rounded-lg border border-brand-secondary/45 bg-brand-bg px-4 py-2 text-sm font-medium text-brand-primary">
                {loadError}
              </p>
            ) : null}

            {isLoading ? (
              <p className="mt-5 text-sm text-brand-text/75">Cargando códigos QR...</p>
            ) : null}

            {!isLoading && !qrCodes.length ? (
              <p className="mt-5 text-sm text-brand-text/75">
                No hay registros todavía. Crea el primero desde el panel izquierdo.
              </p>
            ) : null}

            {!isLoading && qrCodes.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-brand-text/65">
                      <th className="px-3 py-2">QR ID</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Creado</th>
                      <th className="px-3 py-2">Registrado</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((item) => (
                      <tr key={item.qrId} className="rounded-xl border border-brand-secondary/20 bg-brand-bg/40">
                        <td className="rounded-l-xl px-3 py-3 font-semibold text-brand-text">
                          {item.qrId}
                        </td>
                        <td className="px-3 py-3">
                          <QRStatusBadge status={item.status} />
                        </td>
                        <td className="px-3 py-3 text-xs text-brand-text/75">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-xs text-brand-text/75">
                          {formatDateTime(item.registeredAt)}
                        </td>
                        <td className="rounded-r-xl px-3 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedQrId(item.qrId)}
                              className="rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
                            >
                              Ver QR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(item.qrId)}
                              className="rounded-lg border border-brand-secondary/45 bg-white px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
                            >
                              {copyState.qrId === item.qrId && copyState.status === 'copied'
                                ? 'Copiado'
                                : copyState.qrId === item.qrId && copyState.status === 'error'
                                  ? 'Error'
                                  : 'Copiar URL'}
                            </button>
                            {item.status !== 'disabled' ? (
                              <button
                                type="button"
                                onClick={() => handleDisableQr(item.qrId)}
                                disabled={isDisabling === item.qrId}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isDisabling === item.qrId ? 'Desactivando...' : 'Desactivar'}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </article>
        </section>
      </main>
    </div>
  )
}

export default AdminQRGenerator

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function QRCodeBox({ pet }) {
  const [copyState, setCopyState] = useState('idle')
  const publicUrl = `${window.location.origin}/mascota/${pet.id}`

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl)
      } else {
        const input = document.createElement('textarea')
        input.value = publicUrl
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.focus()
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }

      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-brand-secondary/30 bg-white p-5 shadow-lg shadow-brand-secondary/20 sm:p-6">
      <h2 className="text-lg font-bold text-brand-text">Codigo QR publico</h2>
      <div className="mt-4 flex justify-center rounded-2xl border border-brand-secondary/25 bg-brand-bg p-6">
        <QRCodeSVG
          value={publicUrl}
          size={240}
          bgColor="#FFF8F2"
          fgColor="#4A2E24"
          level="H"
          includeMargin
        />
      </div>
      <p className="mt-4 text-center text-sm leading-relaxed text-brand-text/75">
        Escanea este código para ver el perfil público de la mascota.
      </p>
      <p className="mt-2 break-all text-center text-xs text-brand-text/60">{publicUrl}</p>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-lg border border-brand-secondary/45 bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-secondary/20"
        >
          {copyState === 'copied'
            ? 'Enlace copiado'
            : copyState === 'error'
              ? 'No se pudo copiar'
              : 'Copiar enlace'}
        </button>
      </div>
    </section>
  )
}

export default QRCodeBox

import { Link } from 'react-router'
import QRStatusBadge from '../components/QRStatusBadge'

function QRWelcome({ qrId, status }) {
  const encodedQrId = encodeURIComponent(qrId)

  return (
    <section className="rounded-3xl border border-brand-secondary/30 bg-white p-6 shadow-xl shadow-brand-text/10 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
          Bienvenido a MascotaSegura ID
        </h1>
        <QRStatusBadge status={status} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-brand-text/80 sm:text-base">
        Este collar aun no tiene una mascota registrada. Antes de completar el formulario,
        revisa que tengas a mano la foto de tu mascota y los datos de contacto.
      </p>

      <div className="mt-5 rounded-2xl border border-brand-secondary/35 bg-brand-bg p-4 text-sm text-brand-text/85">
        <p className="font-semibold text-brand-primary">Que incluye el registro</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Perfil publico con foto y datos clave de identificacion.</li>
          <li>Enlace directo para contactar al tutor si la mascota se pierde.</li>
          <li>Vinculacion unica al collar {qrId}.</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/qr/${encodedQrId}/registro`}
          className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-[#A24F30]"
        >
          Registrar mascota
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-brand-secondary/45 bg-white px-5 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-secondary/15"
        >
          Ir al inicio
        </Link>
      </div>
    </section>
  )
}

export default QRWelcome

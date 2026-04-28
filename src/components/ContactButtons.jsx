import {
  getEcuadorTelHref,
  getEcuadorWhatsAppHref,
} from '../utils/phone'

function ContactButtons({ telefono, nombreMascota }) {
  const telHref = getEcuadorTelHref(telefono)
  const whatsappHref = getEcuadorWhatsAppHref(telefono, nombreMascota)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a
        href={telHref}
        className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Llamar ahora
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        WhatsApp
      </a>
    </div>
  )
}

export default ContactButtons

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
        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#A24F30]"
      >
        Llamar ahora
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-brand-secondary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#D98A58]"
      >
        WhatsApp
      </a>
    </div>
  )
}

export default ContactButtons

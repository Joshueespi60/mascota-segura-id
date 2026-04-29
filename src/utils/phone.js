export function normalizeEcuadorPhone(phone) {
  const onlyDigits = String(phone || '').replace(/\D/g, '')

  if (!onlyDigits) {
    return ''
  }

  if (onlyDigits.startsWith('593')) {
    return onlyDigits
  }

  if (onlyDigits.startsWith('0') && onlyDigits.length === 10) {
    return `593${onlyDigits.slice(1)}`
  }

  return onlyDigits
}

export function getEcuadorTelHref(phone) {
  const normalized = normalizeEcuadorPhone(phone)
  return `tel:+${normalized}`
}

export function getEcuadorWhatsAppHref(phone, petName) {
  const normalized = normalizeEcuadorPhone(phone)
  const message = encodeURIComponent(
    `Hola, encontré a ${petName}. Te contacto desde MascotaSegura ID.`,
  )

  return `https://wa.me/${normalized}?text=${message}`
}

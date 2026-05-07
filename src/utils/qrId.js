const QR_PREFIX = 'COLLAR-'
const QR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const DEFAULT_QR_LENGTH = 10

function getCryptoRandomValues(size) {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(size))
  }

  return null
}

export function normalizeQrId(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export function generateQrId(length = DEFAULT_QR_LENGTH) {
  const targetLength = Number.isFinite(length) && length > 0 ? Math.floor(length) : DEFAULT_QR_LENGTH
  const randomValues = getCryptoRandomValues(targetLength)

  let result = ''
  for (let index = 0; index < targetLength; index += 1) {
    const randomNumber = randomValues
      ? randomValues[index]
      : Math.floor(Math.random() * 1_000_000_000)
    result += QR_ALPHABET[randomNumber % QR_ALPHABET.length]
  }

  return `${QR_PREFIX}${result}`
}

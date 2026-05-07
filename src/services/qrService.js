import { supabase } from './supabaseClient'
import { generateQrId, normalizeQrId } from '../utils/qrId'

const MAX_QR_GENERATION_ATTEMPTS = 12

function isDuplicateQrError(error) {
  if (!error) {
    return false
  }

  return error.code === '23505' || /duplicate|unique/i.test(error.message || '')
}

function mapQrCodeRow(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    qrId: row.qr_id,
    status: row.status,
    createdAt: row.created_at,
    registeredAt: row.registered_at,
    disabledAt: row.disabled_at,
    notes: row.notes || '',
  }
}

function toFriendlyDeleteError(error) {
  if (!error) {
    return 'No se pudo eliminar el codigo QR.'
  }

  if (error.code === '23503') {
    return 'No se puede eliminar este QR porque aun tiene datos vinculados.'
  }

  if (error.code === '42501') {
    return 'No tienes permisos para eliminar este codigo QR.'
  }

  return 'No se pudo eliminar el codigo QR. Intenta nuevamente.'
}

export function generateUniqueQrId() {
  return generateQrId(10)
}

export async function createQrCode() {
  for (let attempt = 0; attempt < MAX_QR_GENERATION_ATTEMPTS; attempt += 1) {
    const qrId = generateUniqueQrId()

    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        qr_id: qrId,
        status: 'available',
      })
      .select('*')
      .single()

    if (!error) {
      return mapQrCodeRow(data)
    }

    if (!isDuplicateQrError(error)) {
      throw new Error('No se pudo crear el QR. Intenta de nuevo.')
    }
  }

  throw new Error('No se pudo generar un ID unico. Intenta nuevamente.')
}

export async function listQrCodes() {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar los codigos QR.')
  }

  return (data || []).map(mapQrCodeRow)
}

export async function getQrCodeById(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    return null
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('qr_id', normalizedQrId)
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo validar el codigo QR.')
  }

  return mapQrCodeRow(data)
}

async function getQrCodeOrThrow(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El codigo QR no es valido.')
  }

  const qrCode = await getQrCodeById(normalizedQrId)
  if (!qrCode) {
    throw new Error('No se encontro el codigo QR indicado.')
  }

  return qrCode
}

export async function markQrAsRegistered(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El codigo QR no es valido.')
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      status: 'registered',
      registered_at: new Date().toISOString(),
      disabled_at: null,
    })
    .eq('qr_id', normalizedQrId)
    .eq('status', 'available')
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo actualizar el estado del QR.')
  }

  if (!data) {
    throw new Error('El QR ya no esta disponible para registro.')
  }

  return mapQrCodeRow(data)
}

export async function markQrAsDisabled(qrId) {
  const qrCode = await getQrCodeOrThrow(qrId)

  if (qrCode.status === 'disabled') {
    return qrCode
  }

  if (qrCode.status === 'registered') {
    throw new Error(
      'No se puede desactivar un QR registrado desde este panel sin desvincular la mascota.',
    )
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      status: 'disabled',
      disabled_at: new Date().toISOString(),
    })
    .eq('qr_id', qrCode.qrId)
    .eq('status', 'available')
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo desactivar el codigo QR.')
  }

  if (!data) {
    throw new Error('El QR no esta disponible para desactivar en este momento.')
  }

  return mapQrCodeRow(data)
}

export async function markQrAsAvailable(qrId) {
  const qrCode = await getQrCodeOrThrow(qrId)

  if (qrCode.status === 'available') {
    return qrCode
  }

  if (qrCode.status === 'registered') {
    throw new Error('No se puede activar un QR registrado desde este panel.')
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      status: 'available',
      disabled_at: null,
    })
    .eq('qr_id', qrCode.qrId)
    .eq('status', 'disabled')
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo activar el codigo QR.')
  }

  if (!data) {
    throw new Error('El QR no esta desactivado actualmente.')
  }

  return mapQrCodeRow(data)
}

export async function deleteQrCode(qrId) {
  const qrCode = await getQrCodeOrThrow(qrId)

  if (qrCode.status === 'registered') {
    throw new Error(
      'Este QR ya tiene una mascota registrada. Para eliminarlo primero debes desvincular o eliminar el registro de la mascota.',
    )
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('qr_id', qrCode.qrId)
    .select('qr_id')
    .maybeSingle()

  if (error) {
    throw new Error(toFriendlyDeleteError(error))
  }

  if (!data) {
    throw new Error('No se pudo confirmar la eliminacion del codigo QR.')
  }

  return true
}

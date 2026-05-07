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

  throw new Error('No se pudo generar un ID único. Intenta nuevamente.')
}

export async function listQrCodes() {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No se pudieron cargar los códigos QR.')
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
    throw new Error('No se pudo validar el código QR.')
  }

  return mapQrCodeRow(data)
}

export async function markQrAsRegistered(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El código QR no es válido.')
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
    throw new Error('El QR ya no está disponible para registro.')
  }

  return mapQrCodeRow(data)
}

export async function markQrAsDisabled(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El código QR no es válido.')
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      status: 'disabled',
      disabled_at: new Date().toISOString(),
    })
    .eq('qr_id', normalizedQrId)
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo desactivar el código QR.')
  }

  if (!data) {
    throw new Error('No se encontró el código QR que intentas desactivar.')
  }

  return mapQrCodeRow(data)
}

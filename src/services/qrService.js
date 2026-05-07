import { supabase } from './supabaseClient'
import { generateQrId, normalizeQrId } from '../utils/qrId'

const MAX_QR_GENERATION_ATTEMPTS = 12
const PET_PHOTOS_BUCKET = 'pet-photos'

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

function extractStoragePathFromPhotoUrl(fotoUrl) {
  if (typeof fotoUrl !== 'string') {
    return null
  }

  const trimmedUrl = fotoUrl.trim()
  if (!trimmedUrl) {
    return null
  }

  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl.replace(/^\/+/, '')
  }

  const storagePathPrefixes = [
    `/storage/v1/object/public/${PET_PHOTOS_BUCKET}/`,
    `/storage/v1/object/sign/${PET_PHOTOS_BUCKET}/`,
    `/storage/v1/render/image/public/${PET_PHOTOS_BUCKET}/`,
    `/object/public/${PET_PHOTOS_BUCKET}/`,
    `/object/sign/${PET_PHOTOS_BUCKET}/`,
    `/render/image/public/${PET_PHOTOS_BUCKET}/`,
  ]

  try {
    const parsed = new URL(trimmedUrl)
    const pathName = decodeURIComponent(parsed.pathname || '')

    for (const prefix of storagePathPrefixes) {
      const prefixIndex = pathName.indexOf(prefix)
      if (prefixIndex === -1) {
        continue
      }

      const relativePath = pathName.slice(prefixIndex + prefix.length).replace(/^\/+/, '')
      return relativePath || null
    }
  } catch {
    return null
  }

  return null
}

async function removePetPhotoIfPossible(fotoUrl) {
  const imagePath = extractStoragePathFromPhotoUrl(fotoUrl)
  if (!imagePath) {
    return {
      attempted: false,
      removed: false,
      reason: 'path_not_resolved',
    }
  }

  const { error } = await supabase.storage.from(PET_PHOTOS_BUCKET).remove([imagePath])
  if (error) {
    return {
      attempted: true,
      removed: false,
      reason: 'delete_failed',
    }
  }

  return {
    attempted: true,
    removed: true,
    reason: 'deleted',
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

export async function unlinkPetFromQr(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El codigo QR no es valido.')
  }

  const qrCode = await getQrCodeById(normalizedQrId)
  if (!qrCode) {
    throw new Error('No se encontro el codigo QR indicado.')
  }

  if (qrCode.status !== 'registered') {
    throw new Error('Este QR no esta registrado actualmente.')
  }

  const { data: petRow, error: findPetError } = await supabase
    .from('mascotas')
    .select('id, qr_id, foto_url')
    .eq('qr_id', qrCode.qrId)
    .maybeSingle()

  if (findPetError) {
    throw new Error('No se pudo buscar la mascota asociada a este QR.')
  }

  if (!petRow?.id) {
    throw new Error('No se encontro una mascota asociada a este QR.')
  }

  const { data: deletedPet, error: deletePetError } = await supabase
    .from('mascotas')
    .delete()
    .eq('id', petRow.id)
    .select('id')
    .maybeSingle()

  if (deletePetError) {
    if (deletePetError.code === '42501') {
      throw new Error('No se pudo eliminar la mascota. Revisa permisos de Supabase/RLS.')
    }

    throw new Error('No se pudo eliminar la mascota asociada a este QR.')
  }

  if (!deletedPet?.id) {
    throw new Error('No se pudo eliminar la mascota. Revisa permisos de Supabase/RLS.')
  }

  const photoCleanup = await removePetPhotoIfPossible(petRow.foto_url)

  const { data: releasedQrRow, error: releaseQrError } = await supabase
    .from('qr_codes')
    .update({
      status: 'available',
      registered_at: null,
      disabled_at: null,
    })
    .eq('qr_id', qrCode.qrId)
    .select('*')
    .maybeSingle()

  if (releaseQrError) {
    throw new Error('La mascota se elimino, pero no se pudo liberar el QR. Revisa permisos de Supabase/RLS.')
  }

  if (!releasedQrRow) {
    throw new Error('La mascota se elimino, pero no se pudo confirmar la liberacion del QR.')
  }

  return {
    message: 'Mascota desvinculada y QR liberado correctamente.',
    qrCode: mapQrCodeRow(releasedQrRow),
    removedPetId: deletedPet.id,
    photoCleanup,
  }
}

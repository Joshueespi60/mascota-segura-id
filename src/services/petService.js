import { normalizeEcuadorPhone } from '../utils/phone'
import { supabase } from './supabaseClient'
import { getQrCodeById, markQrAsRegistered } from './qrService'
import { normalizeQrId } from '../utils/qrId'

const PET_PHOTOS_BUCKET = 'pet-photos'

function getFileExtension(fileName) {
  const extension = fileName.split('.').pop()
  return extension ? extension.toLowerCase() : 'jpg'
}

function createUniqueImagePath(file) {
  const uniqueId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const extension = getFileExtension(file.name || 'image.jpg')
  return `mascotas/${uniqueId}.${extension}`
}

function mapPetRow(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    nombre: row.nombre,
    raza: row.raza,
    edad: row.edad,
    nombreDueno: row.nombre_dueno,
    telefono: row.telefono,
    telefonoNormalizado: row.telefono_normalizado,
    foto: row.foto_url,
    qrId: row.qr_id || null,
    createdAt: row.created_at,
  }
}

async function uploadPetImage(imageFile) {
  if (!imageFile) {
    throw new Error('Debes subir una foto de la mascota.')
  }

  const imagePath = createUniqueImagePath(imageFile)
  const { error: uploadError } = await supabase.storage
    .from(PET_PHOTOS_BUCKET)
    .upload(imagePath, imageFile, {
      upsert: false,
      contentType: imageFile.type || 'image/jpeg',
    })

  if (uploadError) {
    throw new Error('No se pudo subir la foto. Intenta de nuevo.')
  }

  const { data: publicUrlData } = supabase.storage
    .from(PET_PHOTOS_BUCKET)
    .getPublicUrl(imagePath)

  return {
    imagePath,
    fotoUrl: publicUrlData?.publicUrl || '',
  }
}

async function removePetImage(imagePath) {
  if (!imagePath) {
    return
  }

  await supabase.storage.from(PET_PHOTOS_BUCKET).remove([imagePath])
}

function isQrDuplicateError(error) {
  return (
    error?.code === '23505' &&
    (error?.message?.includes('qr_id') || error?.details?.includes('qr_id'))
  )
}

export async function createPet(petData, imageFile) {
  const { imagePath, fotoUrl } = await uploadPetImage(imageFile)
  const telefonoNormalizado = normalizeEcuadorPhone(petData.telefono)

  const { data, error } = await supabase
    .from('mascotas')
    .insert({
      nombre: petData.nombre,
      raza: petData.raza,
      edad: petData.edad,
      nombre_dueno: petData.nombreDueno,
      telefono: petData.telefono,
      telefono_normalizado: telefonoNormalizado,
      foto_url: fotoUrl,
    })
    .select('*')
    .single()

  if (error) {
    await removePetImage(imagePath)
    throw new Error('No se pudo guardar la mascota. Intenta de nuevo.')
  }

  return mapPetRow(data)
}

export async function getPetById(id) {
  const { data, error } = await supabase
    .from('mascotas')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo cargar la mascota.')
  }

  return mapPetRow(data)
}

export async function getPetByQrId(qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    return null
  }

  const { data, error } = await supabase
    .from('mascotas')
    .select('*')
    .eq('qr_id', normalizedQrId)
    .maybeSingle()

  if (error) {
    throw new Error('No se pudo cargar la mascota vinculada al QR.')
  }

  return mapPetRow(data)
}

export async function createPetWithQr(petData, imageFile, qrId) {
  const normalizedQrId = normalizeQrId(qrId)
  if (!normalizedQrId) {
    throw new Error('El código QR no es válido.')
  }

  const qrCode = await getQrCodeById(normalizedQrId)
  if (!qrCode) {
    throw new Error('Este código QR no existe.')
  }

  if (qrCode.status === 'disabled') {
    throw new Error('Este código QR está desactivado.')
  }

  if (qrCode.status === 'registered') {
    throw new Error('Este código QR ya fue registrado por otra mascota.')
  }

  const { imagePath, fotoUrl } = await uploadPetImage(imageFile)
  const telefonoNormalizado = normalizeEcuadorPhone(petData.telefono)

  const { data: createdPet, error: insertError } = await supabase
    .from('mascotas')
    .insert({
      nombre: petData.nombre,
      raza: petData.raza,
      edad: petData.edad,
      nombre_dueno: petData.nombreDueno,
      telefono: petData.telefono,
      telefono_normalizado: telefonoNormalizado,
      foto_url: fotoUrl,
      qr_id: normalizedQrId,
    })
    .select('*')
    .single()

  if (insertError) {
    await removePetImage(imagePath)

    if (isQrDuplicateError(insertError)) {
      throw new Error('Este código QR ya está asociado a otra mascota.')
    }

    throw new Error('No se pudo guardar la mascota con este código QR.')
  }

  try {
    await markQrAsRegistered(normalizedQrId)
  } catch (error) {
    await Promise.allSettled([
      supabase.from('mascotas').delete().eq('id', createdPet.id),
      removePetImage(imagePath),
    ])

    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo finalizar el registro del código QR.'

    throw new Error(message, { cause: error })
  }

  return mapPetRow(createdPet)
}

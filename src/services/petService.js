import { normalizeEcuadorPhone } from '../utils/phone'
import { supabase } from './supabaseClient'

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
    createdAt: row.created_at,
  }
}

export async function createPet(petData, imageFile) {
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

  const fotoUrl = publicUrlData?.publicUrl
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
    await supabase.storage.from(PET_PHOTOS_BUCKET).remove([imagePath])
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

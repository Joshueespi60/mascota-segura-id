import { createClient } from 'jsr:@supabase/supabase-js@2'

type JsonObject = Record<string, unknown>

const PET_PHOTOS_BUCKET = 'pet-photos'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(payload: JsonObject, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function extractStoragePathFromPhotoUrl(fotoUrl: unknown): string | null {
  if (typeof fotoUrl !== 'string') {
    return null
  }

  const trimmedUrl = fotoUrl.trim()
  if (!trimmedUrl) {
    return null
  }

  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl.replace(/^\/+/, '') || null
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

      const relativePath = pathName
        .slice(prefixIndex + prefix.length)
        .replace(/^\/+/, '')

      return relativePath || null
    }
  } catch {
    return null
  }

  return null
}

async function removePetPhotoIfPossible(
  adminClient: any,
  fotoUrl: unknown,
) {
  const imagePath = extractStoragePathFromPhotoUrl(fotoUrl)
  if (!imagePath) {
    return {
      attempted: false,
      removed: false,
      reason: 'path_not_resolved',
    }
  }

  const { error } = await adminClient
    .storage
    .from(PET_PHOTOS_BUCKET)
    .remove([imagePath])

  if (error) {
    console.error('No se pudo eliminar foto de mascota:', error)
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        ok: false,
        message: 'Metodo no permitido. Usa POST.',
      },
      405,
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const adminPinSecret = Deno.env.get('ADMIN_QR_PIN')

  if (!supabaseUrl || !serviceRoleKey || !adminPinSecret) {
    return jsonResponse(
      {
        ok: false,
        message: 'Faltan secretos requeridos en la Edge Function.',
      },
      500,
    )
  }

  let payload: { qrId?: unknown; adminPin?: unknown } = {}
  try {
    payload = await req.json()
  } catch {
    return jsonResponse(
      {
        ok: false,
        message: 'El body debe ser JSON valido.',
      },
      400,
    )
  }

  const qrId = typeof payload.qrId === 'string' ? payload.qrId.trim() : ''
  const adminPin = typeof payload.adminPin === 'string' ? payload.adminPin.trim() : ''

  if (!qrId) {
    return jsonResponse(
      {
        ok: false,
        message: 'El campo qrId es obligatorio.',
      },
      400,
    )
  }

  if (!adminPin) {
    return jsonResponse(
      {
        ok: false,
        message: 'El campo adminPin es obligatorio.',
      },
      400,
    )
  }

  if (adminPin !== adminPinSecret) {
    return jsonResponse(
      {
        ok: false,
        message: 'PIN de administrador invalido.',
      },
      401,
    )
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data: qrRow, error: findQrError } = await adminClient
    .from('qr_codes')
    .select('*')
    .eq('qr_id', qrId)
    .maybeSingle()

  if (findQrError) {
    console.error('Error buscando QR:', findQrError)
    return jsonResponse(
      {
        ok: false,
        message: 'No se pudo consultar el QR solicitado.',
      },
      500,
    )
  }

  if (!qrRow) {
    return jsonResponse(
      {
        ok: false,
        message: 'No se encontro el codigo QR indicado.',
      },
      404,
    )
  }

  if (qrRow.status !== 'registered') {
    return jsonResponse(
      {
        ok: false,
        message: 'Este QR no esta registrado actualmente.',
      },
      400,
    )
  }

  const { data: petRow, error: findPetError } = await adminClient
    .from('mascotas')
    .select('id, qr_id, foto_url')
    .eq('qr_id', qrId)
    .maybeSingle()

  if (findPetError) {
    console.error('Error buscando mascota asociada:', findPetError)
    return jsonResponse(
      {
        ok: false,
        message: 'No se pudo buscar la mascota asociada a este QR.',
      },
      500,
    )
  }

  if (!petRow?.id) {
    return jsonResponse(
      {
        ok: false,
        message: 'No se encontro una mascota asociada a este QR.',
      },
      404,
    )
  }

  const { data: deletedPet, error: deletePetError } = await adminClient
    .from('mascotas')
    .delete()
    .eq('id', petRow.id)
    .select('id')
    .maybeSingle()

  if (deletePetError || !deletedPet?.id) {
    console.error('Error eliminando mascota:', deletePetError)
    return jsonResponse(
      {
        ok: false,
        message: 'No se pudo eliminar la mascota asociada a este QR.',
      },
      500,
    )
  }

  const photoCleanup = await removePetPhotoIfPossible(adminClient, petRow.foto_url)

  const { data: releasedQrRow, error: releaseQrError } = await adminClient
    .from('qr_codes')
    .update({
      status: 'available',
      registered_at: null,
      disabled_at: null,
    })
    .eq('qr_id', qrId)
    .select('*')
    .single()

  if (releaseQrError || !releasedQrRow) {
    console.error('Error liberando QR:', releaseQrError)
    return jsonResponse(
      {
        ok: false,
        message: 'La mascota se elimino, pero no se pudo liberar el QR.',
      },
      500,
    )
  }

  return jsonResponse({
    ok: true,
    message: 'Mascota desvinculada y QR liberado correctamente.',
    qr: releasedQrRow,
    removedPetId: deletedPet.id,
    photoCleanup,
  })
})

function buildMapEmbedUrl({ city, country, lat, lng }) {
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng)
  const locationQuery = hasCoordinates
    ? `${lat},${lng}`
    : [city, country].filter(Boolean).join(', ')

  return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=13&output=embed`
}

function PetLocationMap({
  city = 'Esmeraldas',
  country = 'Ecuador',
  lat = 0.9682,
  lng = -79.6517,
}) {
  const mapUrl = buildMapEmbedUrl({ city, country, lat, lng })
  const locationLabel = [city, country].filter(Boolean).join(', ')

  return (
    <section className="space-y-4 rounded-2xl border border-brand-secondary/30 bg-brand-bg p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Ubicacion aproximada
        </p>
        <h3 className="mt-1 text-lg font-bold text-brand-text">Ultima zona reportada para esta mascota.</h3>
        <p className="mt-1 text-sm text-brand-text/75">{locationLabel}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-secondary/30 bg-white">
        <iframe
          title="Ubicacion aproximada de la mascota"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[280px] w-full sm:h-[320px]"
        />
      </div>
    </section>
  )
}

export default PetLocationMap

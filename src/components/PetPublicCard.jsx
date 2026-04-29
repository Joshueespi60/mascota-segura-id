import ContactButtons from './ContactButtons'

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-brand-secondary/35 bg-brand-bg p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-brand-text">{value}</p>
    </div>
  )
}

function PetPublicCard({ pet }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-brand-secondary/30 bg-white shadow-xl shadow-brand-text/10">
      <header className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-bg/85">
          MascotaSegura ID
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          {pet.nombre}
        </h1>
        <p className="mt-1 text-sm text-brand-bg/90">Encuentra. Protege. Conecta.</p>
      </header>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-brand-secondary/30 bg-brand-bg">
          {pet.foto ? (
            <img
              src={pet.foto}
              alt={`Foto de ${pet.nombre}`}
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-brand-bg to-brand-accent/40 text-sm font-semibold text-brand-text/70 sm:h-80">
              Sin foto cargada
            </div>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-text">Datos principales</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Nombre" value={pet.nombre} />
            <DetailItem label="Raza" value={pet.raza} />
            <DetailItem label="Edad" value={pet.edad} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-text">
            Información del dueño
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Nombre" value={pet.nombreDueno} />
            <DetailItem label="Teléfono" value={pet.telefono} />
          </div>
        </section>

        <ContactButtons nombreMascota={pet.nombre} telefono={pet.telefono} />
      </div>
    </article>
  )
}

export default PetPublicCard

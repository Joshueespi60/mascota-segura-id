import ContactButtons from './ContactButtons'

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

function PetPublicCard({ pet }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-100">
          MascotaSegura ID
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          {pet.nombre}
        </h1>
        <p className="mt-1 text-sm text-blue-100">Encuentra. Protege. Conecta.</p>
      </header>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-100">
          {pet.foto ? (
            <img
              src={pet.foto}
              alt={`Foto de ${pet.nombre}`}
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100 text-sm font-semibold text-slate-600 sm:h-80">
              Sin foto cargada
            </div>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Datos principales</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Nombre" value={pet.nombre} />
            <DetailItem label="Raza" value={pet.raza} />
            <DetailItem label="Edad" value={pet.edad} />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            Informacion del duenio
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Nombre" value={pet.nombreDueno} />
            <DetailItem label="Telefono" value={pet.telefono} />
          </div>
        </section>

        <ContactButtons nombreMascota={pet.nombre} telefono={pet.telefono} />
      </div>
    </article>
  )
}

export default PetPublicCard

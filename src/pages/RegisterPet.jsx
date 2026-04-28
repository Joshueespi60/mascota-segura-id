import { Link } from 'react-router'
import PetForm from '../components/PetForm'

function RegisterPet() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            Volver al inicio
          </Link>
          <span className="rounded-full border border-blue-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Registro
          </span>
        </div>

        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Registrar mascota
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Completa la informacion para crear la pagina publica de tu mascota.
          </p>
          <div className="mt-6">
            <PetForm />
          </div>
        </section>
      </main>
    </div>
  )
}

export default RegisterPet

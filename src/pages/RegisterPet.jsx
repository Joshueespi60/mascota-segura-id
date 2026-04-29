import { Link } from 'react-router'
import PetForm from '../components/PetForm'

function RegisterPet() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-primary/60 hover:bg-brand-bg"
          >
            Volver al inicio
          </Link>
          <span className="rounded-full border border-brand-secondary/45 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
            Registro
          </span>
        </div>

        <section className="rounded-3xl border border-brand-secondary/30 bg-white p-6 shadow-xl shadow-brand-text/10 sm:p-8">
          <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
            Registrar mascota
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-text/75 sm:text-base">
            Completa la información para crear la página pública de tu mascota.
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

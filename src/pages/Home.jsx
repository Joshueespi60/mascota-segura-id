import { Link } from 'react-router'
import mascotaLogo from '../assets/mascota-logo.png'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-14 sm:px-10 lg:px-16">
        <section className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-brand-secondary/45 bg-brand-bg px-4 py-1 text-sm font-semibold text-brand-primary">
              MascotaSegura ID
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-brand-text sm:text-5xl">
                Encuentra. Protege. Conecta.
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-brand-text/80 lg:mx-0 sm:text-lg">
                Registra a tu mascota en minutos y genera una pagina publica con
                codigo QR para que cualquier persona pueda ayudarte a reunirla
                contigo si se pierde.
              </p>
            </div>
            <Link
              to="/registro"
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:-translate-y-0.5 hover:bg-[#A24F30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Registrar mascota
            </Link>
          </div>

          <div className="rounded-3xl border border-brand-secondary/30 bg-white/95 p-6 shadow-xl shadow-brand-text/10 backdrop-blur sm:p-8">
            <div className="space-y-5">
              <img
                src={mascotaLogo}
                alt="MascotaSegura ID"
                className="mx-auto max-h-56 w-full max-w-sm rounded-2xl object-contain"
              />
              <div className="rounded-2xl bg-brand-bg p-5">
                <h2 className="text-xl font-bold text-brand-text">
                  Perfil publico por QR
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text/80">
                  Comparte identificacion, contacto del tutor y datos clave de
                  tu mascota desde una pagina segura, clara y facil de acceder.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home

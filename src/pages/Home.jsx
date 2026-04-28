import { Link } from 'react-router'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-14 sm:px-10 lg:px-16">
        <section className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
              MascotaSegura ID
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Encuentra. Protege. Conecta.
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 lg:mx-0 sm:text-lg">
                Registra a tu mascota en minutos y genera una pagina publica con
                codigo QR para que cualquier persona pueda ayudarte a reunirla
                contigo si se pierde.
              </p>
            </div>
            <Link
              to="/registro"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Registrar mascota
            </Link>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-xl shadow-blue-900/10 backdrop-blur sm:p-8">
            <div className="space-y-5">
              <div className="grid grid-cols-5 gap-2 rounded-2xl bg-blue-950 p-5">
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-orange-400"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-blue-400"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-orange-300"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-blue-300"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-orange-500"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-blue-500"></div>
                <div className="h-8 rounded bg-white"></div>
                <div className="h-8 rounded bg-orange-400"></div>
                <div className="h-8 rounded bg-white"></div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5">
                <h2 className="text-xl font-bold text-blue-900">
                  Perfil publico por QR
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
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

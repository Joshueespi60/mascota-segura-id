import mascotaLogo from '../assets/mascota-logo.png'

function MaintenanceScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-bg via-[#fffdf9] to-brand-accent/25 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(184,92,56,0.14),_transparent_55%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-3xl border border-brand-secondary/35 bg-white/95 p-8 text-center shadow-xl shadow-brand-text/10 backdrop-blur sm:p-10">
          <img
            src={mascotaLogo}
            alt="MascotaSegura ID"
            className="mx-auto mb-6 max-h-24 w-auto sm:max-h-28"
          />
          <p className="inline-flex rounded-full border border-brand-secondary/40 bg-brand-bg px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
            MascotaSegura ID
          </p>
          <h1 className="mt-5 text-3xl font-extrabold text-brand-text sm:text-4xl">
            Sitio en mantenimiento
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-text/80 sm:text-base">
            Estamos realizando mejoras. Por favor vuelve mas tarde.
          </p>
        </section>
      </main>
    </div>
  )
}

export default MaintenanceScreen

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1))
  }

  return (
    <nav
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
      aria-label="Paginacion de inventario QR"
    >
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Anterior
      </button>

      <span className="rounded-lg border border-brand-secondary/35 bg-brand-bg px-3 py-2 text-xs font-semibold text-brand-text/85">
        Pagina {currentPage} de {totalPages}
      </span>

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-brand-secondary/45 bg-white px-4 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-secondary/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Siguiente
      </button>

      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto">
        {pages.map((page) => {
          const isActive = page === currentPage

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                  : 'border border-brand-secondary/45 bg-white text-brand-primary hover:bg-brand-secondary/15'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Pagination

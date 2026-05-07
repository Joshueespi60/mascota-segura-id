const STATUS_STYLES = {
  available:
    'border border-emerald-200 bg-emerald-50 text-emerald-700',
  registered:
    'border border-blue-200 bg-blue-50 text-blue-700',
  disabled:
    'border border-rose-200 bg-rose-50 text-rose-700',
}

const STATUS_LABELS = {
  available: 'Disponible',
  registered: 'Registrado',
  disabled: 'Desactivado',
}

function QRStatusBadge({ status }) {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : ''
  const style = STATUS_STYLES[normalizedStatus] || 'border border-slate-200 bg-slate-50 text-slate-700'
  const label = STATUS_LABELS[normalizedStatus] || 'Desconocido'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  )
}

export default QRStatusBadge

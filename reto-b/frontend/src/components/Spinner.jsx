export default function Spinner({ text = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-indigo-600 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  )
}

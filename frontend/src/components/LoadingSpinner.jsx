/**
 * Loading spinner.
 * Props:
 *   text – optional label shown below the spinner
 */
export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
      <div className="h-9 w-9 rounded-full border-4 border-gray-200 border-t-red-600 animate-spin" />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

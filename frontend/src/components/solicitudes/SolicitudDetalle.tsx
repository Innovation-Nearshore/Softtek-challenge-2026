"use client";

import { useEffect, useState } from "react";
import { getSolicitudById, updateEstadoSolicitud } from "@/services/api";
import type { Solicitud } from "@/types";
import Badge, { urgenciaBadgeVariant, estadoBadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";

// Valid estado transitions (forward only)
const NEXT_ESTADO: Record<string, string | null> = {
  Recibida: "En revisión",
  "En revisión": "Resuelta",
  Resuelta: null,
};

interface SolicitudDetalleProps {
  id: number;
}

export default function SolicitudDetalle({ id }: SolicitudDetalleProps) {
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSolicitudById(id)
      .then(setSolicitud)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar la solicitud.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdvanceEstado = async () => {
    if (!solicitud) return;
    const nextEstado = NEXT_ESTADO[solicitud.estado];
    if (!nextEstado) return;

    setUpdating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateEstadoSolicitud(id, nextEstado);
      setSolicitud(updated);
      setSuccessMsg(`Estado actualizado a "${nextEstado}" correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar estado.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <svg
          className="animate-spin h-6 w-6 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Cargando solicitud…
      </div>
    );
  }

  if (error && !solicitud) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <Link href="/">
          <Button variant="secondary">← Volver al listado</Button>
        </Link>
      </div>
    );
  }

  if (!solicitud) return null;

  const nextEstado = NEXT_ESTADO[solicitud.estado];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Volver al listado
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-gray-400 mb-1">{solicitud.numero_ticket}</p>
          <h1 className="text-2xl font-bold text-gray-900">{solicitud.titulo}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={urgenciaBadgeVariant(solicitud.urgencia)}>{solicitud.urgencia}</Badge>
          <Badge variant={estadoBadgeVariant(solicitud.estado)}>{solicitud.estado}</Badge>
        </div>
      </div>

      {/* Feedback messages */}
      {successMsg && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Detail card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
        <DetailRow label="Descripción" value={solicitud.descripcion} />
        <DetailRow label="Tipo de solicitud" value={solicitud.tipo_solicitud} />
        <DetailRow label="Área solicitante" value={solicitud.area_solicitante} />
        <DetailRow label="Solicitante" value={solicitud.solicitante} />
        <DetailRow label="Email" value={solicitud.email_solicitante} />
        <DetailRow
          label="Fecha de creación"
          value={new Date(solicitud.fecha_creacion).toLocaleString("es-AR")}
        />
        {solicitud.fecha_resolucion && (
          <DetailRow
            label="Fecha de resolución"
            value={new Date(solicitud.fecha_resolucion).toLocaleString("es-AR")}
          />
        )}
        {solicitud.solucion && (
          <DetailRow label="Solución" value={solicitud.solucion} />
        )}
      </div>

      {/* Estado flow indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Flujo de estado</p>
        <div className="flex items-center gap-2 flex-wrap">
          {["Recibida", "En revisión", "Resuelta"].map((estado, index, arr) => (
            <div key={estado} className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium border",
                  solicitud.estado === estado
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-400 border-gray-200 bg-gray-50",
                ].join(" ")}
              >
                {estado}
              </span>
              {index < arr.length - 1 && (
                <span className="text-gray-300">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advance estado action */}
      {nextEstado && (
        <div className="flex justify-end">
          <Button onClick={handleAdvanceEstado} loading={updating}>
            Avanzar a &ldquo;{nextEstado}&rdquo;
          </Button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="px-4 py-3 grid grid-cols-3 gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800 col-span-2 whitespace-pre-wrap">
        {value ?? <span className="text-gray-400 italic">—</span>}
      </dd>
    </div>
  );
}

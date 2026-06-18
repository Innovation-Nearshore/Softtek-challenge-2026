"use client";

import { useEffect, useState, useCallback } from "react";
import { getSolicitudes, getTiposSolicitud } from "@/services/api";
import type { Solicitud, TipoSolicitud, Filters } from "@/types";
import Table from "@/components/ui/Table";
import Badge, { urgenciaBadgeVariant, estadoBadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Link from "next/link";

const URGENCIA_OPTIONS = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

const INITIAL_FILTERS: Filters = { tipo: "", urgencia: "" };

export default function SolicitudesClient() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [tipos, setTipos] = useState<TipoSolicitud[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async (activeFilters: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSolicitudes(activeFilters);
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tipos for the filter dropdown (only once)
  useEffect(() => {
    getTiposSolicitud()
      .then(setTipos)
      .catch(() => {/* non-critical, filters still usable without tipos */});
  }, []);

  // Fetch whenever filters change
  useEffect(() => {
    fetchSolicitudes(filters);
  }, [filters, fetchSolicitudes]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  const tipoOptions = tipos.map((t) => ({ value: t.nombre, label: t.nombre }));

  const columns = [
    {
      key: "numero_ticket",
      header: "Ticket",
      render: (row: Solicitud) => (
        <span className="font-mono text-xs text-gray-600">{row.numero_ticket}</span>
      ),
    },
    {
      key: "titulo",
      header: "Título",
      render: (row: Solicitud) => (
        <span className="font-medium text-gray-800">{row.titulo}</span>
      ),
    },
    {
      key: "tipo_solicitud",
      header: "Tipo",
    },
    {
      key: "urgencia",
      header: "Urgencia",
      render: (row: Solicitud) => (
        <Badge variant={urgenciaBadgeVariant(row.urgencia)}>{row.urgencia}</Badge>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (row: Solicitud) => (
        <Badge variant={estadoBadgeVariant(row.estado)}>{row.estado}</Badge>
      ),
    },
    {
      key: "solicitante",
      header: "Solicitante",
    },
    {
      key: "area_solicitante",
      header: "Área",
    },
    {
      key: "fecha_creacion",
      header: "Fecha",
      render: (row: Solicitud) => (
        <span className="text-xs text-gray-500">
          {new Date(row.fecha_creacion).toLocaleDateString("es-AR")}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row: Solicitud) => (
        <Link href={`/solicitudes/${row.id}`}>
          <Button variant="ghost" size="sm">
            Ver detalle
          </Button>
        </Link>
      ),
    },
  ];

  const hasActiveFilters = filters.tipo !== "" || filters.urgencia !== "";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de solicitudes internas entre áreas
          </p>
        </div>
        <Link href="/solicitudes/nueva">
          <Button>+ Nueva solicitud</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select
              id="filter-tipo"
              label="Tipo de solicitud"
              value={filters.tipo}
              onChange={(e) => handleFilterChange("tipo", e.target.value)}
              options={tipoOptions}
              placeholder="Todos los tipos"
            />
          </div>
          <div className="flex-1">
            <Select
              id="filter-urgencia"
              label="Urgencia"
              value={filters.urgencia}
              onChange={(e) => handleFilterChange("urgencia", e.target.value)}
              options={URGENCIA_OPTIONS}
              placeholder="Todas las urgencias"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <svg
            className="animate-spin h-6 w-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Cargando solicitudes…
        </div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-gray-500">
            {solicitudes.length} resultado{solicitudes.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " con los filtros aplicados" : ""}
          </div>
          <Table
            columns={columns}
            data={solicitudes}
            keyExtractor={(row) => row.id}
            emptyMessage="No se encontraron solicitudes."
          />
        </div>
      )}
    </div>
  );
}

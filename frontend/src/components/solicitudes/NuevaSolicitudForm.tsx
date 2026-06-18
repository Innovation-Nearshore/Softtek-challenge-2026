"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAreas, getTiposSolicitud, createSolicitud } from "@/services/api";
import type { Area, TipoSolicitud, CreateSolicitudPayload } from "@/types";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

type UrgenciaType = "Alta" | "Media" | "Baja";

interface FormValues {
  tipo_solicitud_id: string;
  titulo: string;
  descripcion: string;
  urgencia: UrgenciaType | "";
  solicitante: string;
  email_solicitante: string;
  area_solicitante_id: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const URGENCIA_OPTIONS = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

const INITIAL_VALUES: FormValues = {
  tipo_solicitud_id: "",
  titulo: "",
  descripcion: "",
  urgencia: "",
  solicitante: "",
  email_solicitante: "",
  area_solicitante_id: "",
};

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.tipo_solicitud_id) errors.tipo_solicitud_id = "Seleccioná un tipo de solicitud.";
  if (!values.titulo.trim()) errors.titulo = "El título es obligatorio.";
  if (!values.descripcion.trim()) errors.descripcion = "La descripción es obligatoria.";
  if (!values.urgencia) errors.urgencia = "Seleccioná la urgencia.";
  if (!values.solicitante.trim()) errors.solicitante = "El nombre del solicitante es obligatorio.";
  if (!values.email_solicitante.trim()) {
    errors.email_solicitante = "El email es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email_solicitante)) {
    errors.email_solicitante = "Ingresá un email válido.";
  }
  if (!values.area_solicitante_id) errors.area_solicitante_id = "Seleccioná el área solicitante.";

  return errors;
}

export default function NuevaSolicitudForm() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [tipos, setTipos] = useState<TipoSolicitud[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load select catalog data
  useEffect(() => {
    Promise.all([getAreas(), getTiposSolicitud()])
      .then(([fetchedAreas, fetchedTipos]) => {
        setAreas(fetchedAreas);
        setTipos(fetchedTipos);
      })
      .catch(() => setCatalogError("No se pudieron cargar los catálogos. Recargá la página."));
  }, []);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateSolicitudPayload = {
      tipo_solicitud_id: parseInt(values.tipo_solicitud_id, 10),
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      urgencia: values.urgencia as UrgenciaType,
      solicitante: values.solicitante.trim(),
      email_solicitante: values.email_solicitante.trim(),
      area_solicitante_id: parseInt(values.area_solicitante_id, 10),
    };

    setSubmitting(true);
    try {
      await createSolicitud(payload);
      router.push("/");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  const tipoOptions = tipos.map((t) => ({ value: t.id, label: t.nombre }));
  const areaOptions = areas.map((a) => ({ value: a.id, label: a.nombre }));

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva solicitud</h1>
        <p className="text-sm text-gray-500 mt-1">
          Completá los campos para registrar una nueva solicitud interna.
        </p>
      </div>

      {catalogError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {catalogError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5"
      >
        {/* Tipo de solicitud */}
        <FormField
          label="Tipo de solicitud"
          htmlFor="tipo_solicitud_id"
          required
          error={errors.tipo_solicitud_id}
        >
          <Select
            id="tipo_solicitud_id"
            value={values.tipo_solicitud_id}
            onChange={(e) => handleChange("tipo_solicitud_id", e.target.value)}
            options={tipoOptions}
            placeholder="Seleccioná un tipo"
            error={errors.tipo_solicitud_id}
          />
        </FormField>

        {/* Título */}
        <FormField label="Título" htmlFor="titulo" required error={errors.titulo}>
          <Input
            id="titulo"
            value={values.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="Ej: Solicitud de equipamiento"
            maxLength={150}
            error={errors.titulo}
          />
        </FormField>

        {/* Descripción */}
        <FormField
          label="Descripción"
          htmlFor="descripcion"
          required
          error={errors.descripcion}
          hint="Máximo 1000 caracteres."
        >
          <Textarea
            id="descripcion"
            value={values.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            placeholder="Describí brevemente la solicitud…"
            maxLength={1000}
            rows={4}
            error={errors.descripcion}
          />
        </FormField>

        {/* Urgencia */}
        <FormField label="Urgencia" htmlFor="urgencia" required error={errors.urgencia}>
          <Select
            id="urgencia"
            value={values.urgencia}
            onChange={(e) => handleChange("urgencia", e.target.value)}
            options={URGENCIA_OPTIONS}
            placeholder="Seleccioná la urgencia"
            error={errors.urgencia}
          />
        </FormField>

        <hr className="border-gray-100" />

        {/* Solicitante */}
        <FormField label="Nombre del solicitante" htmlFor="solicitante" required error={errors.solicitante}>
          <Input
            id="solicitante"
            value={values.solicitante}
            onChange={(e) => handleChange("solicitante", e.target.value)}
            placeholder="Ej: Juan Pérez"
            maxLength={100}
            error={errors.solicitante}
          />
        </FormField>

        {/* Email */}
        <FormField label="Email del solicitante" htmlFor="email_solicitante" required error={errors.email_solicitante}>
          <Input
            id="email_solicitante"
            type="email"
            value={values.email_solicitante}
            onChange={(e) => handleChange("email_solicitante", e.target.value)}
            placeholder="Ej: juan.perez@empresa.com"
            maxLength={150}
            error={errors.email_solicitante}
          />
        </FormField>

        {/* Área solicitante */}
        <FormField
          label="Área solicitante"
          htmlFor="area_solicitante_id"
          required
          error={errors.area_solicitante_id}
        >
          <Select
            id="area_solicitante_id"
            value={values.area_solicitante_id}
            onChange={(e) => handleChange("area_solicitante_id", e.target.value)}
            options={areaOptions}
            placeholder="Seleccioná el área"
            error={errors.area_solicitante_id}
          />
        </FormField>

        {/* Submit error */}
        {submitError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/")}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            Crear solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}

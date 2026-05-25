import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { CreateIncidentPayload } from '../types/incident';
import { fetchCategories } from '../services/incidentsApi';

interface IncidentFormProps {
    onSubmit: (payload: CreateIncidentPayload) => Promise<void>;
    isSubmitting: boolean;
}

interface FormErrors {
    title?: string;
    category?: string;
    severity?: string;
    area?: string;
    reporter?: string;
}

const SEVERITY_OPTIONS = ['Crítica', 'Alta', 'Media', 'Baja'] as const;

const INITIAL_FORM = {
    title: '',
    category: '',
    severity: '' as '' | 'Crítica' | 'Alta' | 'Media' | 'Baja',
    description: '',
    reporter: '',
    area: '',
};

export const IncidentForm = ({ onSubmit, isSubmitting }: IncidentFormProps) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    // Cargar categorías desde la BD al montar
    useEffect(() => {
        fetchCategories()
            .then((data) => setCategories(data.map((c) => c.nombre)))
            .catch(() => {
                // Fallback al catálogo conocido si la API falla
                setCategories([
                    'Acceso', 'Comunicación', 'Datos', 'Desempeño',
                    'Infraestructura', 'Integración', 'Proceso', 'Sistema',
                ]);
            });
    }, []);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.title.trim())    newErrors.title    = 'El título es obligatorio.';
        if (!form.category.trim()) newErrors.category = 'La categoría es obligatoria.';
        if (!form.severity)        newErrors.severity = 'La severidad es obligatoria.';
        if (!form.area.trim())     newErrors.area     = 'El área es obligatoria.';
        if (!form.reporter.trim()) newErrors.reporter = 'El reportador es obligatorio.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!validate()) return;

        const payload: CreateIncidentPayload = {
            title:       form.title.trim(),
            category:    form.category.trim(),
            severity:    form.severity as 'Crítica' | 'Alta' | 'Media' | 'Baja',
            description: form.description.trim() || undefined,
            reporter:    form.reporter.trim(),
            area:        form.area.trim(),
        };

        try {
            await onSubmit(payload);
            setForm(INITIAL_FORM);
            setErrors({});
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Error al crear el incidente.');
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de nuevo incidente">
            <h2>Nuevo Incidente</h2>

            {/* ── Título ── */}
            <div className="form-group">
                <label htmlFor="title">Título *</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={255}
                    placeholder="Descripción breve del incidente"
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    aria-invalid={!!errors.title}
                />
                {errors.title && (
                    <span id="title-error" className="field-error" role="alert">
                        {errors.title}
                    </span>
                )}
            </div>

            {/* ── Categoría (dropdown desde BD) ── */}
            <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    aria-describedby={errors.category ? 'category-error' : undefined}
                    aria-invalid={!!errors.category}
                >
                    <option value="">-- Seleccionar categoría --</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <span id="category-error" className="field-error" role="alert">
                        {errors.category}
                    </span>
                )}
            </div>

            {/* ── Severidad ── */}
            <div className="form-group">
                <label htmlFor="severity">Severidad *</label>
                <select
                    id="severity"
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    aria-describedby={errors.severity ? 'severity-error' : undefined}
                    aria-invalid={!!errors.severity}
                >
                    <option value="">-- Seleccionar --</option>
                    {SEVERITY_OPTIONS.map((sev) => (
                        <option key={sev} value={sev}>
                            {sev}
                        </option>
                    ))}
                </select>
                {errors.severity && (
                    <span id="severity-error" className="field-error" role="alert">
                        {errors.severity}
                    </span>
                )}
            </div>

            {/* ── Área ── */}
            <div className="form-group">
                <label htmlFor="area">Área *</label>
                <input
                    id="area"
                    name="area"
                    type="text"
                    value={form.area}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Ej: Área A, Área B"
                    aria-describedby={errors.area ? 'area-error' : undefined}
                    aria-invalid={!!errors.area}
                />
                {errors.area && (
                    <span id="area-error" className="field-error" role="alert">
                        {errors.area}
                    </span>
                )}
            </div>

            {/* ── Reportador ── */}
            <div className="form-group">
                <label htmlFor="reporter">Reportador *</label>
                <input
                    id="reporter"
                    name="reporter"
                    type="text"
                    value={form.reporter}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="Nombre del reportador"
                    aria-describedby={errors.reporter ? 'reporter-error' : undefined}
                    aria-invalid={!!errors.reporter}
                />
                {errors.reporter && (
                    <span id="reporter-error" className="field-error" role="alert">
                        {errors.reporter}
                    </span>
                )}
            </div>

            {/* ── Descripción (opcional) ── */}
            <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Detalle adicional (opcional)"
                />
            </div>

            {submitError && (
                <p className="submit-error" role="alert">
                    ❌ {submitError}
                </p>
            )}
            {submitSuccess && (
                <p className="submit-success" role="status">
                    ✅ Incidente creado exitosamente.
                </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Guardando…' : 'Crear Incidente'}
            </button>
        </form>
    );
};

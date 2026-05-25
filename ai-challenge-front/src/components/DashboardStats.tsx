/**
 * COMPONENTE — DashboardStats
 * Cards que muestran contadores de incidentes por estado.
 * Funcionalidad obligatoria del kanvas: "Contadores de incidentes por estado" (10 pts).
 * Los valores se calculan en el padre con useMemo para no duplicar lógica.
 */

import type { Incident } from '../types/incident';

interface StatusCounts {
  Abierto: number;
  'En atención': number;
  Cerrado: number;
  total: number;
}

interface DashboardStatsProps {
  incidents: Incident[];
}

/** Calcula los contadores agrupando por status */
const computeCounts = (incidents: Incident[]): StatusCounts => {
  return incidents.reduce(
    (acc, inc) => {
      if (inc.status === 'Abierto') acc.Abierto += 1;
      else if (inc.status === 'En atención') acc['En atención'] += 1;
      else if (inc.status === 'Cerrado') acc.Cerrado += 1;
      acc.total += 1;
      return acc;
    },
    { Abierto: 0, 'En atención': 0, Cerrado: 0, total: 0 } as StatusCounts
  );
};

export const DashboardStats = ({ incidents }: DashboardStatsProps) => {
  const counts = computeCounts(incidents);

  return (
    <section className="dashboard-stats" aria-label="Resumen de incidentes por estado">
      {/* ── Total ── */}
      <div className="stat-card stat-total">
        <span className="stat-label">Total</span>
        <span className="stat-value">{counts.total}</span>
        <span className="stat-sub">incidentes registrados</span>
      </div>

      {/* ── Abierto ── */}
      <div className="stat-card stat-open">
        <span className="stat-label">Abierto</span>
        <span className="stat-value">{counts.Abierto}</span>
        <span className="stat-sub">pendientes de atención</span>
      </div>

      {/* ── En atención ── */}
      <div className="stat-card stat-in-progress">
        <span className="stat-label">En atención</span>
        <span className="stat-value">{counts['En atención']}</span>
        <span className="stat-sub">en proceso de resolución</span>
      </div>

      {/* ── Cerrado ── */}
      <div className="stat-card stat-closed">
        <span className="stat-label">Cerrado</span>
        <span className="stat-value">{counts.Cerrado}</span>
        <span className="stat-sub">resueltos</span>
      </div>
    </section>
  );
};

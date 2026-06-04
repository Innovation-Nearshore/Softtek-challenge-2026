import { useMemo, useState, useEffect } from 'react';
import { updateInitiativeFields } from '../services/initiativesService';
import { formatDate, daysUntil } from '../utils/dateUtils';

const ESTADOS = ['Pendiente', 'En curso', 'Completado'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

export default function Dashboard({ initiatives }) {
  const safeInitiatives = Array.isArray(initiatives) ? initiatives : [];

  // Local copy so inline edits reflect immediately without a full reload
  const [localList, setLocalList] = useState(safeInitiatives);

  // Keep local list in sync when parent refreshes
  useEffect(() => {
    setLocalList(Array.isArray(initiatives) ? initiatives : []);
  }, [initiatives]);

  const [filterEstado, setFilterEstado] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [editValue, setEditValue] = useState('');

  // Counters per estado (always from full list)
  const counters = useMemo(() => {
    const map = {};
    ESTADOS.forEach((e) => (map[e] = 0));
    localList.forEach((i) => {
      if (map[i.estado] !== undefined) map[i.estado]++;
    });
    return map;
  }, [localList]);

  // Filtered list
  const filtered = useMemo(() => {
    return localList.filter((i) => {
      const matchEstado = filterEstado ? i.estado === filterEstado : true;
      const matchPrioridad = filterPrioridad ? i.prioridad === filterPrioridad : true;
      return matchEstado && matchPrioridad;
    });
  }, [localList, filterEstado, filterPrioridad]);

  // Próximos vencimientos: not completed, due within 7 days, sorted by fecha_limite
  const proximos = useMemo(() => {
    return localList
      .filter((i) => i.estado !== 'Completado' && daysUntil(i.fecha_limite) <= 7)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  }, [localList]);

  // --- Inline editing helpers ---

  function startEdit(id, field, currentValue) {
    setEditingCell({ id, field });
    setEditValue(currentValue ?? '');
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditValue('');
  }

  async function commitEdit(id, field) {
    // Find original value
    const original = localList.find((i) => i.id === id);
    const originalValue = original ? original[field] : '';

    if (editValue === originalValue) {
      cancelEdit();
      return;
    }

    // Optimistic update
    setLocalList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: editValue } : i))
    );
    cancelEdit();

    try {
      await updateInitiativeFields(id, { [field]: editValue });
    } catch {
      // Revert on failure
      setLocalList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, [field]: originalValue } : i))
      );
      window.alert('No se pudo guardar el cambio. Por favor, intenta de nuevo.');
    }
  }

  function handleKeyDown(e, id, field) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(id, field);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  // Render a cell — if editing this cell show input/select, else show plain text
  function renderCell(row, field) {
    const isEditing = editingCell && editingCell.id === row.id && editingCell.field === field;

    if (isEditing) {
      if (field === 'prioridad') {
        return (
          <select
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => commitEdit(row.id, field)}
            onKeyDown={(e) => handleKeyDown(e, row.id, field)}
            style={{ width: '100%' }}
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        );
      }
      return (
        <input
          autoFocus
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => commitEdit(row.id, field)}
          onKeyDown={(e) => handleKeyDown(e, row.id, field)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      );
    }

    const displayValue = row[field] ?? '—';
    return (
      <span
        title="Haz clic para editar"
        onClick={() => startEdit(row.id, field, row[field])}
        style={{
          cursor: 'pointer',
          display: 'block',
          minWidth: '60px',
          minHeight: '20px',
          borderBottom: '1px dashed #aaa',
          padding: '2px 0',
        }}
      >
        {displayValue}
      </span>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2>Dashboard</h2>

      {/* Counters */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {ESTADOS.map((e) => (
          <div key={e} style={{ border: '1px solid #ccc', padding: '8px 16px', minWidth: '100px' }}>
            <strong>{e}</strong>
            <div style={{ fontSize: '24px' }}>{counters[e]}</div>
          </div>
        ))}
        <div style={{ border: '1px solid #ccc', padding: '8px 16px', minWidth: '100px' }}>
          <strong>Total</strong>
          <div style={{ fontSize: '24px' }}>{localList.length}</div>
        </div>
      </div>

      {/* Próximos vencimientos */}
      <div style={{ marginBottom: '16px' }}>
        <h3>Próximos vencimientos (≤ 7 días)</h3>
        {proximos.length === 0 ? (
          <p>No hay iniciativas con vencimiento próximo.</p>
        ) : (
          <ul>
            {proximos.map((i) => {
              const days = daysUntil(i.fecha_limite);
              let color = 'inherit';
              let badge = '';
              if (days < 0) {
                color = 'red';
                badge = ' ⚠ VENCIDA';
              } else if (days <= 3) {
                color = 'orange';
                badge = ` ⚠ Vence en ${days} día${days !== 1 ? 's' : ''}`;
              } else {
                badge = ` (en ${days} días)`;
              }
              return (
                <li key={i.id} style={{ color, marginBottom: '4px' }}>
                  <strong>{i.nombre}</strong> — {i.responsable} — Fecha límite: {formatDate(i.fecha_limite)}
                  <span style={{ fontWeight: 'bold' }}>{badge}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '8px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <label>
          Filtrar por Estado:{' '}
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </label>
        <label>
          Filtrar por Prioridad:{' '}
          <select value={filterPrioridad} onChange={(e) => setFilterPrioridad(e.target.value)}>
            <option value="">Todas</option>
            {PRIORIDADES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      <p style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>
        * Haz clic en las celdas de <strong>Nombre</strong>, <strong>Responsable</strong> o <strong>Prioridad</strong> para editarlas directamente.
        Presiona <kbd>Enter</kbd> para confirmar o <kbd>Esc</kbd> para cancelar.
      </p>

      {/* Table */}
      <table
        border="1"
        cellPadding="6"
        cellSpacing="0"
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fecha límite</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                No hay iniciativas.
              </td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{renderCell(i, 'nombre')}</td>
                <td>{renderCell(i, 'responsable')}</td>
                <td>{i.estado}</td>
                <td>{renderCell(i, 'prioridad')}</td>
                <td>{formatDate(i.fecha_limite)}</td>
                <td>{i.descripcion || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

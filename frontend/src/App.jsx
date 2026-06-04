import { useState, useEffect, useCallback } from 'react';
import { fetchInitiatives } from './services/initiativesService';
import InitiativeForm from './components/InitiativeForm';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';

const TABS = [
  { key: 'registro', label: 'Registro' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'kanban', label: 'Kanban' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInitiatives = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchInitiatives();
      setInitiatives(data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 4000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  const handleCreated = () => {
    loadInitiatives();
    setActiveTab('dashboard');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Gestión de Iniciativas</h1>
        <span style={{ fontSize: '13px', color: '#aaa' }}>
          {initiatives.length} iniciativa{initiatives.length !== 1 ? 's' : ''} en total
        </span>
      </header>

      {/* Tab Navigation */}
      <nav style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        paddingLeft: '24px'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #1a1a2e' : '3px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              fontSize: '14px',
              color: activeTab === tab.key ? '#1a1a2e' : '#555',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        {error && (
          <div style={{
            backgroundColor: '#fff3f3',
            border: '1px solid #f00',
            color: '#900',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#555' }}>Cargando iniciativas...</p>
        ) : (
          <>
            {activeTab === 'registro' && (
              <InitiativeForm onCreated={handleCreated} />
            )}
            {activeTab === 'dashboard' && (
              <Dashboard initiatives={initiatives} />
            )}
            {activeTab === 'kanban' && (
              <KanbanBoard initiatives={initiatives} onUpdate={loadInitiatives} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

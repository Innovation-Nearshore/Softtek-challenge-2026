import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InitiativeForm from './pages/InitiativeForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nueva" element={<InitiativeForm />} />
          <Route path="/editar/:id" element={<InitiativeForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

import logo from './logo.svg';
import './App.css';
import { Route, BrowserRouter as Router, Routes, Link } from 'react-router-dom';
import Boxes from './pages/Boxes';
import Gallery from './pages/Gallery';
import Identity from './pages/Identity';
import { useState } from 'react';
import { Status } from '@functionland/fula';

function App() {

  const [fulaClient, setFulaClient] = useState(undefined)
  const [connectionStatus, setConnectionStatus] = useState(Status.Offline)

  return (
    <div className="app">
      <Router>
        <div className='app-container'>
          <Routes>
            <Route path="/boxes" element={
              <Boxes fulaClient={fulaClient}
                setFulaClient={setFulaClient}
                connectionStatus={connectionStatus}
                setConnectionStatus={setConnectionStatus} />
            } />
            <Route path="/" element={<Gallery />} />
            <Route path="/identity" element={<Identity />} />
          </Routes>
          <div className='app-footer'>
            <Link to='/boxes' className='link'>Connect to Box</Link>
            <Link to='/identity' className='identity'>Manage ID</Link>
          </div>
        </div>
      </Router>

    </div>
  );
}

export default App;

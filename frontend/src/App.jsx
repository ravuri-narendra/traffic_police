import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Junction from './components/Junction';

const socket = io('http://localhost:5000');

function App() {
  const [data, setData] = useState({
    phases: { N: 'red', S: 'red', E: 'red', W: 'red' },
    densities: { N: 0, S: 0, E: 0, W: 0 },
    reason: 'Connecting...',
    step: 0
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Traffic Neural Ops backend');
    });

    socket.on('traffic_update', (update) => {
      setData(update);
    });

    return () => {
      socket.off('connect');
      socket.off('traffic_update');
    };
  }, []);

  return (
    <div className="App">
      <Junction data={data} />
    </div>
  );
}

export default App;

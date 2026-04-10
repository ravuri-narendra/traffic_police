import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Car, AlertTriangle, Cpu } from 'lucide-react';

const Light = ({ status }) => {
  const colors = {
    red: 'rgba(239, 68, 68, 0.8)',
    yellow: 'rgba(245, 158, 11, 0.8)',
    green: 'rgba(34, 197, 94, 0.8)',
  };
  
  const shadows = {
    red: '0 0 30px rgba(239, 68, 68, 0.5)',
    yellow: '0 0 30px rgba(245, 158, 11, 0.5)',
    green: '0 0 30px rgba(34, 197, 94, 0.5)',
  };

  return (
    <motion.div
      animate={{ 
        backgroundColor: colors[status],
        boxShadow: shadows[status],
        scale: status !== 'red' ? 1.1 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        margin: '5px',
        border: '3px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(5px)'
      }}
    />
  );
};

const LaneInfo = ({ direction, density, status }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      minWidth: '150px'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>
        {direction} Lane
      </div>
      <Light status={status} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: density > 40 ? '#f87171' : '#94a3b8' }}>
        <Car size={16} />
        <span style={{ fontSize: '18px', fontWeight: '600' }}>{Math.round(density)}</span>
      </div>
    </div>
  );
};

const Junction = ({ data }) => {
  const { phases, densities, reason, step } = data;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      gap: '40px',
      padding: '40px'
    }}>
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TRAFFIC NEURAL OPS
        </h1>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>SYSTEM V4.2.0</div>
      </div>

      <div style={{ display: 'grid', gridTemplateAreas: '"empty N empty" "W center E" "empty S empty"', gap: '20px' }}>
        <div style={{ gridArea: 'N' }}><LaneInfo direction="North" density={densities.N} status={phases.N} /></div>
        <div style={{ gridArea: 'W' }}><LaneInfo direction="West" density={densities.W} status={phases.W} /></div>
        
        <div style={{ 
          gridArea: 'center', 
          width: '200px', 
          height: '200px', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
          position: 'relative'
        }}>
          <Cpu className="animate-pulse" size={32} color="rgba(255,255,255,0.2)" />
          <div style={{ position: 'absolute', bottom: '20px', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>JUNCTION BRAIN</div>
        </div>

        <div style={{ gridArea: 'E' }}><LaneInfo direction="East" density={densities.E} status={phases.E} /></div>
        <div style={{ gridArea: 'S' }}><LaneInfo direction="South" density={densities.S} status={phases.S} /></div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '20px 40px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>SIMULATION STEP</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>{step.toString().padStart(6, '0')}</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>DECISION REASON</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            padding: '4px 12px', 
            borderRadius: '10px',
            backgroundColor: reason === 'Emergency' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: reason === 'Emergency' ? '#f87171' : '#60a5fa',
            border: `1px solid ${reason === 'Emergency' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}>
            {reason.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Junction;

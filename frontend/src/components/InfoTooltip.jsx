import React, { useState } from 'react';

const InfoTooltip = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ display: 'inline-block', position: 'relative', marginLeft: '8px' }}>
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        ?
      </span>
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.4',
            whiteSpace: 'normal',
            width: '280px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'none'
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid rgba(0, 0, 0, 0.9)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;

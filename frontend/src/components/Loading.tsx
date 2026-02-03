import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
      padding: '2rem 3rem 3rem 3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* CM Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(31, 122, 140, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <span style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            letterSpacing: '2px',
            fontFamily: 'Arial, sans-serif'
          }}>
            CM
          </span>
        </div>

        {/* Loading Text */}
        <p style={{
          fontSize: '1.2rem',
          color: '#1F7A8C',
          fontWeight: '600',
          margin: '0 0 1rem 0'
        }}>
          {message}
        </p>

        {/* Loading Dots */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#1F7A8C',
            animation: 'bounce 1.4s ease-in-out 0s infinite'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#1F7A8C',
            animation: 'bounce 1.4s ease-in-out 0.2s infinite'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#1F7A8C',
            animation: 'bounce 1.4s ease-in-out 0.4s infinite'
          }}></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 32px rgba(31, 122, 140, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(31, 122, 140, 0.5);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          40% {
            transform: translateY(-12px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'large' }) => {
  if (!isOpen) return null;

  const sizeStyles = {
    small: '500px',
    medium: '700px',
    large: '900px',
    xlarge: '1200px'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: sizeStyles[size],
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 2rem',
            borderBottom: '2px solid #e9ecef',
            background: 'linear-gradient(135deg, #1F7A8C 0%, #16616F 100%)'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div
          style={{
            padding: '2rem',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

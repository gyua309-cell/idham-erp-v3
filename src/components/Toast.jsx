import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useAppStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={20} color="var(--success)" />,
    error: <AlertCircle size={20} color="var(--danger)" />,
    warning: <AlertCircle size={20} color="var(--warning)" />,
    info: <Info size={20} color="var(--info)" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 100,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: '10px',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '280px',
      maxWidth: '420px',
      animation: 'slideIn 0.2s ease'
    }}>
      {icons[toast.type] || icons.info}
      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', flex: 1 }}>
        {toast.message}
      </span>
    </div>
  );
};

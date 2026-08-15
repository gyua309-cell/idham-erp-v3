import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sun, Moon, RefreshCw, Bell, User, Search, Store } from 'lucide-react';

export const Header = () => {
  const { theme, toggleTheme, user, fetchAllData, loading } = useAppStore();

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '320px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="بحث سريع بالنظام..."
            className="form-control"
            style={{ paddingRight: '38px', height: '38px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Actions & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Refresh Sync Button */}
        <button
          onClick={() => fetchAllData(true)}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          title="مزامنة البيانات الحية"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>مزامنة</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px' }}
          title="تغيير المظهر"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold'
          }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

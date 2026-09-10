import React from 'react';
import { Wifi, WifiOff, LogOut, Cpu, Database } from 'lucide-react';
import { UserAuth } from '../types/model';
import { NetworkMonitor } from '../core/services/NetworkMonitor';

interface HeaderProps {
  user: UserAuth | null;
  isOnline: boolean;
  isManualOverride: boolean;
  onToggleOffline: () => void;
  onSignOut: () => void;
  onOpenLab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isOnline,
  isManualOverride,
  onToggleOffline,
  onSignOut,
  onOpenLab,
}) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--spectrum-surface-elevated)',
        borderBottom: '1px solid var(--spectrum-border-color)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--spectrum-shadow-sm)',
      }}
    >
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--spectrum-blue-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Cpu size={22} />
        </div>
        <div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.2px',
              color: 'var(--spectrum-text-primary)',
            }}
          >
            Binaire Freznel
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--spectrum-text-secondary)' }}>
            Model Selection Utility &bull; Adobe Spectrum UI
          </span>
        </div>
      </div>

      {/* Center / Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Task 2.9 Lab Button */}
        <button
          className="spectrum-Button spectrum-Button--secondary"
          onClick={onOpenLab}
          style={{ fontSize: '13px', padding: '6px 12px' }}
        >
          <Database size={15} />
          Background Fetch & Integrity Lab
        </button>

        {/* Network Connection Badge */}
        <div
          className={`status-badge ${
            isOnline ? 'status-badge--online' : 'status-badge--offline'
          }`}
        >
          <span
            className={`status-dot ${
              isOnline ? 'status-dot--online' : 'status-dot--offline'
            }`}
          />
          {isOnline ? 'ONLINE' : 'OFFLINE MODE (IndexedDB Active)'}
        </div>

        {/* Task 2.8 Simulator Switch */}
        <button
          className="spectrum-Button spectrum-Button--outline"
          onClick={onToggleOffline}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderColor: isManualOverride ? 'var(--spectrum-red-400)' : 'var(--spectrum-border-color)',
            color: isManualOverride ? 'var(--spectrum-red-400)' : 'var(--spectrum-text-secondary)',
          }}
          title="Simulate switching network online/offline as required by Task 2.8"
        >
          {isManualOverride ? <WifiOff size={14} /> : <Wifi size={14} />}
          {isManualOverride ? 'Disable Offline Override' : 'Simulate Offline Mode'}
        </button>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--spectrum-text-primary)',
                }}
              >
                {user.displayName || user.email || 'Assessor User'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--spectrum-text-secondary)',
                }}
              >
                {user.isAnonymous ? 'Guest Authentication' : 'Firebase Authenticated'}
              </div>
            </div>

            <button
              className="spectrum-Button spectrum-Button--secondary"
              onClick={onSignOut}
              style={{ padding: '8px' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

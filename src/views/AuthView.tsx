import React, { useState } from 'react';
import { AuthService } from '../core/services/AuthService';
import { Cpu, ShieldCheck, Mail, Lock, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await authService.signUp(email, password);
      } else {
        await authService.signIn(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    try {
      await authService.signInGuest();
      onAuthSuccess();
    } catch (err: any) {
      setErrorMsg('Guest sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--spectrum-bg)',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--spectrum-surface-elevated)',
          border: '1px solid var(--spectrum-border-color)',
          borderRadius: 'var(--spectrum-radius-lg)',
          boxShadow: 'var(--spectrum-shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            padding: '32px 32px 24px 32px',
            textAlign: 'center',
            borderBottom: '1px solid var(--spectrum-border-color)',
            background: 'linear-gradient(180deg, rgba(20, 115, 230, 0.08) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--spectrum-blue-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 4px 14px rgba(20, 115, 230, 0.4)',
            }}
          >
            <Cpu size={28} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--spectrum-text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            Binaire Freznel
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--spectrum-text-secondary)',
              marginTop: '6px',
            }}
          >
            Model Selection Utility &bull; Firebase Authentication
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--spectrum-border-color)',
            backgroundColor: 'var(--spectrum-surface-layer)',
          }}
        >
          <button
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: mode === 'signin' ? 'var(--spectrum-surface-elevated)' : 'transparent',
              color: mode === 'signin' ? 'var(--spectrum-blue-400)' : 'var(--spectrum-text-secondary)',
              borderBottom: mode === 'signin' ? '2px solid var(--spectrum-blue-400)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: mode === 'signup' ? 'var(--spectrum-surface-elevated)' : 'transparent',
              color: mode === 'signup' ? 'var(--spectrum-blue-400)' : 'var(--spectrum-text-secondary)',
              borderBottom: mode === 'signup' ? '2px solid var(--spectrum-blue-400)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={15} /> Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px' }}>
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
            >
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: 'rgba(215, 55, 63, 0.15)',
                    border: '1px solid var(--spectrum-red-400)',
                    color: 'var(--spectrum-red-400)',
                    padding: '10px 14px',
                    borderRadius: 'var(--spectrum-radius-sm)',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--spectrum-text-secondary)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="spectrum-Textfield"
                    placeholder="developer@binaire.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <Mail
                    size={16}
                    color="var(--spectrum-text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--spectrum-text-secondary)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="spectrum-Textfield"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <Lock
                    size={16}
                    color="var(--spectrum-text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="spectrum-Button spectrum-Button--primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
              >
                {loading ? (
                  'Authenticating...'
                ) : (
                  <>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--spectrum-border-color)' }} />
            <span style={{ fontSize: '12px', color: 'var(--spectrum-text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--spectrum-border-color)' }} />
          </div>

          <button
            type="button"
            className="spectrum-Button spectrum-Button--secondary"
            onClick={handleGuestAccess}
            disabled={loading}
            style={{ width: '100%', padding: '10px', fontSize: '13px' }}
          >
            <Sparkles size={15} color="var(--spectrum-amber-400)" />
            Continue as Guest Assessor
          </button>
        </div>

        {/* Security badge */}
        <div
          style={{
            backgroundColor: 'var(--spectrum-surface-layer)',
            borderTop: '1px solid var(--spectrum-border-color)',
            padding: '12px 24px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--spectrum-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={14} color="var(--spectrum-green-400)" />
          Protected by Firebase Authentication SDK & Local Storage Fallback
        </div>
      </motion.div>
    </div>
  );
};

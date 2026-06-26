'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password, rememberMe)
      router.push('/dashboard/overview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-mark">
                <span className="logo-g">G</span>
              </div>
              <div className="logo-text">
                <span className="logo-title">GTM Engine</span>
                <span className="logo-sub">AI-Powered Operations</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group-inline">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p className="text-dim">
              Secure authentication powered by JWT
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
        }

        .login-card {
          background: var(--layer-1);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }

        .login-header {
          margin-bottom: 32px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-mark {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--brand) 0%, #9b94ff 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(124, 118, 255, 0.3);
        }

        .logo-g {
          font-family: var(--ui);
          font-weight: 800;
          font-size: 24px;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .logo-title {
          font-family: var(--ui);
          font-weight: 700;
          font-size: 20px;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .logo-sub {
          font-family: var(--ui);
          font-size: 12px;
          color: var(--text-dim);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.4;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-family: var(--ui);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .form-group input {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--text);
          transition: all 0.15s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-ghost);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: var(--text-dim);
        }

        .form-group-inline {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text);
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .btn {
          font-family: var(--ui);
          font-size: 14px;
          font-weight: 600;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }

        .btn-primary {
          background: var(--brand);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #6b65e8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 118, 255, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-block {
          width: 100%;
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .text-dim {
          font-size: 12px;
          color: var(--text-dim);
        }
      `}</style>
    </div>
  )
}

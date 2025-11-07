'use client';

import { useState } from 'react';

export default function NewsletterSubscribe() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          frequency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao subscrever');
      }

      setStatus('success');
      setEmail('');

      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <div className={`newsletter-widget ${isOpen ? 'open' : ''}`}>
      <button
        className="newsletter-toggle"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Fechar newsletter' : 'Abrir newsletter'}
      >
        {isOpen ? (
          <span className="toggle-close">✕</span>
        ) : (
          <>
            <span className="toggle-icon">📧</span>
            <span className="toggle-text">Newsletter</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="newsletter-content">
          {status === 'success' ? (
            <div className="newsletter-success">
              <p>✓ Subscrito com sucesso!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <h3>Subscrever Newsletter</h3>

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  disabled={status === 'loading'}
                />
              </div>

              <div className="form-group">
                <label>Frequência:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={frequency === 'daily'}
                      onChange={(e) => setFrequency(e.target.value)}
                      disabled={status === 'loading'}
                    />
                    Diária
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={frequency === 'weekly'}
                      onChange={(e) => setFrequency(e.target.value)}
                      disabled={status === 'loading'}
                    />
                    Semanal
                  </label>
                </div>
              </div>

              {status === 'error' && (
                <div className="newsletter-error">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="newsletter-submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'A enviar...' : 'Subscrever'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}


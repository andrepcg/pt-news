'use client';

import React, { useState, useEffect } from 'react';
import { InstantSearch, useSearchBox, useInfiniteHits, Configure, Highlight, SortBy } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import './Search.css';

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_MEILISEARCH_URL,
  process.env.NEXT_PUBLIC_MEILISEARCH_KEY
);

function SearchModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <h2>🔍 Pesquisar Notícias</h2>
          <button className="search-modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <SearchContent />
      </div>
    </div>
  );
}

function SearchContent() {
  const { query, refine } = useSearchBox();
  const { hits, isLastPage, showMore, results } = useInfiniteHits();

  const formatDate = (timestamp) => {
    // Handle Unix timestamp (in seconds or milliseconds)
    const date = typeof timestamp === 'number'
      ? new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1))
      : new Date(timestamp);

    return date.toLocaleString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Lisbon',
    });
  };

  const handleResultClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const totalResults = results?.nbHits || 0;

  return (
    <>
      <div className="search-input-wrapper">
        <input
          type="search"
          className="search-input"
          placeholder="Pesquisar por título ou lead..."
          value={query}
          onChange={(e) => refine(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results">
        {!query && (
          <div className="search-empty-state">
            Digite algo para começar a pesquisar...
          </div>
        )}

        {query && hits.length === 0 && (
          <div className="search-empty-state">
            Nenhum resultado encontrado para "{query}"
          </div>
        )}

        {query && hits.length > 0 && (
          <>
            <div className="search-results-count">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </div>
            {hits.map((hit, index) => {
              return (
                <div
                  key={`${hit.id || hit.objectID || hit.title}-${index}`}
                  className="search-result-item"
                  onClick={() => handleResultClick(hit.url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleResultClick(hit.url);
                    }
                  }}
                >
                  <h3 className="search-result-title">
                    <Highlight attribute="title" hit={hit} />
                  </h3>
                  {hit.tags && hit.tags.length > 0 && (
                    <div className="search-result-tags">
                      {Array.isArray(hit.tags) ? hit.tags.map((tag, i) => (
                        <span key={i} className="search-tag">{tag}</span>
                      )) : hit.tags}
                    </div>
                  )}
                  {hit.lead && (
                    <p className="search-result-lead">
                      <Highlight attribute="lead" hit={hit} />
                    </p>
                  )}
                  <div className="search-result-meta">
                    {hit.newspaper && (
                      <>
                        <span className="search-result-newspaper">{hit.newspaper}</span>
                        <span className="meta-separator">·</span>
                      </>
                    )}
                    <time>{formatDate(hit.date)}</time>
                  </div>
                </div>
              );
            })}

            {!isLastPage && (
              <button
                className="search-load-more"
                onClick={showMore}
              >
                Carregar mais resultados
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function Search() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="search-floating-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Abrir pesquisa"
      >
        🔍
      </button>

      <InstantSearch indexName="pt-news:date:desc" searchClient={searchClient}>
        <Configure
          attributesToSearchOn={['title', 'lead']}
          restrictSearchableAttributes={["title", "lead"]}
          hitsPerPage={10}
        />
        <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </InstantSearch>
    </>
  );
}
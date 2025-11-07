import Link from "next/link";
import Article from "../../../components/Article";
import DateNavigationSidebar from "../../../components/DateNavigationSidebar";
import { getArticlesByTag, getAllTagsWithFrequency } from "../../../utils";
import { getMonthName, groupArticlesByYearMonth } from "../../../dateUtils";

const ARTICLES_PER_PAGE = 2000;

export default async function Page({ params }) {
  const { tag, page } = await params;
  // page is an array like ['2'] or undefined for page 1
  const currentPage = page && page.length > 0 ? parseInt(page[0], 10) : 1;

  const allArticles = await getArticlesByTag(decodeURIComponent(tag));

  if (allArticles.length === 0) {
    return <div>No articles found for tag {decodeURIComponent(tag)}</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const articles = allArticles.slice(startIndex, endIndex);

  // Group all articles for sidebar (all articles for counts)
  const groupedDates = groupArticlesByYearMonth(allArticles);

  // Group paginated articles for display
  const groupedArticles = groupArticlesByYearMonth(articles);

  return (
    <div>
      <h1>Notícias com a tag: {decodeURIComponent(tag)}</h1>
      <nav aria-label="Navegação">
        <ul className="links" style={{ marginBottom: '2rem' }}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/tags">Todas as Tags</Link></li>
        </ul>
      </nav>

      {/* Pagination info */}
      <div style={{ marginBottom: '1rem' }}>
        <p>Total de notícias: {allArticles.length} | Página {currentPage} de {totalPages}</p>
      </div>

      <div className="dates-layout">
        {/* Sidebar Navigation */}
        <DateNavigationSidebar groupedDates={groupedDates} showLinks={true} />

        {/* Main Content */}
        <main className="dates-main">
          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav aria-label="Paginação" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {currentPage > 1 && (
                  <Link href={`/tags/${encodeURIComponent(tag)}${currentPage > 2 ? `/${currentPage - 1}` : ''}`} className="pagination-link">
                    ← Anterior
                  </Link>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNum === 1 ||
                                    pageNum === totalPages ||
                                    Math.abs(pageNum - currentPage) <= 2;

                    if (!showPage) {
                      // Show ellipsis
                      if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                        return <span key={pageNum}>...</span>;
                      }
                      return null;
                    }

                    if (pageNum === currentPage) {
                      return (
                        <span key={pageNum} style={{ fontWeight: 'bold', padding: '0.25rem 0.5rem' }}>
                          {pageNum}
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/tags/${encodeURIComponent(tag)}${pageNum > 1 ? `/${pageNum}` : ''}`}
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link href={`/tags/${encodeURIComponent(tag)}/${currentPage + 1}`} className="pagination-link">
                    Próxima →
                  </Link>
                )}
              </div>
            </nav>
          )}

          {/* Articles grouped by year and month */}
          {Object.keys(groupedArticles).sort((a, b) => b - a).map(year => {
            const months = Object.keys(groupedArticles[year]).sort((a, b) => b - a);

            return (
              <section key={year} id={`year-${year}`} className="year-section">
                <h2 className="year-heading">{year}</h2>

                {months.map(month => {
                  const monthArticles = groupedArticles[year][month].articles;

                  return (
                    <section key={month} id={`month-${year}-${month}`} className="month-section">
                      <h3 className="month-heading">{getMonthName(month)}</h3>

                      {monthArticles.map(article => (
                        <Article key={article.title} {...article} />
                      ))}
                    </section>
                  );
                })}
              </section>
            );
          })}

          {/* Pagination controls at bottom */}
          {totalPages > 1 && (
            <nav aria-label="Paginação" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                {currentPage > 1 && (
                  <Link href={`/tags/${encodeURIComponent(tag)}${currentPage > 2 ? `/${currentPage - 1}` : ''}`} className="pagination-link">
                    ← Anterior
                  </Link>
                )}
                <span>Página {currentPage} de {totalPages}</span>
                {currentPage < totalPages && (
                  <Link href={`/tags/${encodeURIComponent(tag)}/${currentPage + 1}`} className="pagination-link">
                    Próxima →
                  </Link>
                )}
              </div>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return {
    title: `Notícias com a tag: ${decodeURIComponent(tag)}`,
  };
}

export async function generateStaticParams() {
  const tags = await getAllTagsWithFrequency();
  const params = [];

  for (const { tag, frequency } of tags) {
    const totalPages = Math.ceil(frequency / ARTICLES_PER_PAGE);

    // Generate page 1 (no page segment)
    params.push({ tag, page: [] });

    // Generate additional pages if needed
    for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
      params.push({ tag, page: [pageNum.toString()] });
    }
  }

  return params;
}


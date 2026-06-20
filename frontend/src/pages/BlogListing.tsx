import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogApi, API_BASE_URL } from '../lib/api';
import type { Blog } from '../lib/api';

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogListing() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Blog | Mariah Coirs Export';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read expert articles on coco peat, coir products, hydroponics, and export tips from Mariah Coirs.');

    blogApi
      .getAll(true)
      .then((res) => setBlogs(res.data))
      .catch(() => setError('Failed to load articles. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F1EB' }}>
      {/* ── Navbar placeholder: push content below fixed nav ── */}
      <div style={{ height: '72px' }} aria-hidden="true" />

      {/* ── Hero Header ── */}
      <section
        className="py-10 sm:py-20"
        style={{
          background: '#0A0A0A',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_CUBIC }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: '#C99B67',
                marginBottom: '16px',
              }}
            >
              Knowledge Hub
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginBottom: '20px',
              }}
            >
              Coir &amp; Cocopeat Insights
            </h1>
            <p style={{ fontSize: '18px', color: '#667085', maxWidth: '550px', margin: '0 auto', lineHeight: 1.7 }}>
              Expert articles on coco peat, coir products, hydroponics, and export tips from our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section
        className="py-10 sm:py-20 px-4 sm:px-6"
        style={{ maxWidth: '1280px', margin: '0 auto' }}
      >
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid rgba(201,155,103,0.2)',
                borderTopColor: '#C99B67',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#667085',
              fontSize: '16px',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '18px', color: '#667085' }}>No articles published yet. Check back soon!</p>
          </div>
        )}

        {!loading && blogs.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {blogs.map((blog) => (
              <motion.article
                key={blog.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_CUBIC } },
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Featured Image */}
                <Link to={`/blog/${blog.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1f0a 100%)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {blog.featuredImage ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${blog.featuredImage}`}
                        alt={blog.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ fontSize: '48px' }}>🌿</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Card Body */}
                <div
                  className="p-5 sm:p-7"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#C99B67',
                      marginBottom: '10px',
                    }}
                  >
                    {formatDate(blog.createdAt)}
                  </span>

                  <Link to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#111111',
                        letterSpacing: '-0.015em',
                        lineHeight: 1.3,
                        marginBottom: '12px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C99B67')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#111111')}
                    >
                      {blog.title}
                    </h2>
                  </Link>

                  <p
                    style={{
                      fontSize: '15px',
                      color: '#667085',
                      lineHeight: 1.7,
                      marginBottom: '20px',
                      flex: 1,
                    }}
                  >
                    {blog.shortDescription.length > 120
                      ? blog.shortDescription.slice(0, 120) + '…'
                      : blog.shortDescription}
                  </p>

                  <Link
                    to={`/blog/${blog.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#C99B67',
                      textDecoration: 'none',
                      transition: 'gap 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.gap = '10px';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.gap = '6px';
                    }}
                  >
                    Read Article
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

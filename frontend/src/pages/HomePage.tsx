import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find Your Perfect <span className={styles.heroHighlight}>Artist</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Arkom connects you with talented artists for custom commissions.
            From illustrations to character designs, find the perfect creator for your vision.
          </p>
          <div className={styles.heroCta}>
            <Link to="/commissions" className={styles.primaryButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Browse Commissions
            </Link>
            {!isLoggedIn && (
              <Link to="/signup" className={styles.secondaryButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Join as Artist
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.sectionTitle}>Why Choose Arkom?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Curated Artists</h3>
              <p className={styles.featureDescription}>
                Discover talented artists across various styles and specialties.
                Browse portfolios and find the perfect match for your project.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Direct Communication</h3>
              <p className={styles.featureDescription}>
                Chat directly with artists to discuss your vision,
                share references, and collaborate throughout the process.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Secure Transactions</h3>
              <p className={styles.featureDescription}>
                Safe and transparent payment system protects both
                artists and clients throughout the commission process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.howItWorksInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Browse Artists</h3>
                <p className={styles.stepDescription}>
                  Explore our marketplace of talented artists. Filter by style, category,
                  or price range to find creators that match your needs.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Submit a Request</h3>
                <p className={styles.stepDescription}>
                  Found an artist you love? Send them a commission request with your
                  project details, references, and any specific requirements.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Collaborate & Create</h3>
                <p className={styles.stepDescription}>
                  Work directly with your chosen artist through our messaging system.
                  Review progress, provide feedback, and watch your vision come to life.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Receive Your Artwork</h3>
                <p className={styles.stepDescription}>
                  Once complete, receive your custom artwork in high resolution.
                  Leave a review to help other clients find great artists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className={styles.categories}>
        <div className={styles.categoriesInner}>
          <h2 className={styles.sectionTitle}>Popular Categories</h2>
          <div className={styles.categoriesGrid}>
            <Link to="/commissions" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>🎨</div>
              <h3 className={styles.categoryName}>Illustrations</h3>
            </Link>
            <Link to="/commissions" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>👤</div>
              <h3 className={styles.categoryName}>Character Design</h3>
            </Link>
            <Link to="/commissions" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>🖼️</div>
              <h3 className={styles.categoryName}>Portraits</h3>
            </Link>
            <Link to="/commissions" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>🎮</div>
              <h3 className={styles.categoryName}>Game Art</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of artists and clients already using Arkom
              to bring creative visions to life.
            </p>
            <Link to="/signup" className={styles.ctaButton}>
              Create Free Account
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

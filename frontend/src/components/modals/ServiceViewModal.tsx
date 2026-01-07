import { useState, useEffect, useRef } from 'react';
import { Service } from '../../models/Service';
import { ServiceCategory } from '../../models';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import { SensitiveMediaOverlay } from '../common/SensitiveMediaOverlay';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ServiceViewModal.module.css';

interface ShopOwner {
  id: string;
  displayName: string;
  username: string;
  profileImageUrl?: string | null;
}

interface ServiceViewModalProps {
  service: Service;
  category?: ServiceCategory | null;
  shopOwner: ShopOwner;
  onClose: () => void;
  onRequestService?: () => void;
}

// Payment method icons/cards
const PAYMENT_METHODS = [
  { id: 'visa', name: 'Visa', icon: '💳' },
  { id: 'mastercard', name: 'Mastercard', icon: '💳' },
  { id: 'amex', name: 'American Express', icon: '💳' },
];

export const ServiceViewModal = ({
  service,
  category,
  shopOwner,
  onClose,
  onRequestService,
}: ServiceViewModalProps) => {
  const { user } = useAuth();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [understandsNoGuarantee, setUnderstandsNoGuarantee] = useState(false);
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const expandedContentRef = useRef<HTMLDivElement>(null);

  const media = service.media || [];
  const currentMedia = media[selectedMediaIndex];
  const price = service.requestingProcess === 'custom_proposal' ? service.basePrice : service.fixedPrice;

  // Format terms updated date
  const termsUpdatedDate = new Date(service.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Scroll to expanded content when terms are accepted
  useEffect(() => {
    if (termsAccepted && expandedContentRef.current) {
      expandedContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [termsAccepted]);

  const goToPrevious = () => {
    setSelectedMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const getServiceTypeLabel = () => {
    return service.serviceType === 'custom' ? 'Custom' : 'Personalized (YCH)';
  };

  const getCommunicationStyleLabel = () => {
    return service.communicationStyle === 'open' ? 'Open communication' : 'Surprise me';
  };

  const getRequestingProcessLabel = () => {
    return service.requestingProcess === 'custom_proposal' ? 'Custom proposal' : 'Instant order';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${termsAccepted ? styles.expanded : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.content}>
          {/* Left side - Media gallery (hidden when terms accepted) */}
          {!termsAccepted && (
            <div className={styles.mediaSection}>
              {/* Main media display */}
              <div className={styles.mainMedia}>
                {media.length > 1 && (
                  <button className={styles.navArrow} onClick={goToPrevious}>
                    ‹
                  </button>
                )}

                <div className={styles.mediaDisplay}>
                  {currentMedia?.mediaType === 'youtube' && currentMedia?.youtubeUrl ? (
                    <>
                      <YouTubeEmbed
                        url={currentMedia.youtubeUrl}
                        alt={service.title}
                        className={styles.mediaContent}
                      />
                      {currentMedia.hasSensitiveContent && (
                        <SensitiveMediaOverlay sensitiveContentTypes={[]} />
                      )}
                    </>
                  ) : currentMedia?.fileUrl ? (
                    <>
                      <img
                        src={currentMedia.fileUrl}
                        alt={service.title}
                        className={styles.mediaContent}
                      />
                      {currentMedia.hasSensitiveContent && (
                        <SensitiveMediaOverlay sensitiveContentTypes={[]} />
                      )}
                    </>
                  ) : (
                    <div className={styles.noMedia}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>No images</span>
                    </div>
                  )}
                </div>

                {media.length > 1 && (
                  <button className={styles.navArrow} onClick={goToNext}>
                    ›
                  </button>
                )}
              </div>

              {/* Thumbnail strip */}
              {media.length > 1 && (
                <div className={styles.thumbnailStrip}>
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      className={`${styles.thumbnail} ${index === selectedMediaIndex ? styles.active : ''}`}
                      onClick={() => setSelectedMediaIndex(index)}
                    >
                      <img
                        src={item.thumbnailUrl || item.fileUrl || ''}
                        alt={`Thumbnail ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right side - Service info */}
          <div className={`${styles.infoSection} ${termsAccepted ? styles.fullWidth : ''}`}>
            {/* Row 1: Category name */}
            <div className={styles.categoryName}>
              {category?.name || 'Other'}
            </div>

            {/* Row 2: Service title */}
            <h2 className={styles.serviceTitle}>{service.title}</h2>

            {/* Row 3: Price */}
            <div className={styles.price}>
              From <span className={styles.priceAmount}>€{(price / 100).toFixed(2)}</span>
            </div>

            {/* Row 4: Divider */}
            <div className={styles.divider} />

            {/* Row 5: Shop owner info */}
            <div className={styles.shopOwner}>
              <div className={styles.ownerAvatar}>
                {shopOwner.profileImageUrl ? (
                  <img src={shopOwner.profileImageUrl} alt={shopOwner.displayName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {shopOwner.displayName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={styles.ownerInfo}>
                <span className={styles.ownerName}>{shopOwner.displayName}</span>
                <span className={styles.ownerUsername}>@{shopOwner.username}</span>
              </div>
            </div>

            {/* Row 6: Owner message box */}
            <div className={styles.ownerMessage}>
              <div className={styles.messageQuote}>
                "Thanks for considering me for your commission! Please only start a request if you find the service details and my Terms of Service acceptable."
              </div>
            </div>

            {/* Row 7: Accepts payment methods */}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Accepts</span>
              <div className={styles.paymentMethods}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className={styles.paymentCard}>
                    {method.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Row 8: Service type */}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Service type</span>
              <span className={styles.infoValue}>{getServiceTypeLabel()}</span>
            </div>

            {/* Row 9: Communication style */}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Communication style</span>
              <span className={styles.infoValue}>{getCommunicationStyleLabel()}</span>
            </div>

            {/* Row 10: Requesting process */}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Requesting process</span>
              <span className={styles.infoValue}>{getRequestingProcessLabel()}</span>
            </div>

            {/* Row 11: Description */}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>Description</span>
              <div className={styles.description}>
                {service.description}
              </div>
            </div>

            {/* Row 12: Terms of Service */}
            <div className={styles.infoBox}>
              <div className={styles.tosHeader}>
                <span className={styles.infoLabel}>{shopOwner.displayName}'s Terms of Service</span>
                <span className={styles.tosUpdated}>Updated {termsUpdatedDate}</span>
              </div>
              <div className={styles.termsContent}>
                {/* TODO: Replace with actual terms when we have them */}
                <p>By commissioning me, you agree to the following terms:</p>
                <ul>
                  <li>Payment is required upfront before work begins.</li>
                  <li>Revisions are limited based on the service tier selected.</li>
                  <li>I reserve the right to use completed work in my portfolio unless otherwise agreed.</li>
                  <li>Refunds are only available before work has begun.</li>
                </ul>
              </div>
            </div>

            {/* Row 13: Terms acceptance checkbox */}
            <div className={styles.termsAcceptance}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkmark}>
                  {termsAccepted && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </span>
                <span>I accept {shopOwner.displayName}'s Terms of Service</span>
              </label>
            </div>

            {/* Expanded content after accepting terms */}
            {termsAccepted && (
              <div ref={expandedContentRef} className={styles.expandedContent}>
                {/* Row 1: Big title */}
                <h2 className={styles.commissionTitle}>Commission Request</h2>

                {/* Row 2: Owner avatar with chat bubble */}
                <div className={styles.ownerRequestMessage}>
                  <div className={styles.ownerAvatar}>
                    {shopOwner.profileImageUrl ? (
                      <img src={shopOwner.profileImageUrl} alt={shopOwner.displayName} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {shopOwner.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className={styles.requestMessageBubble}>
                    <p>I'll review your request and get back to you as soon as possible. Please provide accurate contact information so I can reach you!</p>
                  </div>
                </div>

                {/* Row 3: Form container */}
                <div className={styles.requestFormContainer}>
                  {/* Row 4: Name input */}
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Your name*</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {/* Row 5: Email input */}
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Your contact details*</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Row 6-10: Quick math box */}
                  <div className={styles.quickMathBox}>
                    <div className={styles.quickMathHeader}>Quick math</div>
                    <div className={styles.quickMathRow}>
                      <span>Base price</span>
                      <span>€{(price / 100).toFixed(2)}</span>
                    </div>
                    <div className={styles.quickMathDivider} />
                    <div className={styles.quickMathTotal}>
                      <span>Project subtotal</span>
                      <span className={styles.subtotalAmount}>€{(price / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Row 11: Divider */}
                  <div className={styles.divider} />

                  {/* Row 12: Understanding checkbox */}
                  <div className={styles.understandingCheck}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={understandsNoGuarantee}
                        onChange={(e) => setUnderstandsNoGuarantee(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkmark}>
                        {understandsNoGuarantee && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                      <span>I understand that submitting this request does not guarantee that the artist will accept my commission.</span>
                    </label>
                  </div>

                  {/* Row 13: Submit button */}
                  <button
                    className={styles.submitButton}
                    onClick={onRequestService}
                    disabled={!understandsNoGuarantee || !customerName || !customerEmail}
                  >
                    Submit Request
                  </button>

                  {/* Row 14: Disclaimer */}
                  <p className={styles.disclaimer}>
                    By submitting this request, you agree to Arkom's <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

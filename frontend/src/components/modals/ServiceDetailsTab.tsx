import { useState } from 'react';
import { MediaSelector } from '../common/MediaSelector';
import { PortfolioMediaUpload } from '../../models/Portfolio';
import styles from './ServiceModal.module.css';

type RequestingProcess = 'custom_proposal' | 'instant_order';

export interface ServiceDetailsData {
  serviceName: string;
  currency: string;
  basePrice: string;
  fixedPrice: string;
  proposalScope: string;
  estimatedStart: string;
  guaranteedDelivery: string;
  description: string;
  searchTags: string[];
  mediaItems: PortfolioMediaUpload[];
}

interface ServiceDetailsTabProps {
  requestingProcess: RequestingProcess;
  onRequestingProcessChange?: (process: RequestingProcess) => void;
  onNext?: () => void;
  data: ServiceDetailsData;
  onDataChange: (data: Partial<ServiceDetailsData>) => void;
  mediaHandlers: {
    handleImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleYouTubeAdd: (url: string) => void;
    handleRemoveMedia: (id: string) => void;
    toggleMediaSensitiveContent: (id: string) => void;
    toggleMediaSensitiveType: (id: string, type: 'gore' | 'sexual_nudity_18+' | 'other') => void;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleFileDrop: (e: React.DragEvent) => void;
    handleDragOverDrop: (e: React.DragEvent) => void;
  };
}

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
];

const ESTIMATED_START_OPTIONS = [
  'This month',
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '5 months',
  '6 months',
];

const GUARANTEED_DELIVERY_OPTIONS = [
  '7 days',
  '14 days',
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '5 months',
  '6 months',
];

export const ServiceDetailsTab = ({
  requestingProcess,
  onRequestingProcessChange,
  onNext,
  data,
  onDataChange,
  mediaHandlers
}: ServiceDetailsTabProps) => {
  const [showProposalTemplate, setShowProposalTemplate] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showRequestingProcessInfo, setShowRequestingProcessInfo] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && data.searchTags.length < 5) {
      e.preventDefault();
      onDataChange({ searchTags: [...data.searchTags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onDataChange({ searchTags: data.searchTags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className={styles.tabContent}>
      {/* Service name */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Service name</label>
        <input
          type="text"
          value={data.serviceName}
          onChange={(e) => onDataChange({ serviceName: e.target.value })}
          placeholder="New Service"
          className={styles.input}
        />
      </div>

      {/* Requesting process with info button */}
      <div className={styles.field}>
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>Requesting process</label>
          <button
            type="button"
            className={styles.infoButton}
            onClick={() => setShowRequestingProcessInfo(!showRequestingProcessInfo)}
          >
            ?
          </button>
        </div>

        <div className={styles.requestingProcessButtons}>
          <button
            type="button"
            className={`${styles.processButton} ${requestingProcess === 'custom_proposal' ? styles.processButtonActive : ''}`}
            onClick={() => onRequestingProcessChange?.('custom_proposal')}
          >
            Custom proposal
          </button>
          <button
            type="button"
            className={`${styles.processButton} ${requestingProcess === 'instant_order' ? styles.processButtonActive : ''}`}
            onClick={() => onRequestingProcessChange?.('instant_order')}
          >
            Instant order
          </button>
        </div>

        {showRequestingProcessInfo && (
          <div className={styles.infoBubble}>
            <div className={styles.infoBubbleSection}>
              <strong>Custom proposal</strong>
              <p>Client submits request form. Choose to accept by sending custom scope, price, and time. Client pays to confirm.</p>
            </div>
            <div className={styles.infoBubbleSection}>
              <strong>Instant order</strong>
              <p>Client pays a fixed price to submit request form. Requests are auto-accepted and confirmed instantly.</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom proposal pricing */}
      {requestingProcess === 'custom_proposal' && (
        <>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Base price</label>
            <p className={styles.fieldDescription}>
              Actual price is set when you reply to requests with your proposal
            </p>
            <div className={styles.priceRow}>
              <select
                value={data.currency}
                onChange={(e) => onDataChange({ currency: e.target.value })}
                className={styles.currencySelect}
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={data.basePrice}
                onChange={(e) => onDataChange({ basePrice: e.target.value })}
                className={styles.priceInput}
                min="0"
              />
            </div>
          </div>

          <div className={styles.field}>
            <button
              type="button"
              className={styles.addButton}
              onClick={() => {/* TODO: Add add-ons modal */}}
            >
              + Add existing add-ons
            </button>
            <div className={styles.addonsInfo}>
              <strong>Add-ons + licenses</strong>
              <p className={styles.fieldDescription}>
                No built-in add-ons or licensing yet. Add new via Request form.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.dropdownHeader} onClick={() => setShowProposalTemplate(!showProposalTemplate)}>
              <span>Proposal template</span>
              <span className={styles.dropdownArrow}>{showProposalTemplate ? '▲' : '▼'}</span>
            </div>
            {showProposalTemplate && (
              <div className={styles.proposalTemplate}>
                <div className={styles.templateSection}>
                  <label className={styles.fieldLabel}>Scope</label>
                  <textarea
                    value={data.proposalScope}
                    onChange={(e) => onDataChange({ proposalScope: e.target.value })}
                    className={styles.textarea}
                    rows={6}
                  />
                </div>

                <div className={styles.templateSection}>
                  <h4 className={styles.sectionTitle}>Timeline</h4>

                  <label className={styles.fieldLabel}>Estimated start</label>
                  <p className={styles.fieldDescription}>
                    When you expect to start work in relation to when client submits order.
                  </p>
                  <select
                    value={data.estimatedStart}
                    onChange={(e) => onDataChange({ estimatedStart: e.target.value })}
                    className={styles.fieldSelect}
                  >
                    {ESTIMATED_START_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>

                  <label className={styles.fieldLabel}>Guaranteed delivery within</label>
                  <p className={styles.fieldDescription}>
                    In relation to when client submits order. They may request a full refund after this date.
                  </p>
                  <select
                    value={data.guaranteedDelivery}
                    onChange={(e) => onDataChange({ guaranteedDelivery: e.target.value })}
                    className={styles.fieldSelect}
                  >
                    {GUARANTEED_DELIVERY_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>

                  <p className={styles.fieldDescription}>
                    Remember that this is for auto-fill purposes only. You can always change this for each request as you see fit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Instant order pricing */}
      {requestingProcess === 'instant_order' && (
        <>
          <div className={styles.infoBox}>
            <p>
              Taxes will not be collected for instant orders. To collect taxes enable "Country" and "State / province" collection in your Invoice settings.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fixed price</label>
            <p className={styles.fieldDescription}>Request form add-ons may be applied</p>
            <div className={styles.priceRow}>
              <select
                value={data.currency}
                onChange={(e) => onDataChange({ currency: e.target.value })}
                className={styles.currencySelect}
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={data.fixedPrice}
                onChange={(e) => onDataChange({ fixedPrice: e.target.value })}
                className={styles.priceInput}
                min="0"
              />
            </div>
          </div>

          <div className={styles.field}>
            <button
              type="button"
              className={styles.addButton}
              onClick={() => {/* TODO: Add add-ons modal */}}
            >
              + Add existing add-ons
            </button>
            <div className={styles.addonsInfo}>
              <strong>Add-ons + licenses</strong>
              <p className={styles.fieldDescription}>
                No built-in add-ons or licensing yet. Add new via Request form.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <h4 className={styles.sectionTitle}>Fixed timeline</h4>

            <label className={styles.fieldLabel}>Estimated start</label>
            <p className={styles.fieldDescription}>
              When you expect to start work in relation to when client submits order.
            </p>
            <select
              value={data.estimatedStart}
              onChange={(e) => onDataChange({ estimatedStart: e.target.value })}
              className={styles.fieldSelect}
            >
              {ESTIMATED_START_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <label className={styles.fieldLabel}>Guaranteed delivery within</label>
            <p className={styles.fieldDescription}>
              In relation to when client submits order. They may request a full refund after this date.
            </p>
            <select
              value={data.guaranteedDelivery}
              onChange={(e) => onDataChange({ guaranteedDelivery: e.target.value })}
              className={styles.fieldSelect}
            >
              {GUARANTEED_DELIVERY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Samples - Common for both */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Samples</label>
        <MediaSelector
          mediaItems={data.mediaItems}
          onMediaAdd={mediaHandlers.handleImageAdd}
          onYouTubeAdd={mediaHandlers.handleYouTubeAdd}
          onMediaRemove={mediaHandlers.handleRemoveMedia}
          onToggleSensitiveContent={mediaHandlers.toggleMediaSensitiveContent}
          onToggleSensitiveType={mediaHandlers.toggleMediaSensitiveType}
          onDragStart={mediaHandlers.handleDragStart}
          onDragOver={mediaHandlers.handleDragOver}
          onDragEnd={mediaHandlers.handleDragEnd}
          onFileDrop={mediaHandlers.handleFileDrop}
          onDragOverDrop={mediaHandlers.handleDragOverDrop}
          maxItems={12}
          showSensitiveControls={true}
          description="Max 8MB each, JPG, PNG, GIF, WEBP, or Youtube links (public or unlisted). First 6 media displayed in preview. First 12 media displayed in service."
        />
      </div>

      {/* Description - Common for both */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Description</label>
        <p className={styles.fieldDescription}>
          Use the following template or fill this box with whatever you'd like. If you mention any prices in your description, it's recommended you add the currency to avoid confusions.
        </p>
        <textarea
          value={data.description}
          onChange={(e) => onDataChange({ description: e.target.value })}
          className={styles.largeTextarea}
          rows={12}
        />
      </div>

      {/* Discounts - Common for both */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Discounts</label>
        <p className={styles.fieldDescription}>
          Only 1 active discount can be live on a product at once - highest ranked sale will be applied
        </p>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.secondaryButton}>
            + Add existing
          </button>
          <button type="button" className={styles.secondaryButton}>
            + Create new
          </button>
        </div>
      </div>

      {/* Search tags - Common for both */}
      <div className={styles.field}>
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>Search tags</label>
          <span className={styles.tagCount}>Max 5</span>
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags..."
          className={styles.input}
          disabled={data.searchTags.length >= 5}
        />

        {data.searchTags.length > 0 && (
          <div className={styles.tagsContainer}>
            {data.searchTags.map((tag, index) => (
              <div key={index} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={styles.tagRemove}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <p className={styles.fieldDescription}>
          Suggested: (Display most commonly applied tags here)
        </p>
      </div>

      {/* Next button */}
      <div className={styles.field}>
        <button type="button" className={styles.nextButton} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
};

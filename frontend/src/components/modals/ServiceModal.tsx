import { useState, useEffect } from 'react';
import { SlotsModal, SlotsData } from './SlotsModal';
import { SearchCategoryModal } from './SearchCategoryModal';
import { ServiceDetailsTab, ServiceDetailsData } from './ServiceDetailsTab';
import { useServiceMedia } from '../../hooks/useServiceMedia';
import styles from './ServiceModal.module.css';
import { SearchCategoryData, Service } from '../../models';
import { PortfolioMediaUpload } from '../../models/Portfolio';

type ServiceStatus = 'OPEN' | 'WAITLIST' | 'CLOSED' | 'UNLISTED' | 'DRAFT';
type ServiceTab = 'setup' | 'details' | 'workflow' | 'request-form' | 'terms';
type ServiceType = 'custom' | 'personalized';
type CommunicationStyle = 'open' | 'surprise';
type RequestingProcess = 'custom_proposal' | 'instant_order';

interface ServiceModalProps {
  onClose: () => void;
  onSave: (serviceData: any) => void;
  defaultCategoryId?: string | number;
  categories: Array<{ id: string | number; name: string }>;
  existingService?: Service | null;
}

export const ServiceModal = ({
  onClose,
  onSave,
  defaultCategoryId,
  categories,
  existingService
}: ServiceModalProps) => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('setup');
  const [categoryId, setCategoryId] = useState<string | number>(
    existingService?.categoryId ?? defaultCategoryId ?? 'other'
  );
  const [status, setStatus] = useState<ServiceStatus>(
    (existingService?.status as ServiceStatus) || 'DRAFT'
  );
  const [notifyFollowers, setNotifyFollowers] = useState(existingService?.notifyFollowers ?? false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(
    existingService?.slotsData as SlotsData | null ?? null
  );
  const [showSearchCategoryModal, setShowSearchCategoryModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorTimeoutId, setErrorTimeoutId] = useState<number | null>(null);

  // Setup tab state
  const [serviceType, setServiceType] = useState<ServiceType>(
    (existingService?.serviceType as ServiceType) || 'custom'
  );
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>(
    (existingService?.communicationStyle as CommunicationStyle) || 'open'
  );
  const [requestingProcess, setRequestingProcess] = useState<RequestingProcess>(
    (existingService?.requestingProcess as RequestingProcess) || 'custom_proposal'
  );
  // Initialize searchCategoryData from existing service if available
  const [searchCategoryData, setSearchCategoryData] = useState<SearchCategoryData | null>(() => {
    if (existingService?.searchCategoryData) {
      const scd = existingService.searchCategoryData;
      return {
        isDiscoverable: scd.isDiscoverable ?? true,
        catalogueId: scd.catalogueId,
        categoryId: scd.categoryId,
        subCategorySelections: scd.subCategorySelections || [],
      };
    }
    return null;
  });

  // Start/End dates
  const [startDate, setStartDate] = useState<string>(
    existingService?.startDate ? new Date(existingService.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState<string>(
    existingService?.endDate ? new Date(existingService.endDate).toISOString().split('T')[0] : ''
  );

  // Details tab state
  const [detailsData, setDetailsData] = useState<ServiceDetailsData>({
    serviceName: existingService?.title || '',
    currency: existingService?.currency || 'EUR',
    basePrice: existingService?.basePrice ? (existingService.basePrice / 100).toString() : '0',
    fixedPrice: existingService?.fixedPrice ? (existingService.fixedPrice / 100).toString() : '0',
    proposalScope: existingService?.proposalScope || `Confirm what's going to be done if anything was unclear from the service description or additional add-ons were requested.\n\nIf everything is covered by the service description already, you can just send a "Thank you for your commission!"`,
    estimatedStart: existingService?.estimatedStart || 'This month',
    guaranteedDelivery: existingService?.guaranteedDelivery || '7 days',
    description: existingService?.description || `Includes\n* [List of features]\n\n\nDetails\n* [File deliverables]\n* [Compatibility]\n\n\nAdd-ons\n* [List of options]\n\n\nImportant\n* [Important notes]\n`,
    searchTags: (existingService?.searchTags as string[]) || [],
    mediaItems: [],
  });

  // Media handlers from useServiceMedia hook
  const {
    mediaItems,
    setMediaItems,
    handleImageAdd,
    handleYouTubeAdd,
    handleRemoveMedia,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleFileDrop,
    handleDragOverDrop,
    toggleMediaSensitiveContent,
    toggleMediaSensitiveType,
  } = useServiceMedia(12);

  // Load existing media items when editing
  useEffect(() => {
    if (existingService?.media && existingService.media.length > 0) {
      const convertedMedia: PortfolioMediaUpload[] = existingService.media.map((m) => ({
        id: `existing-${m.id}`,
        mediaType: m.mediaType as 'image' | 'youtube',
        preview: m.fileUrl || undefined,
        youtubeUrl: m.youtubeUrl || undefined,
        sortOrder: m.sortOrder,
        hasSensitiveContent: m.hasSensitiveContent,
        sensitiveContentTypes: m.sensitiveContentTypes || [],
        // Keep reference to existing media for updates
        existingMediaId: m.id,
      }));
      setMediaItems(convertedMedia);
    }
  }, [existingService, setMediaItems]);

  // Sync mediaItems with detailsData
  const handleDetailsDataChange = (data: Partial<ServiceDetailsData>) => {
    setDetailsData(prev => ({ ...prev, ...data }));
  };

  // Workflow, Request Form, Terms state
  const [workflowId, setWorkflowId] = useState<string>(existingService?.workflowId || '');
  const [requestFormId, setRequestFormId] = useState<string>(existingService?.requestFormId || '');
  const [termsId, setTermsId] = useState<string>(existingService?.termsId || '');

  // Get validation errors
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    if (!detailsData.serviceName.trim()) {
      errors.push('Service name is required');
    }

    if (!searchCategoryData) {
      errors.push('Search category must be selected');
    }

    if (mediaItems.length === 0) {
      errors.push('At least one media item is required');
    }

    if (requestingProcess === 'custom_proposal' && parseFloat(detailsData.basePrice) <= 0) {
      errors.push('Base price must be greater than 0 for custom proposals');
    }

    if (requestingProcess === 'instant_order' && parseFloat(detailsData.fixedPrice) <= 0) {
      errors.push('Fixed price must be greater than 0 for instant orders');
    }

    if (!detailsData.description.trim()) {
      errors.push('Description is required');
    }

    return errors;
  };

  const validationErrors = getValidationErrors();
  const canPublish = validationErrors.length === 0;

  const handlePublish = () => {
    if (!canPublish) {
      // Clear any existing timeout
      if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
      }

      // Show the first error
      setShowError(true);

      // Set timeout to fade out after 10 seconds
      const timeoutId = setTimeout(() => {
        setShowError(false);
      }, 10000) as unknown as number;

      setErrorTimeoutId(timeoutId);

      return;
    }

    const serviceData = {
      // Sidebar data
      categoryId,
      status,
      notifyFollowers,
      slotsData,
      startDate,
      endDate,
      // Setup tab
      searchCategoryData,
      serviceType,
      communicationStyle,
      requestingProcess,
      // Details tab
      serviceName: detailsData.serviceName,
      currency: detailsData.currency,
      basePrice: detailsData.basePrice,
      fixedPrice: detailsData.fixedPrice,
      proposalScope: detailsData.proposalScope,
      estimatedStart: detailsData.estimatedStart,
      guaranteedDelivery: detailsData.guaranteedDelivery,
      description: detailsData.description,
      searchTags: detailsData.searchTags,
      mediaItems,
      // Other tabs
      workflowId,
      requestFormId,
      termsId,
    };
    onSave(serviceData);
  };

    const handleSaveSlots = (data: SlotsData) => {
        setSlotsData(data);
        setShowSlotsModal(false);
    };

    const handleSaveSearchCategory = (data: SearchCategoryData) => {
        setSearchCategoryData(data);
        setShowSearchCategoryModal(false);
    };

    const handleNextTab = () => {
        const tabs: ServiceTab[] = ['setup', 'details', 'workflow', 'request-form', 'terms'];
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
        }
    };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return (
          <div className={styles.tabContent}>
            {/* Choose search category */}
            <div className={styles.field}>
              <button
                className={styles.searchCategoryButton}
                onClick={() => setShowSearchCategoryModal(true)}
              >
                Choose search category
              </button>
            </div>

            {/* Service type */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Service type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className={styles.fieldSelect}
              >
                <option value="custom">Custom</option>
                <option value="personalized">Personalized (YCH)</option>
              </select>
              <p className={styles.fieldDescription}>
                {serviceType === 'custom' 
                  ? 'Made from scratch' 
                  : 'Made from template'}
              </p>
            </div>

            {/* Communication style */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Communication style</label>
              <select
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value as CommunicationStyle)}
                className={styles.fieldSelect}
              >
                <option value="open">Open communication</option>
                <option value="surprise">Surprise me</option>
              </select>
              <p className={styles.fieldDescription}>
                {communicationStyle === 'open' 
                  ? 'WIP updates + revisions available' 
                  : 'No WIP updates + mistake fixes only'}
              </p>
            </div>

            {/* Requesting process */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Requesting process</label>
              <select
                value={requestingProcess}
                onChange={(e) => setRequestingProcess(e.target.value as RequestingProcess)}
                className={styles.fieldSelect}
              >
                <option value="custom_proposal">Custom proposal</option>
                <option value="instant_order">Instant order</option>
              </select>
              <p className={styles.fieldDescription}>
                {requestingProcess === 'custom_proposal' 
                  ? 'Client submits request form. Choose to accept by sending custom scope and time. Client pays to confirm.' 
                  : 'Client pays a fixed price to submit request form. Requests are auto-accepted and confirmed instantly.'}
              </p>
            </div>

            {/* Next button */}
            <div className={styles.field}>
              <button className={styles.nextButton} onClick={handleNextTab}>
                Next
              </button>
            </div>
          </div>
        );
      case 'details':
        return (
          <ServiceDetailsTab
            requestingProcess={requestingProcess}
            onRequestingProcessChange={setRequestingProcess}
            onNext={handleNextTab}
            data={{ ...detailsData, mediaItems }}
            onDataChange={handleDetailsDataChange}
            mediaHandlers={{
              handleImageAdd,
              handleYouTubeAdd,
              handleRemoveMedia,
              toggleMediaSensitiveContent,
              toggleMediaSensitiveType,
              handleDragStart,
              handleDragOver,
              handleDragEnd,
              handleFileDrop,
              handleDragOverDrop,
            }}
          />
        );
      case 'workflow':
        return (
          <div className={styles.tabContent}>
            <div className={styles.choiceRow}>
              <select
                className={styles.choiceSelect}
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
              >
                <option value="">Choose existing workflow</option>
              </select>
              <button type="button" className={styles.createNewButton}>
                Create new
              </button>
            </div>

            <div className={styles.field}>
              <button className={styles.nextButton} onClick={handleNextTab}>
                Next
              </button>
            </div>
          </div>
        );
      case 'request-form':
        return (
          <div className={styles.tabContent}>
            <div className={styles.choiceRow}>
              <select
                className={styles.choiceSelect}
                value={requestFormId}
                onChange={(e) => setRequestFormId(e.target.value)}
              >
                <option value="">Choose existing request form</option>
              </select>
              <button type="button" className={styles.createNewButton}>
                Create new
              </button>
            </div>

            <div className={styles.field}>
              <button className={styles.nextButton} onClick={handleNextTab}>
                Next
              </button>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className={styles.tabContent}>
            <div className={styles.choiceRow}>
              <select
                className={styles.choiceSelect}
                value={termsId}
                onChange={(e) => setTermsId(e.target.value)}
              >
                <option value="">Choose existing terms of service</option>
              </select>
              <button type="button" className={styles.createNewButton}>
                Create new
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top bar with close and publish buttons */}
        <div className={styles.topBar}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
          <div className={styles.publishContainer}>
            {validationErrors.length > 0 && showError && (
              <div className={`${styles.validationErrors} ${showError ? styles.fadeIn : styles.fadeOut}`}>
                {validationErrors[0]}
              </div>
            )}
            <button
              className={styles.publishBtn}
              onClick={handlePublish}
            >
              {existingService ? 'Save' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className={styles.content}>
          {/* Left sidebar */}
          <div className={styles.sidebar}>
            {/* Category selector */}
            <div className={styles.sidebarSection}>
              <label className={styles.label}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status dropdown */}
            <div className={styles.sidebarSection}>
              <label className={styles.label}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className={styles.select}
              >
                <option value="OPEN">Open</option>
                <option value="WAITLIST">Waitlist</option>
                <option value="CLOSED">Closed</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Slots button */}
            <div className={styles.sidebarSection}>
              <button 
                className={styles.sidebarButton}
                onClick={() => setShowSlotsModal(true)}
              >
                Slots
              </button>
            </div>

            {/* Start/End date */}
            <div className={styles.sidebarSection}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.sidebarSection}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Notify followers toggle */}
            <div className={styles.sidebarSection}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={notifyFollowers}
                  onChange={(e) => setNotifyFollowers(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Notify followers on status change</span>
              </label>
            </div>
          </div>

          {/* Right main area */}
          <div className={styles.mainArea}>
            {/* Tab navigation */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tab} ${activeTab === 'setup' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('setup')}
              >
                Setup
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'workflow' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('workflow')}
              >
                Workflow
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'request-form' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('request-form')}
              >
                Request Form
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'terms' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('terms')}
              >
                Terms of Service
              </button>
            </div>

            {/* Tab content */}
            {renderTabContent()}
          </div>
        </div>

        {/* Slots modal */}
        {showSlotsModal && (
          <SlotsModal
            onClose={() => setShowSlotsModal(false)}
            onSave={handleSaveSlots}
            initialData={slotsData || undefined}
          />
        )}

        {/* Search category modal (placeholder) */}
        {showSearchCategoryModal && (
            <SearchCategoryModal
                onClose={() => setShowSearchCategoryModal(false)}
                onSave={handleSaveSearchCategory}
                initialData={searchCategoryData || undefined}
            />
        )}
      </div>
    </div>
  );
};

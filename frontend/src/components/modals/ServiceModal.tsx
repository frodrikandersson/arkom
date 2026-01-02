import { useState } from 'react';
import { SlotsModal, SlotsData } from './SlotsModal';
import { SearchCategoryModal } from './SearchCategoryModal';
import styles from './ServiceModal.module.css';
import { SearchCategoryData } from '../../models';

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
}

export const ServiceModal = ({ 
  onClose, 
  onSave, 
  defaultCategoryId,
  categories 
}: ServiceModalProps) => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('setup');
  const [categoryId, setCategoryId] = useState<string | number>(defaultCategoryId || 'other');
  const [status, setStatus] = useState<ServiceStatus>('DRAFT');
  const [notifyFollowers, setNotifyFollowers] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotsData | null>(null);
  const [showSearchCategoryModal, setShowSearchCategoryModal] = useState(false);

  // Setup tab state
  const [serviceType, setServiceType] = useState<ServiceType>('custom');
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>('open');
  const [requestingProcess, setRequestingProcess] = useState<RequestingProcess>('custom_proposal');
  const [searchCategoryData, setSearchCategoryData] = useState<SearchCategoryData | null>(null);


  // Check if required fields are filled to enable publish button
  const canPublish = false; // TODO: Implement validation logic

  const handlePublish = () => {
    // TODO: Validate and save service data
    const serviceData = {
      categoryId,
      status,
      notifyFollowers,
      serviceType,
      communicationStyle,
      requestingProcess,
      slotsData,
      // Add more fields as we build them
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
        return <div className={styles.tabContent}>Details content goes here</div>;
      case 'workflow':
        return <div className={styles.tabContent}>Workflow content goes here</div>;
      case 'request-form':
        return <div className={styles.tabContent}>Request Form content goes here</div>;
      case 'terms':
        return <div className={styles.tabContent}>Terms of Service content goes here</div>;
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
          <button 
            className={styles.publishBtn}
            onClick={handlePublish}
            disabled={!canPublish}
          >
            Publish
          </button>
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
                className={styles.input}
              />
            </div>

            <div className={styles.sidebarSection}>
              <label className={styles.label}>End Date</label>
              <input 
                type="date" 
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

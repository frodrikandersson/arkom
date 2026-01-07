import { useEffect, useState, useCallback } from 'react';
import { Service } from '../../models';
import * as serviceApi from '../../services/serviceService';
import { ServiceViewModal } from '../modals/ServiceViewModal';
import styles from './UserServicesGrid.module.css';

interface ShopOwner {
  id: string;
  displayName: string;
  username: string;
  profileImageUrl?: string;
}

interface UserServicesGridProps {
  userId: string;
  isOwnProfile: boolean;
  shopOwner: ShopOwner;
  selectedServiceId?: number | null;
  onServiceModalClose?: () => void;
}

export const UserServicesGrid = ({
  userId,
  isOwnProfile,
  shopOwner,
  selectedServiceId,
  onServiceModalClose
}: UserServicesGridProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch services for the specific user
      const { services: fetchedServices } = await serviceApi.getServicesByUserId(userId);
      // Filter only OPEN services for public view, all services for own profile
      const filteredServices = isOwnProfile
        ? fetchedServices
        : fetchedServices.filter(s => s.status === 'OPEN' && s.isActive);
      setServices(filteredServices);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Auto-open service modal if selectedServiceId is provided
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const service = services.find(s => s.id === selectedServiceId);
      if (service) {
        setViewingService(service);
      }
    }
  }, [selectedServiceId, services]);

  const handleServiceClick = (service: Service) => {
    setViewingService(service);
  };

  const handleCloseModal = () => {
    setViewingService(null);
    onServiceModalClose?.();
  };

  const handleRequestService = () => {
    // TODO: Implement service request flow
    console.log('Request service:', viewingService?.id);
  };

  if (loading) {
    return <div className={styles.loading}>Loading services...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (services.length === 0) {
    return (
      <div className={styles.empty}>
        {isOwnProfile ? 'You haven\'t created any services yet' : 'No services available'}
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {services.map((service) => (
          <div
            key={service.id}
            className={styles.serviceCard}
            onClick={() => handleServiceClick(service)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.thumbnail}>
              {service.media && service.media.length > 0 ? (
                <img
                  src={service.media[0].fileUrl || service.media[0].thumbnailUrl || ''}
                  alt={service.title}
                />
              ) : (
                <div className={styles.placeholderThumbnail}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.info}>
              <h3 className={styles.title}>{service.title}</h3>
              <p className={styles.price}>
                From €{((service.requestingProcess === 'custom_proposal' ? service.basePrice : service.fixedPrice) / 100).toFixed(2)}
              </p>
              {isOwnProfile && (
                <span className={styles.status}>{service.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Service View Modal */}
      {viewingService && (
        <ServiceViewModal
          service={viewingService}
          shopOwner={shopOwner}
          onClose={handleCloseModal}
          onRequestService={handleRequestService}
        />
      )}
    </>
  );
};

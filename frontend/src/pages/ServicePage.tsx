import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../services/serviceService';
import { Service } from '../models';
import { ServiceViewModal } from '../components/modals/ServiceViewModal';
import { api } from '../utils/apiClient';

interface UserProfile {
  id: string;
  displayName: string | null;
  username: string | null;
  profileImageUrl: string | null;
}

export const ServicePage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [shopOwner, setShopOwner] = useState<{
    id: string;
    displayName: string;
    username: string;
    profileImageUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) return;

      try {
        const { service: fetchedService } = await getServiceById(parseInt(serviceId));
        setService(fetchedService);

        // Fetch the shop owner's info (public endpoint)
        const { profile } = await api.get<{ profile: UserProfile }>(
          `/api/users/profile/${fetchedService.userId}`
        );

        setShopOwner({
          id: profile.id,
          displayName: profile.displayName || 'Unknown',
          username: profile.username || profile.id.slice(0, 8),
          profileImageUrl: profile.profileImageUrl,
        });
      } catch (err) {
        console.error('Failed to load service:', err);
        setError('Service not found');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  const handleClose = () => {
    // Navigate to the shop owner's profile with services tab
    if (shopOwner) {
      navigate(`/profile/${shopOwner.id}?tab=services`);
    } else {
      navigate('/');
    }
  };

  const handleRequestService = () => {
    // TODO: Implement request flow
    console.log('Request service:', service?.id);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--color-text)'
      }}>
        Loading...
      </div>
    );
  }

  if (error || !service || !shopOwner) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--color-text)',
        gap: '16px'
      }}>
        <p>{error || 'Service not found'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            background: 'var(--color-accent)',
            color: 'var(--color-background)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <ServiceViewModal
      service={service}
      shopOwner={shopOwner}
      onClose={handleClose}
      onRequestService={handleRequestService}
    />
  );
};

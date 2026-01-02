import { useState } from 'react';
import styles from './SlotsModal.module.css';

type ServiceStatus = 'CLOSED' | 'WAITLIST' | 'UNLISTED' | 'DRAFT';
type SlotTrigger = 'submitted_requests' | 'sent_proposals' | 'paid_commissions';

interface SlotsModalProps {
  onClose: () => void;
  onSave: (slotsData: SlotsData) => void;
  initialData?: SlotsData;
}

export interface SlotsData {
  afterCount: number;
  triggerType: SlotTrigger;
  changeStatusTo: ServiceStatus;
  publiclyDisplay: boolean;
}

export const SlotsModal = ({ onClose, onSave, initialData }: SlotsModalProps) => {
  const [afterCount, setAfterCount] = useState(initialData?.afterCount || 0);
  const [triggerType, setTriggerType] = useState<SlotTrigger>(
    initialData?.triggerType || 'submitted_requests'
  );
  const [changeStatusTo, setChangeStatusTo] = useState<ServiceStatus>(
    initialData?.changeStatusTo || 'CLOSED'
  );
  const [publiclyDisplay, setPubliclyDisplay] = useState(
    initialData?.publiclyDisplay || false
  );

  const handleSave = () => {
    onSave({
      afterCount,
      triggerType,
      changeStatusTo,
      publiclyDisplay,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete slots configuration?')) {
      // TODO: Handle delete
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top row */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
          <h2 className={styles.title}>Edit slots</h2>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* After input and trigger dropdown */}
          <div className={styles.row}>
            <label className={styles.label}>After</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                min="0"
                value={afterCount}
                onChange={(e) => setAfterCount(parseInt(e.target.value) || 0)}
                className={styles.numberInput}
              />
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as SlotTrigger)}
                className={styles.select}
              >
                <option value="submitted_requests">Submitted requests</option>
                <option value="sent_proposals">Sent proposals</option>
                <option value="paid_commissions">Paid for commissions</option>
              </select>
            </div>
          </div>

          {/* Change status dropdown */}
          <div className={styles.row}>
            <label className={styles.label}>Change service status to</label>
            <select
              value={changeStatusTo}
              onChange={(e) => setChangeStatusTo(e.target.value as ServiceStatus)}
              className={styles.select}
            >
              <option value="CLOSED">Status: CLOSED</option>
              <option value="WAITLIST">Status: WAITLIST</option>
              <option value="UNLISTED">Status: UNLISTED</option>
              <option value="DRAFT">Status: DRAFT</option>
            </select>
          </div>

          {/* Publicly display toggle */}
          <div className={styles.row}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={publiclyDisplay}
                onChange={(e) => setPubliclyDisplay(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Publicly display (when end time is not displayed)</span>
            </label>
          </div>

          {/* Delete button */}
          <div className={styles.row}>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              Delete slots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

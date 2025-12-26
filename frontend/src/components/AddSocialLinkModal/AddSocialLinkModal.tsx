import { useState } from 'react';
import { SocialLink } from '../../models';
import styles from './AddSocialLinkModal.module.css';
import { SocialIcon } from '../SocialIcon/SocialIcon';

interface AddSocialLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (platform: string, link: SocialLink) => void;
    existingLink?: { platform: string; link: SocialLink };
}

export const AddSocialLinkModal = ({ isOpen, onClose, onSave, existingLink }: AddSocialLinkModalProps) => {
    const [domain, setDomain] = useState(existingLink?.link.domain || '');
    const [handle, setHandle] = useState(existingLink?.link.handle || '');

    if (!isOpen) return null;

    const handleSave = () => {
        const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
        const cleanHandle = handle.trim().replace(/^\//, '');
        
        if (!cleanDomain || !cleanHandle) {
            alert('Please enter both domain and handle');
            return;
        }

        const platformName = cleanDomain.split('.')[0];
        onSave(platformName.toLowerCase().replace(/[^a-z0-9_-]/g, ''), { 
            domain: cleanDomain, 
            handle: cleanHandle 
        });
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                    <h3>{existingLink ? 'Edit Link' : 'Add Link'}</h3>
                    <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                </div>

                <div className={styles.content}>
                    <label className={styles.label}>Domain</label>
                    <div className={styles.urlInputWrapper}>
                        <div className={styles.logoIcon}>
                            <SocialIcon domain={domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '')} size={20} />
                        </div>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="twitter.com"
                            className={styles.urlInput}
                            autoFocus
                        />
                    </div>

                    <label className={styles.label}>Handle</label>
                    <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        placeholder="username"
                        className={styles.nameInput}
                    />
                </div>
            </div>
        </div>
    );
};

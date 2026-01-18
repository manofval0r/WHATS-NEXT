import React, { useState } from 'react';
import { Award, Download, Share2, ExternalLink, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import api from '../../api';

/**
 * CertificateCard Component
 * Displays a shareable certificate card with download and social share options
 * 
 * Props:
 * - certificate: Certificate data object
 * - moduleTitle: Title of the completed module
 * - userName: User's display name
 * - itemId: Roadmap item ID for API calls
 */
const CertificateCard = ({ certificate, moduleTitle, userName, itemId }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!itemId) return;
    
    setDownloading(true);
    try {
      const response = await api.get(`/api/certificate/${itemId}/generate/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificate?.certificate_id || 'module'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenInNewTab = async () => {
    if (!itemId) return;
    
    try {
      const response = await api.get(`/api/certificate/${itemId}/generate/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to open certificate:', err);
    }
  };

  const shareUrl = certificate?.certificate_id 
    ? `${window.location.origin}/verify/${certificate.certificate_id}`
    : window.location.href;

  const shareText = `I just earned my "${moduleTitle}" certificate on What's Next! 🎉 #WN_VERIFIED #LearningJourney`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  if (!certificate) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      style={{
        background: 'linear-gradient(135deg, rgba(95, 245, 255, 0.05), rgba(167, 139, 250, 0.05))',
        borderRadius: '16px',
        border: '1px solid rgba(95, 245, 255, 0.2)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Decorative corners */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        width: '30px',
        height: '30px',
        borderLeft: '2px solid var(--neon-cyan)',
        borderTop: '2px solid var(--neon-cyan)'
      }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '30px',
        height: '30px',
        borderRight: '2px solid var(--neon-violet)',
        borderTop: '2px solid var(--neon-violet)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        width: '30px',
        height: '30px',
        borderLeft: '2px solid var(--neon-violet)',
        borderBottom: '2px solid var(--neon-violet)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        width: '30px',
        height: '30px',
        borderRight: '2px solid var(--neon-cyan)',
        borderBottom: '2px solid var(--neon-cyan)'
      }} />

      {/* Certificate content */}
      <div style={{ padding: '32px', textAlign: 'center' }}>
        {/* Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
            marginBottom: '20px'
          }}
        >
          <Award size={32} color="#0d0a1f" />
        </motion.div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--neon-gold)',
          letterSpacing: '2px'
        }}>
          CERTIFICATE_OF_COMPLETION
        </h3>

        {/* Module name */}
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '22px',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          textTransform: 'uppercase'
        }}>
          {moduleTitle}
        </h2>

        {/* User name */}
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Awarded to
        </p>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--neon-cyan)'
        }}>
          {userName}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-cyan)'
            }}>
              {certificate.github_score || 0}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              letterSpacing: '1px'
            }}>
              SCORE
            </div>
          </div>
          <div style={{
            width: '1px',
            background: 'var(--void-glow)'
          }} />
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-violet)'
            }}>
              {certificate.peer_verifications || 0}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              letterSpacing: '1px'
            }}>
              PEER_REVIEWS
            </div>
          </div>
        </div>

        {/* Certificate ID */}
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          marginBottom: '24px'
        }}>
          ID: {certificate.certificate_id}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleOpenInNewTab}
          >
            <ExternalLink size={14} style={{ marginRight: '6px' }} />
            VIEW
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={14} style={{ marginRight: '6px' }} />
            {downloading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </Button>
        </div>

        {/* Share section */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            marginBottom: '12px',
            letterSpacing: '1px'
          }}>
            // SHARE_ACHIEVEMENT
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleShareTwitter}
              style={{
                padding: '10px',
                background: 'rgba(29, 161, 242, 0.1)',
                border: '1px solid rgba(29, 161, 242, 0.3)',
                borderRadius: '8px',
                color: '#1DA1F2',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(29, 161, 242, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(29, 161, 242, 0.1)'}
            >
              <Twitter size={18} />
            </button>
            <button
              onClick={handleShareLinkedIn}
              style={{
                padding: '10px',
                background: 'rgba(0, 119, 181, 0.1)',
                border: '1px solid rgba(0, 119, 181, 0.3)',
                borderRadius: '8px',
                color: '#0077B5',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(0, 119, 181, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(0, 119, 181, 0.1)'}
            >
              <Linkedin size={18} />
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: copied ? 'var(--neon-green)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;

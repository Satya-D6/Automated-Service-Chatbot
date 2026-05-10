import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCaptured(dataUrl);
    stopCamera();
  };

  const sendPhoto = () => {
    if (captured) {
      onCapture({ type: 'image', url: captured, name: 'Camera Photo' });
    }
    onClose();
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={e => e.stopPropagation()}>
        <h3><Camera size={20} /> Camera {error ? '— Unavailable' : ''}</h3>

        <div className="camera-preview">
          {error ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 240, color: 'var(--wa-text-secondary)', fontSize: '0.88rem', textAlign: 'center', padding: 20
            }}>
              📷 Camera access denied or unavailable.<br />
              Please use the attachment button to upload photos instead.
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
          )}
        </div>

        <div className="camera-actions">
          {error ? (
            <button className="btn-cancel" onClick={onClose}>Close</button>
          ) : captured ? (
            <>
              <button className="btn-cancel" onClick={retake}>Retake</button>
              <button className="btn-send-photo" onClick={sendPhoto}>Send Photo</button>
            </>
          ) : (
            <>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-capture" onClick={capture}>
                <Camera size={16} style={{ marginRight: 6 }} /> Capture
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

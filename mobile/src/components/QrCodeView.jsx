import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QrCodeView({
  value,
  size = 200,
  darkColor = '#0f172a',
  lightColor = '#ffffff',
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1.5,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('Lỗi sinh mã QR:', error);
      }
    );
  }, [value, size, darkColor, lightColor]);

  return (
    <div className={`qr-code-canvas-container ${className}`} style={{ display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ borderRadius: '12px', display: 'block', maxWidth: '100%' }} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

const AlphanumericCaptcha = ({ onCaptchaChange, reset }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generateRandomString = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Add noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Draw text with distortions
    const charWidth = width / (text.length + 1);
    
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      
      const x = charWidth * (i + 0.8);
      const y = height / 2;
      
      // Random rotation and position
      const rotation = (Math.random() - 0.5) * 0.4;
      const yOffset = (Math.random() - 0.5) * 10;
      
      ctx.translate(x, y + yOffset);
      ctx.rotate(rotation);
      
      // Random font properties
      const fontSize = 20 + Math.random() * 8;
      const fontWeight = Math.random() > 0.5 ? 'bold' : 'normal';
      const fontFamily = ['Arial', 'Georgia', 'Courier New'][Math.floor(Math.random() * 3)];
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  const generateNewCaptcha = () => {
    const newText = generateRandomString();
    setCaptchaText(newText);
    setUserInput('');
    drawCaptcha(newText);
    onCaptchaChange(false);
    console.log('CAPTCHA Debug - Generated new text:', newText);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  useEffect(() => {
    if (reset) {
      generateNewCaptcha();
    }
  }, [reset]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Check if input is complete (same length as captcha)
    if (value.length === captchaText.length) {
      const isValid = value === captchaText;
      onCaptchaChange(isValid);
      
      if (!isValid) {
        setError('CAPTCHA incorrect! Generating new one...');
        setTimeout(() => {
          generateNewCaptcha();
          setError('');
        }, 1500);
      } else {
        setError('');
      }
      
      console.log('CAPTCHA Debug - Text:', captchaText, 'Input:', value, 'Valid:', isValid);
    } else {
      onCaptchaChange(false);
      setError('');
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="captcha">ENTER CAPTCHA :</label>
      <div className="captcha-container">
        <div className="captcha-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="captcha-canvas"
          />
        </div>
        <button
          type="button"
          onClick={generateNewCaptcha}
          className="captcha-refresh-btn"
          title="Get new CAPTCHA"
        >
          ↻
        </button>
      </div>
      <input
        id="captcha"
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Enter CAPTCHA text"
        className="captcha-input"
      />
      {error && (
        <div className="captcha-error" style={{ 
          color: '#d32f2f', 
          fontSize: '12px', 
          marginTop: '4px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AlphanumericCaptcha;

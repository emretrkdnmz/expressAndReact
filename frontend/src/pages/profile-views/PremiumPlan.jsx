import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PremiumPlan.css';

const PremiumPlan = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Checkout Form States
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Validation States
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-formatting for Card Number (e.g., 4444 4444 4444 4444)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
    
    // Clear error
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: null }));
    }
  };

  // Auto-formatting for Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiryDate(value);
    }
    
    // Clear error
    if (errors.expiryDate) {
      setErrors(prev => ({ ...prev, expiryDate: null }));
    }
  };

  // CVV Handling (Max 3 chars)
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
    
    // Clear error
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: null }));
    }
  };

  const handleNameChange = (e) => {
    setCardholderName(e.target.value);
    if (errors.cardholderName) {
      setErrors(prev => ({ ...prev, cardholderName: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Kart sahibi adı zorunludur.';
    }
    
    const plainCardNumber = cardNumber.replace(/\s/g, '');
    if (plainCardNumber.length !== 16) {
      newErrors.cardNumber = 'Geçersiz kart numarası. (16 hane olmalıdır)';
    }
    
    if (expiryDate.length !== 5) {
      newErrors.expiryDate = 'Geçersiz son kullanma tarihi. (AA/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = 'Geçersiz ay (01-12)';
      }
    }
    
    if (cvv.length !== 3) {
      newErrors.cvv = 'Geçersiz CVV. (3 hane olmalıdır)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate standard banking secure verification loader (1.8 seconds)
    setTimeout(async () => {
      try {
        if (!user || !user.token) {
          alert('Ödeme yapmak için giriş yapmalısınız.');
          setIsProcessing(false);
          return;
        }

        const response = await axios.post(
          'http://localhost:5000/api/user/premium',
          {},
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );

        // Update global user state & localStorage
        const updatedUserData = {
          ...response.data,
          token: user.token
        };
        setUser(updatedUserData);
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setIsProcessing(false);
        setShowCelebration(true); // Open celebration screen!
      } catch (err) {
        console.error('Ödeme işlemi başarısız:', err);
        setIsProcessing(false);
        alert(err.response?.data?.message || 'Ödeme tamamlanırken sunucuda hata oluştu.');
      }
    }, 1800);
  };

  // Cancel Premium Subscription
  const handleCancelPremium = async () => {
    const confirmCancel = window.confirm(
      'Premium üyeliğinizi iptal etmek istediğinize emin misiniz?\nReklamsız dinleme, çevrimdışı mod ve tüm özelliklerinizi kaybedeceksiniz.'
    );
    if (!confirmCancel) return;

    try {
      if (!user || !user.token) return;
      const response = await axios.post(
        'http://localhost:5000/api/user/premium/cancel',
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      // Revert user state & localStorage
      const updatedUserData = {
        ...response.data,
        token: user.token
      };
      setUser(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      alert('Premium üyeliğiniz iptal edildi. Bireysel Ücretsiz Plana geçirildiniz.');
    } catch (err) {
      console.error('İptal işlemi başarısız:', err);
      alert('İptal işlemi yapılırken bir hata oluştu.');
    }
  };

  // Confetti particles generator
  const renderConfetti = () => {
    const confettiArray = Array.from({ length: 40 });
    return (
      <div className="confetti-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        {confettiArray.map((_, i) => {
          const style = {
            position: 'absolute',
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            backgroundColor: ['#7c3aed', '#a78bfa', '#1db954', '#3b82f6', '#f59e0b', '#ec4899'][i % 6],
            top: `-20px`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() + 0.3,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`
          };
          return <div key={i} style={style} />;
        })}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fall {
            to {
              top: 105%;
              transform: translateY(0) rotate(720deg);
            }
          }
        `}} />
      </div>
    );
  };

  const isPremium = user?.premiumStatus === 'Premium';

  return (
    <div className="profile-detail-page">
      {/* Dynamic Processing Overlay */}
      {isProcessing && (
        <div className="payment-processing-overlay">
          <div className="payment-spinner"></div>
          <p>Güvenli ödeme işlemi tamamlanıyor...</p>
        </div>
      )}

      {/* Dynamic Celebration Success Overlay */}
      {showCelebration && (
        <div className="premium-celebration-overlay">
          {renderConfetti()}
          <div className="celebration-card">
            <div className="celebration-icon-badge">
              <i className="fa-solid fa-crown"></i>
            </div>
            <h2>Tebrikler, Artık Premium'sunuz!</h2>
            <p>
              Tebrikler! Ödemeniz başarıyla alındı ve üyeliğiniz **Spotify Premium**'a yükseltildi.<br />
              Şimdi reklamsız, yüksek ses kalitesinde ve sınırsızca müziğin keyfini çıkarın!
            </p>
            <button 
              className="celebration-start-btn" 
              onClick={() => {
                setShowCelebration(false);
                navigate('/songs');
              }}
            >
              Dinlemeye Başla
            </button>
          </div>
        </div>
      )}

      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Premium Üyelik Planı</h2>
      </div>

      <div className="detail-content">
        <div className="premium-plan-container">
          
          {isPremium ? (
            /* ========================================================
               PREMIUM ACTIVE USER SCREEN
               ======================================================== */
            <div className="premium-active-card">
              <div className="active-card-header">
                <div className="active-title-group">
                  <h3>Spotify Premium</h3>
                  <p>Müziğin en saf ve sınırsız hali</p>
                </div>
                <span className="active-premium-badge">AKTİF PLÂN</span>
              </div>
              
              <div className="active-details-list">
                <div className="active-detail-row">
                  <span className="active-detail-label">Plan Türü</span>
                  <span className="active-detail-value">Bireysel Premium</span>
                </div>
                <div className="active-detail-row">
                  <span className="active-detail-label">Ücret</span>
                  <span className="active-detail-value">₺39.99 / ay</span>
                </div>
                <div className="active-detail-row">
                  <span className="active-detail-label">Sonraki Ödeme Tarihi</span>
                  <span className="active-detail-value">27 Haziran 2026</span>
                </div>
                <div className="active-detail-row">
                  <span className="active-detail-label">Ödeme Yöntemi</span>
                  <span className="active-detail-value">Kredi Kartı (•••• 1111)</span>
                </div>
              </div>

              <div className="active-card-actions">
                <button className="premium-manage-btn" onClick={() => alert('Fatura bilgileri ve ödeme makbuzu e-posta adresinize gönderilmiştir.')}>
                  Faturayı Görüntüle
                </button>
                <button className="premium-cancel-btn" onClick={handleCancelPremium}>
                  Premium'u İptal Et
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               FREE LANDING & CARD CHECKOUT SCREEN
               ======================================================== */
            <>
              {/* Landing Hero */}
              <div className="premium-landing-hero">
                <h1>Müziği Sınırsızca Keşfet</h1>
                <p>Premium'a geçerek reklamlara takılmadan, yüksek kalitede müzik dinleyin.</p>
                <div className="premium-price-tag">
                  ₺39.99 <span>/ ay</span>
                </div>
              </div>

              {/* Grid List of Premium Features */}
              <div className="features-grid">
                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <i className="fa-solid fa-ban"></i>
                  </div>
                  <h4>Reklamsız Müzik</h4>
                  <p>Kesintisiz ve reklamsız olarak şarkıların tadını çıkar.</p>
                </div>
                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <i className="fa-solid fa-volume-high"></i>
                  </div>
                  <h4>Üstün Ses Kalitesi</h4>
                  <p>Yüksek çözünürlüklü ses kalitesiyle her ritmi hisset.</p>
                </div>
                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <i className="fa-solid fa-forward"></i>
                  </div>
                  <h4>Sınırsız Atlama</h4>
                  <p>İstediğin şarkıyı seç, beğenmediklerini anında atla.</p>
                </div>
              </div>

              {/* Checkout Block */}
              <div className="premium-checkout-box">
                <h3 className="checkout-box-title">Güvenli Ödeme Yap</h3>

                {/* Credit Card Mockup */}
                <div className="credit-card-mockup">
                  <div className="card-mockup-header">
                    <div className="card-mockup-chip"></div>
                    <span className="card-mockup-type">Premium Card</span>
                  </div>
                  
                  <div className="card-mockup-number">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  
                  <div className="card-mockup-footer">
                    <div>
                      <div className="card-mockup-label">Kart Sahibi</div>
                      <div className="card-mockup-value">
                        {cardholderName.toUpperCase() || 'AD SOYAD'}
                      </div>
                    </div>
                    <div>
                      <div className="card-mockup-label">Son Kullanma</div>
                      <div className="card-mockup-value">
                        {expiryDate || 'AA/YY'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Fields Form */}
                <form className="checkout-payment-form" onSubmit={handlePaymentSubmit}>
                  {/* Name Input */}
                  <div className="form-group-custom">
                    <label htmlFor="cardNameInput">Kart Üzerindeki İsim</label>
                    <div className="input-icon-wrapper-custom">
                      <i className="fa-solid fa-user"></i>
                      <input
                        id="cardNameInput"
                        type="text"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={handleNameChange}
                        className={errors.cardholderName ? 'invalid-field' : ''}
                      />
                    </div>
                    {errors.cardholderName && (
                      <span className="field-error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.cardholderName}
                      </span>
                    )}
                  </div>

                  {/* Card Number Input */}
                  <div className="form-group-custom">
                    <label htmlFor="cardNumberInput">Kart Numarası</label>
                    <div className="input-icon-wrapper-custom">
                      <i className="fa-solid fa-credit-card"></i>
                      <input
                        id="cardNumberInput"
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={errors.cardNumber ? 'invalid-field' : ''}
                      />
                    </div>
                    {errors.cardNumber && (
                      <span className="field-error-msg">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.cardNumber}
                      </span>
                    )}
                  </div>

                  {/* Expiry and CVV Inputs Row */}
                  <div className="form-row-custom">
                    {/* Expiry Date */}
                    <div className="form-group-custom">
                      <label htmlFor="expiryInput">Son Kullanma Tarihi</label>
                      <div className="input-icon-wrapper-custom">
                        <i className="fa-solid fa-calendar"></i>
                        <input
                          id="expiryInput"
                          type="text"
                          placeholder="AA/YY"
                          value={expiryDate}
                          onChange={handleExpiryChange}
                          className={errors.expiryDate ? 'invalid-field' : ''}
                        />
                      </div>
                      {errors.expiryDate && (
                        <span className="field-error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          {errors.expiryDate}
                        </span>
                      )}
                    </div>

                    {/* CVV */}
                    <div className="form-group-custom">
                      <label htmlFor="cvvInput">CVC / CVV</label>
                      <div className="input-icon-wrapper-custom">
                        <i className="fa-solid fa-lock"></i>
                        <input
                          id="cvvInput"
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={handleCvvChange}
                          className={errors.cvv ? 'invalid-field' : ''}
                        />
                      </div>
                      {errors.cvv && (
                        <span className="field-error-msg">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          {errors.cvv}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    className="checkout-submit-btn" 
                    type="submit"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    Ödemeyi Tamamla ve Premium Ol
                  </button>

                  {/* Secured Badge */}
                  <div className="secured-badge-row">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>256-bit SSL Güvenli Ödeme Altyapısı</span>
                  </div>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default PremiumPlan;

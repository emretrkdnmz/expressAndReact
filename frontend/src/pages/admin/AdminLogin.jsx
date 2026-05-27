import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Admin check
      if (!response.data.isAdmin) {
        setError('Yetkisiz Erişim! Bu panele yalnızca sistem yöneticileri giriş yapabilir.');
        setIsLoading(false);
        return;
      }

      // Save admin credentials
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));

      setUser(response.data);
      setIsLoading(false);
      navigate('/admin'); // Redirect to Admin Dashboard!
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setError(err.response?.data?.message || 'Giriş işlemi başarısız. Bilgilerinizi kontrol edin!');
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-login-card">
        <div className="admin-logo-wrapper">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <h2>Yönetici Paneli</h2>
        <p>Sistem ve kullanıcı verilerini yönetmek için yönetici hesabınızla oturum açın.</p>

        {error && (
          <div className="admin-error-alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="admin-form-group">
            <label htmlFor="adminEmailInput">E-Posta Adresi</label>
            <div className="admin-input-wrapper">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="adminEmailInput"
                type="email"
                placeholder="admin@spotify.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="admin-form-group">
            <label htmlFor="adminPasswordInput">Şifre</label>
            <div className="admin-input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                id="adminPasswordInput"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="admin-submit-btn" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Doğrulanıyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                Yönetici Olarak Giriş Yap
              </>
            )}
          </button>
        </form>

        <div className="admin-back-link" onClick={() => navigate('/songs')}>
          <i className="fa-solid fa-arrow-left"></i>
          Normal Uygulamaya Dön
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

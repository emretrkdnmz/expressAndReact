import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  // Giriş mi kayıt mı ekranındayız? (true = Login, false = Register)
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form inputları için state'ler
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Form Gönderildiğinde Çalışacak Fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // İstek atacağımız url'i duruma göre belirliyoruz
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginView ? { email, password } : { username, email, password };

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      // Başarılıysa gelen kullanıcı bilgilerini ve token'ı localStorage'a kilitliyoruz
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));

      // Üst bileşene (App.jsx) girişin başarılı olduğunu haber veriyoruz
      onLoginSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Bir şeyler ters gitti!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🎵 Spotify Clone</div>
        <h2>{isLoginView ? 'Oturum aç' : 'Kayıt Ol'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="input-group">
              <label>Kullanıcı Adı</label>
              <input 
                type="text" 
                placeholder="Kullanıcı adı girin" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="input-group">
            <label>E-posta adresi</label>
            <input 
              type="email" 
              placeholder="E-posta adresi" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Şifre</label>
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isLoginView ? 'Oturum Aç' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isLoginView ? 'Hesabın yok mu?' : 'Zaten bir hesabın var mı?'}
          <span onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
            {isLoginView ? ' Kayıt ol.' : ' Oturum aç.'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
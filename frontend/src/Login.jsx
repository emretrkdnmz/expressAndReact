import { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './components/LoadingSpinner';
import AnimatedBackground from './components/AnimatedBackground';
import './Login.css';

function Login({ onLoginSuccess }) {
  // Giriş mi kayıt mı ekranındayız? (true = Login, false = Register)
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form inputları için state'ler
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Müzik notası animasyonu için yardımcı render fonksiyonu
  const renderFloatingNotes = () => {
    const notes = [
      'fa-solid fa-music',
      'fa-solid fa-music',
      '♪',
      '♫',
      '♬',
      '♩',
      'fa-solid fa-music',
      '♫',
      '♬',
      '♩'
    ];
    
    return (
      <div className="floating-music-notes">
        {notes.map((note, index) => {
          const isIcon = note.startsWith('fa-');
          const style = {
            left: `${10 + (index * 9.5)}%`,
            animationDelay: `${index * 0.65}s`,
            animationDuration: `${7 + (index % 3) * 1.5}s`,
            fontSize: `${14 + (index % 4) * 6}px`
          };
          return (
            <span key={index} className="floating-note" style={style}>
              {isIcon ? <i className={note}></i> : note}
            </span>
          );
        })}
      </div>
    );
  };

  // Form Gönderildiğinde Çalışacak Fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginView ? { email, password } : { username, email, password };

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      // Başarılıysa gelen kullanıcı bilgilerini ve token'ı localStorage'a kaydediyoruz
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));

      setIsLoading(false);
      onLoginSuccess(response.data);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Giriş işlemi başarısız. Bilgilerinizi kontrol edin!');
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${isLoginView ? 'view-login' : 'view-register'}`}>
        
        {/* LEFT PANEL: LOGIN FORM (Desktop) / REGISTRATION PANEL (Mobile) */}
        <div className="auth-panel left-panel">
          
          {/* 1. LOGIN FORM (Always rendered on the left form side) */}
          <form onSubmit={handleSubmit} className="auth-form login-form">
            <h2>Login</h2>
            
            {error && <div className="auth-error-toast">{error}</div>}

            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder="Username or Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-user"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-lock"></i></span>
            </div>

            <div className="auth-forgot-pwd">
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!"); }}>Forgot password?</a>
            </div>

            <button type="submit" className="auth-btn-primary">
              Login
            </button>

            <div className="auth-social-divider">
              <span>or login with social platforms</span>
            </div>

            <div className="auth-social-buttons">
              <button type="button" className="auth-social-btn" onClick={() => alert("Google ile Giriş Simüle Edildi")}><i className="fa-brands fa-google"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("Facebook ile Giriş Simüle Edildi")}><i className="fa-brands fa-facebook-f"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("GitHub ile Giriş Simüle Edildi")}><i className="fa-brands fa-github"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("LinkedIn ile Giriş Simüle Edildi")}><i className="fa-brands fa-linkedin-in"></i></button>
            </div>
          </form>

          {/* 2. REGISTRATION MOBILE CURVED TOP HEADER (Only visible on mobile in Registration View) */}
          <div className="mobile-overlay-header register-welcome">
            <AnimatedBackground />
            {renderFloatingNotes()}
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => { setIsLoginView(true); setError(''); }}>
              Login
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: REGISTRATION FORM (Desktop) / LOGIN PANEL (Mobile) */}
        <div className="auth-panel right-panel">
          
          {/* 1. REGISTRATION FORM (Always rendered on the right form side) */}
          <form onSubmit={handleSubmit} className="auth-form register-form">
            <h2>Registration</h2>
            
            {error && <div className="auth-error-toast">{error}</div>}

            <div className="auth-input-group">
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-user"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-envelope"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-lock"></i></span>
            </div>

            <button type="submit" className="auth-btn-primary">
              Register
            </button>

            <div className="auth-social-divider">
              <span>or register with social platforms</span>
            </div>

            <div className="auth-social-buttons">
              <button type="button" className="auth-social-btn" onClick={() => alert("Google ile Kayıt Olma Simüle Edildi")}><i className="fa-brands fa-google"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("Facebook ile Kayıt Olma Simüle Edildi")}><i className="fa-brands fa-facebook-f"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("GitHub ile Kayıt Olma Simüle Edildi")}><i className="fa-brands fa-github"></i></button>
              <button type="button" className="auth-social-btn" onClick={() => alert("LinkedIn ile Kayıt Olma Simüle Edildi")}><i className="fa-brands fa-linkedin-in"></i></button>
            </div>
          </form>

          {/* 2. LOGIN MOBILE CURVED TOP HEADER (Only visible on mobile in Login View) */}
          <div className="mobile-overlay-header login-welcome">
            <AnimatedBackground />
            {renderFloatingNotes()}
            <h2>Hello, Welcome!</h2>
            <p>Don't have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => { setIsLoginView(false); setError(''); }}>
              Register
            </button>
          </div>
        </div>

        {/* DESKTOP EXCLUSIVE SLIDING COVER OVERLAY (Completely hidden on mobile via CSS) */}
        <div className="auth-desktop-overlay">
          <AnimatedBackground />
          {renderFloatingNotes()}
          
          {/* Welcome Panel shown when Login view is selected */}
          <div className="overlay-slide-panel login-welcome-slide">
            <h2>Hello, Welcome!</h2>
            <p>Don't have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => { setIsLoginView(false); setError(''); }}>
              Register
            </button>
          </div>
          
          {/* Welcome Panel shown when Registration view is selected */}
          <div className="overlay-slide-panel register-welcome-slide">
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => { setIsLoginView(true); setError(''); }}>
              Login
            </button>
          </div>
        </div>

      </div>
      {isLoading && <LoadingSpinner fullScreen={true} />}
    </div>
  );
}

export default Login;
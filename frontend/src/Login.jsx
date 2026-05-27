import { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './components/LoadingSpinner';
import AnimatedBackground from './components/AnimatedBackground';
import './Login.css';

function Login({ onLoginSuccess }) {
  // Giriş mi kayıt mı ekranındayız? (true = Login, false = Register)
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration form states
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Helper to switch views and reset errors
  const handleSwitchView = (toLogin) => {
    setIsLoginView(toLogin);
    setLoginError('');
    setRegisterError('');
  };

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

  // Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });
      
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));

      setIsLoading(false);
      onLoginSuccess(response.data);
    } catch (err) {
      setIsLoading(false);
      setLoginError(err.response?.data?.message || 'Giriş işlemi başarısız. Bilgilerinizi kontrol edin!');
    }
  };

  // Register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      });
      
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));

      setIsLoading(false);
      onLoginSuccess(response.data);
    } catch (err) {
      setIsLoading(false);
      setRegisterError(err.response?.data?.message || 'Kayıt işlemi başarısız. Bilgilerinizi kontrol edin!');
    }
  };

  return (
    <div className="auth-container">
      {/* Mobile Global Background for Particles/Notes */}
      <div className="mobile-global-background">
        <AnimatedBackground />
        {renderFloatingNotes()}

        {/* Siri/Apple-style Organic Fluid White Waves */}
        <div className="mobile-siri-wrapper">
          <div className="siri-wave-container">
            {/* Soft glowing white background backing blur */}
            <div className="siri-glow-bg"></div>
            
            {/* Morphing fluid wave outlines */}
            <div className="siri-wave wave-1"></div>
            <div className="siri-wave wave-2"></div>
            <div className="siri-wave wave-3"></div>
            <div className="siri-wave wave-4"></div>
          </div>
          <div className="mobile-siri-text">AURA SYSTEM ACTIVE</div>
        </div>
      </div>

      <div className={`auth-card ${isLoginView ? 'view-login' : 'view-register'}`}>
        
        {/* LEFT PANEL: LOGIN FORM (Desktop) / REGISTRATION PANEL (Mobile) */}
        <div className="auth-panel left-panel">
          
          {/* 1. LOGIN FORM (Always rendered on the left form side) */}
          <form onSubmit={handleLoginSubmit} className="auth-form login-form">
            <div className="bottom-sheet-handle"></div>
            <h2>Login</h2>
            
            {loginError && <div className="auth-error-toast">{loginError}</div>}

            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder="Username or Email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-user"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
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

            {/* Mobile-only inline switch link */}
            <div className="mobile-auth-switch">
              Don't have an account? <span onClick={() => handleSwitchView(false)}>Register</span>
            </div>
          </form>

          {/* 2. LOGIN MOBILE CURVED TOP HEADER (Only visible on mobile in Login View) */}
          <div className="mobile-overlay-header login-welcome">
            <AnimatedBackground />
            {renderFloatingNotes()}
            <h2>Hello, Welcome!</h2>
            <p>Don't have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => handleSwitchView(false)}>
              Register
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: REGISTRATION FORM (Desktop) / LOGIN PANEL (Mobile) */}
        <div className="auth-panel right-panel">
          
          {/* 1. REGISTRATION FORM (Always rendered on the right form side) */}
          <form onSubmit={handleRegisterSubmit} className="auth-form register-form">
            <div className="bottom-sheet-handle"></div>
            <h2>Registration</h2>
            
            {registerError && <div className="auth-error-toast">{registerError}</div>}

            <div className="auth-input-group">
              <input 
                type="text" 
                placeholder="Username" 
                value={registerUsername} 
                onChange={(e) => setRegisterUsername(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-user"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={registerEmail} 
                onChange={(e) => setRegisterEmail(e.target.value)} 
                required 
              />
              <span className="auth-input-icon-right"><i className="fa-solid fa-envelope"></i></span>
            </div>

            <div className="auth-input-group">
              <input 
                type="password" 
                placeholder="Password" 
                value={registerPassword} 
                onChange={(e) => setRegisterPassword(e.target.value)} 
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

            {/* Mobile-only inline switch link */}
            <div className="mobile-auth-switch">
              Already have an account? <span onClick={() => handleSwitchView(true)}>Login</span>
            </div>
          </form>

          {/* 2. REGISTRATION MOBILE CURVED TOP HEADER (Only visible on mobile in Registration View) */}
          <div className="mobile-overlay-header register-welcome">
            <AnimatedBackground />
            {renderFloatingNotes()}
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => handleSwitchView(true)}>
              Login
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
            <button type="button" className="auth-btn-outline" onClick={() => handleSwitchView(false)}>
              Register
            </button>
          </div>
          
          {/* Welcome Panel shown when Registration view is selected */}
          <div className="overlay-slide-panel register-welcome-slide">
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <button type="button" className="auth-btn-outline" onClick={() => handleSwitchView(true)}>
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
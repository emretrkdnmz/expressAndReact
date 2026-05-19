import { useState, useEffect, useRef } from 'react'; // React'ın durum yönetimi (state), yan etkiler (effect) ve element referans (ref) hook'larını içeri alıyoruz.
import axios from 'axios'; // Backend'e güvenli HTTP istekleri (GET, POST vb.) atabilmek için Axios kütüphanesini dahil ediyoruz.
import Login from './Login'; // Kullanıcı giriş yapmadıysa göstereceğimiz Login/Register ekranı bileşenini çağırıyoruz.
import './App.css'; // Spotify klonuna özel stil ve premium cam (Glassmorphism) tasarımlarını barındıran CSS dosyamız.
import './index.css'; // Tüm projenin genel, sıfırlama (reset) ve kök font stillerini taşıyan CSS dosyamız.

function App() { // Uygulamanın ana yönetim merkezi olan App fonksiyonel bileşenini başlatıyoruz.

  // --- STATE VE REFERANS (HOOK) TANIMLAMALARI ---

  // Tarayıcı hafızasını (localStorage) kontrol ederek daha önce giriş yapmış bir kullanıcı verisi varsa onu çekip 'user' durumuna atıyoruz, yoksa null başlıyor.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData'); // Tarayıcı hafızasından 'userData' anahtarlı metni oku.
    return savedUser ? JSON.parse(savedUser) : null; // Metin varsa JSON nesnesine çevirip yükle, yoksa null dön.
  });
  
  const [songs, setSongs] = useState([]); // Veritabanından (MongoDB) çekeceğimiz şarkı listesini dizilim olarak saklayacak durum yapısı.
  const [currentSong, setCurrentSong] = useState(null); // O an çalınan veya tıklanan aktif şarkının tüm verilerini (ad, artist, url vb.) tutan durum.
  
  // --- MÜZİK MOTORU İÇİN ÖZEL HOOK'LAR ---
  const audioRef = useRef(null); // JSX içindeki gizli HTML5 <audio> etiketine JavaScript üzerinden doğrudan müdahale edebilmek (play/pause) için kurulan köprü.
  const [isPlaying, setIsPlaying] = useState(false); // Şarkının o an çalıp çalmadığını (True/False) takip eden ve play/pause ikonunu değiştiren durum.
  const [currentTime, setCurrentTime] = useState(0); // Çalan şarkının anlık olarak kaçıncı saniyede olduğunu saklayan durum (Sürgüyü yürütür).
  const [volume, setVolume] = useState(0.7); // Ses seviyesini 0 ile 1 arasında tutan durum (Varsayılan olarak %70 ses gücüyle başlar).
  const [duration, setDuration] = useState(0); // Çalan aktif şarkının toplamda kaç saniye sürdüğünü (dosya uzunluğunu) saklayan durum.
  
  // Bankacılık uygulamalarındaki gibi hareketsiz kalındığında çalışacak olan zamanlayıcıyı (timer) hafızada kaybetmeden tutmak için kullanılan referans.
  const timeoutRef = useRef(null);


  // --- YARDIMCI VE İŞLEVSEL FONKSİYONLAR ---

  // 1. BACKEND'DEN ŞARKILARI GÜVENLİ ÇEKME FONKSİYONU
  const fetchSongs = async () => { // Async yapısı sayesinde veritabanından cevap gelene kadar tarayıcıyı kilitlemeden arkada istek atar.
    try {
      const token = localStorage.getItem('userToken'); // Tarayıcı hafızasındaki dijital ehliyeti (JWT Token) al.
      if (!token) return; // Eğer ehliyet yoksa boş dön, backend'i boşuna yorma.

      // Axios ile backend'deki şarkı kapısını çalıyoruz ve kafasına (Headers) koruma muhafızının açacağı JWT Token ehliyetini koyuyoruz.
      const response = await axios.get('http://localhost:5000/api/songs', {
        headers: {
          Authorization: `Bearer ${token}` // Backend protect middleware'inin beklediği 'Bearer token_kodu' kalıbı.
        }
      });
      
      setSongs(response.data); // Backend'den başarıyla dönen şarkı dizisini (Array) 'songs' durumumuza aktararak ekrana basılmaya hazır hale getiriyoruz.
    } catch (error) {
      console.error("Şarkılar yüklenirken bir hata oluştu:", error); // Olası bir bağlantı veya yetki hatasını konsola kırmızı yazı olarak bas.
    }
  };

  // 2. MANUEL ÇIKIŞ YAPMA FONKSİYONU (Oturumu Kapat Butonu İçin)
  const handleLogout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // Eğer arkada dönen bir otomatik çıkış sayacı varsa onu iptal et/temizle.
    localStorage.clear(); // Tarayıcı hafızasında saklanan Token ve Kullanıcı verilerini tamamen kazı/temizle.
    setUser(null); // Kullanıcı durumunu boşalt (Bu işlem tetiklendiği an React otomatik olarak Login ekranını açar).
    setSongs([]); // Hafızadaki şarkıları temizle.
    setCurrentSong(null); // O an çalan şarkı varsa player'ı kapatıp temizle.
  };

  // 3. BELİRLİ SÜRE HAREKETSİZ KALINCA OTOMATİK ÇIKIŞ MANTIĞI
  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // Her hareket algılandığında halihazırda geri sayan eski sayacı sıfırla.

    // Yeni bir zamanlayıcı kur: 2 dakika (120.000 milisaniye) boyunca hiçbir hareket olmazsa içerideki kod bloğu tetiklenecek.
    timeoutRef.current = setTimeout(() => {
      alert("Hareketsiz kaldığınız için oturumunuz güvenli bir şekilde kapatıldı."); // Kullanıcıya bilgilendirme uyarısı fırlat.
      handleLogout(); // Güvenli çıkış fonksiyonunu çalıştırarak kullanıcıyı kapının dışına at.
    }, 120000); // 120000 milisaniye = 2 dakika.
  };

  // --- REACT ETKİLEŞİM VE GÜVENLİK DUVARLARI ---

  // Sayfa ilk açıldığında veya 'user' durumu her değiştiğinde tetiklenen, tarayıcı event'lerini dinleyen ana kontrol hook'u.
  useEffect(() => {
    if (user) { // Eğer kullanıcı giriş yapmışsa (user nesnesi doluysa):
      fetchSongs(); // Güvenli şarkı çekme fonksiyonunu tetikle.

      // Kullanıcının ekrandaki tüm canlı etkileşimlerini yakalayacağımız tetikleyici olaylar listesi.
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      resetInactivityTimer(); // İlk girişte temiz bir geri sayım sayacı başlat.

      // Kullanıcı fareyi oynattığında, tıkladığında veya klavyeye bastığında 'resetInactivityTimer' fonksiyonunu çağırarak süreyi tazele.
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));
      
      // Temizlik (Cleanup) Aşaması: Bileşen kapandığında veya çıkış yapıldığında tarayıcının arkasında çöp dinleyici kalmasın diye hafızayı boşaltır.
      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer)); // Dinleyicileri tarayıcıdan sök.
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Sayacı imha et.
      };
    }
  }, [user]); // Bu efekt sadece 'user' state'i değiştiğinde (Giriş/Çıkış anlarında) baştan aşağı bir kez çalışır.


  // 🚨 KORUMA BARIYERİ: Eğer 'user' boşsa (null), alttaki hiçbir Spotify kodunu okuma; doğrudan ekranı kesip Login bileşenini fırlat.
  if (!user) {
    // Login başarılı olunca içindeki veriyi alıp 'setUser' fonksiyonumuza paslayan bir Props köprüsü kuruyoruz.
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }


  // --- CANLI MÜZİK OYNATICI KONTROL FONKSİYONLARI ---

  // A) Oynat / Duraklat Fonksiyonu (Player Barındaki Yuvarlak Buton İçin)
  const togglePlay = () => {
    if (!audioRef.current) return; // Eğer ses motoru (audio etiketi) henüz yüklenmediyse işlemi durdur.
    if (isPlaying) { // Şarkı o an çalıyorsa:
      audioRef.current.pause(); // Ses motorunu duraklat.
      setIsPlaying(false); // Durum ikonunu 'Oynat (Play)' moduna çek.
    } else { // Şarkı durdurulmuşsa:
      audioRef.current.play(); // Ses motorunu kaldığı yerden yürüt.
      setIsPlaying(true); // Durum ikonunu 'Duraklat (Pause)' moduna çek.
    }
  };

  // B) Saniye Formatlayıcı (Örn: Gelen ham 75 saniyeyi ekranda göreceğimiz "1:15" şıklığına çevirir)
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"; // Eğer süre henüz hesaplanamadıysa (Not a Number) ekrana "0:00" bas.
    const minutes = Math.floor(time / 60); // Toplam saniyeyi 60'a bölüp tam kısmını dakika olarak al.
    const seconds = Math.floor(time % 60); // 60'tan kalan saniyeyi hesapla.
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Saniye tek haneliyse başına '0' koyarak yan yana birleştir (Örn: 3:05).
  };

  // C) Kullanıcı Zaman Çizgisini (İlerleme Çubuğunu) Faresiyle Kaydırdığında Tetiklenen Fonksiyon
  const handleProgressChange = (e) => {
    if (!audioRef.current) return; // Ses motoru hazır değilse işlem yapma.
    const newTime = e.target.value; // Kullanıcının çubuğu sürüklediği noktadaki yeni saniye değerini yakala.
    audioRef.current.currentTime = newTime; // Ses motorunu doğrudan o saniyeye zıplat/sar.
    setCurrentTime(newTime); // Çubuğun ekrandaki konumunu (state) yeni saniyeye eşitle.
  };

  // --- ARAYÜZÜN HTML/JSX RENDER ALANI ---
  return (
    <div className="spotify-layout"> {/* Tüm Spotify ekranını sarmalayan ana dış iskelet kutusu */}
      <div className="main-view"> {/* Sol Menü ve Orta İçerik Alanını yan yana tutan gövde grubu */}
        
        {/* SOL MENÜ (SIDEBAR) */}
        <aside className="sidebar">
          <div className="logo">🎵 Spotify Clone</div> {/* Klon uygulamanın ana başlık logosu */}
          {/* Giriş yapan kullanıcının adını MongoDB'den gelen veriyle dinamik basan selamlama alanı */}
          <div className="user-welcome">Merhaba, <span>{user.username}</span></div> 
          <nav>
            <ul>
              {/* O an bulunulan aktif sayfayı belirtmek için 'active' sınıfına sahip Ana Sayfa satırı */}
              <li className="active"><i className="fa-solid fa-house"></i> Ana Sayfa</li>
              <li><i className="fa-solid fa-magnifying-glass"></i> Ara</li> {/* İleride arama yapacağımız buton */}
              <li><i className="fa-solid fa-book"></i> Kitaplığın</li> {/* İleride çalma listelerini koyacağımız buton */}
            </ul>
          </nav>
          
          {/* Tıklandığında tüm oturumu sıfırlayan Font Awesome ikonlu şık kapatma butonu */}
          <button className="logout-sidebar-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Oturumu Kapat
          </button>
        </aside>

        {/* ORTA ALAN (MÜZİK KÜTÜPHANESİ) */}
        <main className="content">
          <h2>Tünaydın</h2> {/* Karşılama başlığı */}
          
          <div className="song-grid"> {/* Şarkı kartlarını yan yana ve duyarlı (responsive) dizen grid kutusu */}
            {songs.map((song) => ( // Backend'den gelen tüm şarkıları döngüye (map) alıp her biri için bir kart üretiyoruz:
              // Karta tıklandığında 'currentSong' durumuna o şarkının tüm nesne verisini kilitliyoruz.
              <div key={song._id} className="song-card" onClick={() => setCurrentSong(song)}>
                <div className="card-image-wrapper"> {/* Resim ve üzerindeki hover efektlerini tutan sarmalayıcı */}
                  <img src={song.coverUrl} alt={song.title} className="card-image" /> {/* Şarkının albüm kapağı resmi */}
                  
                  {/* CSS ile tasarladığımız, fareyle üzerine gelince (Hover) tam ortada beliren o yeşil yuvarlak Spotify Play butonu */}
                  <div className="card-play-overlay">
                    <div className="play-bg-circle">
                      <i className="fa-solid fa-play"></i> {/* Beyaz yuvarlağın içindeki siyah üçgen oynat ikonu */}
                    </div>
                  </div>
                </div>
                <div className="card-info"> {/* Şarkı metin detaylarının alanı */}
                  <h4>{song.title}</h4> {/* Şarkının ismi (Örn: Lost in the City Lights) */}
                  <p>{song.artist}</p> {/* Şarkıyı söyleyen sanatçı adı */}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ALT MÜZİK ÇALMA ÇUBUĞU (MUSIC PLAYER BAR) */}
      <footer className="music-player-bar">
        {/* TERNARY OPERATOR: Eğer seçili bir şarkı varsa (currentSong doluysa) çalara ait tüm kontrolleri aç, yoksa 'şarkı seçilmedi' yaz */}
        {currentSong ? (
          <div className="player-container"> {/* Alt barın içindeki 3'lü hizalamayı (Sol-Orta-Sağ) kuran ana konteyner */}
            
            {/* 1. Bölüm (Sol Taraf): O an çalan şarkının resmi ve künyesi */}
            <div className="player-song-info">
              <img src={currentSong.coverUrl} alt={currentSong.title} className="player-cover" /> {/* Küçük albüm kapağı */}
              <div className="song-details">
                <h5>{currentSong.title}</h5> {/* Çalan şarkının adı */}
                <p>{currentSong.artist}</p> {/* Çalan şarkının sanatçısı */}
              </div>
            </div>

            {/* 2. Bölüm (Orta Taraf): Canlı Navigasyon ve Oynatma Butonları ile Zaman Sürgüsü */}
            <div className="player-center-controls">
              <div className="control-buttons">
                {/* Geri sarma butonu (Şu an tasarım amaçlı duruyor) */}
                <button className="nav-btn"><i className="fa-solid fa-backward-step"></i></button>
                
                {/* Tıklandığında togglePlay fonksiyonunu tetikleyen ve çalıp çalmama durumuna göre dinamik olarak ikon değiştiren oynat/durdur butonu */}
                <button className="play-circle-btn" onClick={togglePlay}>
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i> {/* Çalıyorsa pause ikonu, duruyorsa play ikonu basılır */}
                </button>
                
                {/* İleri sarma butonu (Şu an tasarım amaçlı duruyor) */}
                <button className="nav-btn"><i className="fa-solid fa-forward-step"></i></button>
              </div>
              
              {/* Zaman Çizgisinin Akış Alanı */}
              <div className="progress-container">
                {/* Şarkının o an çaldığı anlık saniyeyi (Formatlanmış: 0:45 gibi) sol tarafa basar */}
                <span className="time-stamp">{formatTime(currentTime)}</span>
                
                <input 
                  type="range" // Sürgülü çizgi tipi
                  min="0" // Çizginin başlangıç noktası (0. saniye)
                  max={duration || 100} // Çizginin biteceği maksimum nokta (Şarkının toplam süresi, şarkı gelmediyse hata vermesin diye varsayılan 100)
                  value={currentTime} // Çubuğun ekrandaki anlık canlı konumu
                  onChange={handleProgressChange} // Kullanıcı çubuğu elleyip kaydırdığında tetiklenecek fonksiyon
                  className="custom-progress-bar" 
                  
                  /* Geçen saniyenin toplam süreye oranını yüzde (%) olarak hesaplayıp, çubuğun sol tarafını parlayan Spotify yeşiline boyayan inline CSS sihrimiz */
                  style={{
                    background: `linear-gradient(to right, #1db954 ${
                      duration ? (currentTime / duration) * 100 : 0
                    }%, #4f4f4f ${duration ? (currentTime / duration) * 100 : 0}%)`
                  }}
                />
                
                {/* Şarkının gerçek dosya uzunluğunu (Toplam süresini, Örn: 3:12) sağ tarafa basan alan */}
                <span className="time-stamp">{formatTime(duration)}</span>
              </div>
            </div>

            {/* 3. Bölüm (Sağ Taraf): Canlı Ses Ayar Sürgüsü */}
            <div className="player-right-controls">
              <span className="volume-icon"><i className="fa-solid fa-volume-high"></i></span> {/* Vektörel ses hoparlör ikonu */}

              <input 
                type="range" 
                min="0" // Sıfır ses (Mute)
                max="1" // Tam ses gücü (%100)
                step="0.01" // Çubuğun hassasiyeti (Yumuşak kısıp açabilmek için yüzer basamak ayarı)
                value={volume} // Ses çubuğunun state'teki anlık konumu
                onChange={(e) => { // Çubuk her kaydırıldığında:
                  const newVolume = parseFloat(e.target.value); // Yeni ses ondalık değerini al (Örn: 0.55).
                  setVolume(newVolume); // 'volume' state'imizi güncelle (Çubuğu renklendirir).
                  if (audioRef.current) audioRef.current.volume = newVolume; // Gizli HTML ses motorunun sesini gerçek zamanlı değiştir.
                }}
                className="volume-slider" 

                /* Tıpkı müzik barı gibi, sesin düzey yüzdesine göre ses çubuğunun sol tarafını yeşile boyayan inline CSS hilesi */
                style={{
                  background: `linear-gradient(to right, #1db954 ${volume * 100}%, #4f4f4f ${volume * 100}%)`
                }}
              />
            </div>
            
            {/* GİZLİ SES MOTORU (Kullanıcının görmediği, müziği internetten indirip hoparlöre basan asıl HTML5 Audio etiketi) */}
            <audio 
              ref={audioRef} // Yukarıda tanımladığımız referans köprüsünü bu etikete bağlıyoruz.
              src={currentSong.audioUrl} // Çalınacak şarkının internet üzerindeki gerçek MP3 adresi (MongoDB'den gelir).
              autoPlay // Karta tıklandığı an şarkıyı yükleyip otomatik olarak çalmaya başla.
              volume={volume} // Motorun ses seviyesini bizim yukarıdaki ses state'imize eşitliyoruz.
              onPlay={() => setIsPlaying(true)} // Şarkı tarayıcı tarafından çalınmaya başladığı an state'i True yap (İkon pause'a döner).
              onPause={() => setIsPlaying(false)} // Şarkı duraklatıldığı an state'i False yap (İkon play'e döner).
              onLoadedMetadata={(e) => setDuration(e.target.duration)} // Şarkı dosyası tarayıcıya indiği an toplam saniyesini okur ve 'duration' state'ine yazar.
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)} // Şarkı hoparlörden çaldığı her salise tetiklenerek anlık saniyeyi 'currentTime' state'ine üfler (Çubuğu yürütür).
              onEnded={() => { setIsPlaying(false); setCurrentTime(0); }} // Şarkı tamamen bitip sona ulaştığında çalmayı durdur ve zamanı sıfıra çek.
              style={{ display: 'none' }} // Bu etiketi ekranda gizliyoruz çünkü kontrol butonlarını yukarıda kendimiz premium olarak tasarladık.
            />
          </div>
        ) : (
          // Eğer henüz hiçbir şarkı kartına tıklanmadıysa alt barda belirecek olan boş durum (fallback) yazısı.
          <p className="no-song">Henüz bir şarkı seçilmedi. Başlatmak için bir karta tıkla!</p>
        )}
      </footer>
    </div>
  );
}

export default App; // Yazdığımız bu devasa ana bileşeni tarayıcının render edebilmesi için dış dünyaya açıyoruz (export).
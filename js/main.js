/**
 * ARCTIC ROSE - WEDDING INVITATION INTERACTIVE SCRIPTS
 * Complete feature set: Guest Query, Audio Player, Countdown, RSVP LocalStorage, Lightbox, Copy Toast, Falling Petals
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 0. RANDOM WEDDING IMAGES (COVER, HERO & GALLERY)
  // Mengacak foto bertema pernikahan dari assets/images/wedding/
  // setiap halaman dimuat. Dijalankan paling awal agar lightbox
  // galeri (section 7) membaca sumber gambar yang sudah diacak.
  // -------------------------------------------------------------
  function initRandomWeddingImages() {
    const pool = [
      'assets/images/wedding/wedding-1.jpg',
      'assets/images/wedding/wedding-2.jpg',
      'assets/images/wedding/wedding-3.jpg',
      'assets/images/wedding/wedding-4.jpg',
      'assets/images/wedding/wedding-5.jpg',
      'assets/images/wedding/wedding-6.jpg',
      'assets/images/wedding/wedding-7.jpg',
      'assets/images/wedding/wedding-8.jpg',
      'assets/images/wedding/wedding-9.jpg',
      'assets/images/wedding/wedding-10.jpg',
      'assets/images/wedding/wedding-11.jpg',
      'assets/images/wedding/wedding-12.jpg'
    ];

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const targets = [];
    const coverImg = document.querySelector('.cover-photo-wrapper img');
    const heroImg = document.querySelector('.hero-arch-frame img');
    if (coverImg) targets.push(coverImg);
    if (heroImg) targets.push(heroImg);
    document.querySelectorAll('.gallery-item img').forEach(img => targets.push(img));

    // Setiap target mendapat foto berbeda (tanpa duplikasi)
    targets.forEach((img, idx) => {
      img.src = pool[idx % pool.length];
    });
  }

  initRandomWeddingImages();

  // -------------------------------------------------------------
  // 1. GUEST NAME EXTRACTION FROM URL
  // Example: index.html?to=Budi+Santoso or ?guest=Keluarga+Bpk+Ahmad
  // -------------------------------------------------------------
  function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('untuk') || urlParams.get('to') || urlParams.get('guest') || urlParams.get('nama') || urlParams.get('kpd') || urlParams.get('kepada') || urlParams.get('u');
    const guestElement = document.getElementById('guestName');
    const rsvpNameInput = document.getElementById('rsvpName');

    if (guestParam) {
      // Decode and sanitize
      try {
        const sanitizedName = decodeURIComponent(guestParam.replace(/\+/g, ' ')).trim();
        if (sanitizedName) {
          if (guestElement) guestElement.textContent = sanitizedName;
          if (rsvpNameInput) rsvpNameInput.value = sanitizedName;
        }
      } catch (e) {
        const fallbackName = guestParam.replace(/\+/g, ' ').trim();
        if (fallbackName) {
          if (guestElement) guestElement.textContent = fallbackName;
          if (rsvpNameInput) rsvpNameInput.value = fallbackName;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. OPEN INVITATION & AUDIO CONTROLLER
  // -------------------------------------------------------------
  const coverOverlay = document.getElementById('coverOverlay');
  const btnOpenInvitation = document.getElementById('btnOpenInvitation');
  const bgMusic = document.getElementById('bgMusic');
  const btnMusicToggle = document.getElementById('btnMusicToggle');
  let isMusicPlaying = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      if (btnMusicToggle) {
        btnMusicToggle.classList.add('playing');
        btnMusicToggle.innerHTML = '<i class="fa-solid fa-compact-disc"></i>';
      }
    }).catch(err => {
      console.log('Audio autoplay prevented or error:', err);
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    if (btnMusicToggle) {
      btnMusicToggle.classList.remove('playing');
      btnMusicToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  }

  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', (e) => {
      e.preventDefault();
      if (coverOverlay) {
        coverOverlay.classList.add('opened');
      }
      // Unlock body scroll
      document.body.style.overflow = 'auto';
      // Start audio
      playMusic();
      // Trigger AOS animations refresh if available
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    });
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', () => {
      if (isMusicPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  // -------------------------------------------------------------
  // 3. COUNTDOWN TIMER
  // Target: 28 Oktober 2026 08:00:00 WIB
  // -------------------------------------------------------------
  function initCountdown() {
    const targetDate = new Date('2026-10-28T08:00:00+07:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function update() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = days < 10 ? '0' + days : days;
      hoursEl.textContent = hours < 10 ? '0' + hours : hours;
      minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
      secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    update();
    setInterval(update, 1000);
  }

  // -------------------------------------------------------------
  // 4. WEDDING GIFT TABS SWITCHER
  // -------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.gift-tab-btn');
  const tabContents = document.querySelectorAll('.gift-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const contentEl = document.getElementById(targetTab);
      if (contentEl) contentEl.classList.add('active');
    });
  });

  // -------------------------------------------------------------
  // 5. COPY TO CLIPBOARD & TOAST NOTIFICATION
  // -------------------------------------------------------------
  const toastNotice = document.getElementById('toastNotice');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotice) return;
    const toastMsgEl = toastNotice.querySelector('.toast-text');
    if (toastMsgEl) toastMsgEl.textContent = message;
    
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3000);
  }

  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('✓ Berhasil disalin ke clipboard!');
        }).catch(() => {
          // Fallback
          const tempInput = document.createElement('input');
          tempInput.value = textToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast('✓ Berhasil disalin ke clipboard!');
        });
      }
    });
  });

  // -------------------------------------------------------------
  // 6. RSVP & GUESTBOOK (BUKU TAMU) WITH LOCALSTORAGE
  // -------------------------------------------------------------
  const rsvpForm = document.getElementById('rsvpForm');
  const wishesList = document.getElementById('wishesList');
  const STORAGE_KEY = 'arctic_rose_wedding_wishes';

  const defaultWishes = [
    {
      name: 'Dimas Pratama & Keluarga',
      attendance: 'hadir',
      message: 'Selamat menempuh hidup baru untuk kedua mempelai! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.',
      timestamp: '2 jam yang lalu'
    },
    {
      name: 'Siti Nurhaliza',
      attendance: 'hadir',
      message: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khoir. Lancar sampai hari H yaa cantik!',
      timestamp: '5 jam yang lalu'
    },
    {
      name: 'Andi & Sarah',
      attendance: 'ragu',
      message: 'Happy wedding Alamsyah & Aulia! Semoga cinta kalian selalu bersemi abadi dan saling melengkapi selamanya.',
      timestamp: '1 hari yang lalu'
    }
  ];

  function getStoredWishes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWishes));
      return defaultWishes;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultWishes;
    }
  }

  function renderWishes() {
    if (!wishesList) return;
    const wishes = getStoredWishes();
    wishesList.innerHTML = '';

    wishes.forEach(item => {
      const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      
      let badgeClass = 'badge-hadir';
      let badgeText = 'Hadir';
      if (item.attendance === 'tidak-hadir') {
        badgeClass = 'badge-tidak-hadir';
        badgeText = 'Tidak Hadir';
      } else if (item.attendance === 'ragu') {
        badgeClass = 'badge-ragu';
        badgeText = 'Masih Ragu';
      }

      const wishEl = document.createElement('div');
      wishEl.className = 'wish-item';
      wishEl.innerHTML = `
        <div class="wish-header">
          <div class="wish-avatar">${initials || 'U'}</div>
          <div class="wish-meta">
            <div class="wish-author">${escapeHtml(item.name)}</div>
            <div class="wish-time">${escapeHtml(item.timestamp || 'Baru saja')}</div>
          </div>
          <span class="wish-attendance ${badgeClass}">${badgeText}</span>
        </div>
        <div class="wish-body">${escapeHtml(item.message)}</div>
      `;
      wishesList.appendChild(wishEl);
    });
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const attendance = document.getElementById('rsvpAttendance').value;
      const message = document.getElementById('rsvpMessage').value.trim();

      if (!name || !message) {
        showToast('⚠️ Mohon lengkapi nama dan doa/ucapan.');
        return;
      }

      const newWish = {
        name,
        attendance,
        message,
        timestamp: 'Baru saja'
      };

      const wishes = getStoredWishes();
      wishes.unshift(newWish);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));

      renderWishes();
      rsvpForm.reset();
      showToast('💌 Terima kasih atas ucapan & konfirmasinya!');
    });
  }

  // -------------------------------------------------------------
  // 7. GALLERY LIGHTBOX MODAL
  // -------------------------------------------------------------
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentGalleryIndex = 0;

  const galleryImages = [];
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      galleryImages.push(img.src);
      item.addEventListener('click', () => {
        currentGalleryIndex = index;
        openLightbox(index);
      });
    }
  });

  function openLightbox(index) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = galleryImages[index];
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
      lightboxImg.src = galleryImages[currentGalleryIndex];
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
      lightboxImg.src = galleryImages[currentGalleryIndex];
    });
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // -------------------------------------------------------------
  // 8. QR CODE MODAL
  // -------------------------------------------------------------
  const btnOpenQr = document.getElementById('btnOpenQr');
  const qrModal = document.getElementById('qrModal');
  const btnCloseQr = document.getElementById('btnCloseQr');

  if (btnOpenQr && qrModal) {
    btnOpenQr.addEventListener('click', () => {
      qrModal.classList.add('active');
    });
  }
  if (btnCloseQr && qrModal) {
    btnCloseQr.addEventListener('click', () => {
      qrModal.classList.remove('active');
    });
  }
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) qrModal.classList.remove('active');
    });
  }

  // -------------------------------------------------------------
  // 8B. ADMIN BACKEND (LOGIN & KELOLA BUKU TAMU)
  // Akses via URL: /admin, #admin, atau ?admin=true
  // Username: admin | Password: superadmin
  // -------------------------------------------------------------
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'superadmin';
  const ADMIN_SESSION_KEY = 'arctic_rose_admin_session';

  const adminLoginModal = document.getElementById('adminLoginModal');
  const adminPanelModal = document.getElementById('adminPanelModal');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLoginError = document.getElementById('adminLoginError');
  const adminWishesList = document.getElementById('adminWishesList');
  const adminWishCount = document.getElementById('adminWishCount');
  const btnCloseAdminLogin = document.getElementById('btnCloseAdminLogin');
  const btnCloseAdminPanel = document.getElementById('btnCloseAdminPanel');
  const btnDeleteAllWishes = document.getElementById('btnDeleteAllWishes');
  const btnAdminLogout = document.getElementById('btnAdminLogout');

  function isAdminAccess() {
    const cleanPath = window.location.pathname.replace(/\/+$/, '');
    const cleanHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    return (
      cleanPath.endsWith('/admin') ||
      cleanHash === 'admin' ||
      new URLSearchParams(window.location.search).has('admin')
    );
  }

  function isAdminLoggedIn() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
  }

  function openAdminArea() {
    if (isAdminLoggedIn()) {
      renderAdminWishes();
      if (adminPanelModal) adminPanelModal.classList.add('active');
    } else {
      if (adminLoginModal) adminLoginModal.classList.add('active');
      const usernameInput = document.getElementById('adminUsername');
      if (usernameInput) setTimeout(() => usernameInput.focus(), 300);
    }
  }

  function renderAdminWishes() {
    if (!adminWishesList) return;
    const wishes = getStoredWishes();

    if (adminWishCount) {
      adminWishCount.textContent = `Total ${wishes.length} ucapan`;
    }

    adminWishesList.innerHTML = '';

    if (wishes.length === 0) {
      adminWishesList.innerHTML = `
        <div class="admin-empty-state">
          <i class="fa-solid fa-inbox" style="font-size: 1.6rem; display: block; margin-bottom: 8px;"></i>
          Buku tamu kosong. Belum ada ucapan.
        </div>
      `;
      return;
    }

    wishes.forEach((item, index) => {
      const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      let badgeClass = 'badge-hadir';
      let badgeText = 'Hadir';
      if (item.attendance === 'tidak-hadir') {
        badgeClass = 'badge-tidak-hadir';
        badgeText = 'Tidak Hadir';
      } else if (item.attendance === 'ragu') {
        badgeClass = 'badge-ragu';
        badgeText = 'Masih Ragu';
      }

      const wishEl = document.createElement('div');
      wishEl.className = 'wish-item';
      wishEl.innerHTML = `
        <div class="wish-header">
          <div class="wish-avatar">${initials || 'U'}</div>
          <div class="wish-meta">
            <div class="wish-author">${escapeHtml(item.name)}</div>
            <div class="wish-time">${escapeHtml(item.timestamp || 'Baru saja')}</div>
          </div>
          <span class="wish-attendance ${badgeClass}">${badgeText}</span>
        </div>
        <div class="wish-body">${escapeHtml(item.message)}</div>
        <button class="btn-delete-wish" data-index="${index}" title="Hapus ucapan ini">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      adminWishesList.appendChild(wishEl);
    });

    // Bind per-item delete buttons
    adminWishesList.querySelectorAll('.btn-delete-wish').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const wishes = getStoredWishes();
        const target = wishes[idx];
        if (target && confirm(`Hapus ucapan dari "${target.name}"?`)) {
          wishes.splice(idx, 1);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
          renderAdminWishes();
          renderWishes();
          showToast('🗑️ Ucapan berhasil dihapus.');
        }
      });
    });
  }

  // --- Login form submit ---
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        if (adminLoginError) adminLoginError.classList.remove('show');
        adminLoginForm.reset();
        if (adminLoginModal) adminLoginModal.classList.remove('active');
        renderAdminWishes();
        if (adminPanelModal) adminPanelModal.classList.add('active');
        showToast('✅ Selamat datang, Admin!');
      } else {
        if (adminLoginError) adminLoginError.classList.add('show');
      }
    });
  }

  // --- Delete all wishes ---
  if (btnDeleteAllWishes) {
    btnDeleteAllWishes.addEventListener('click', () => {
      const wishes = getStoredWishes();
      if (wishes.length === 0) {
        showToast('ℹ️ Buku tamu sudah kosong.');
        return;
      }
      if (confirm(`Hapus SEMUA ${wishes.length} ucapan di buku tamu? Tindakan ini tidak dapat dibatalkan.`)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        renderAdminWishes();
        renderWishes();
        showToast('🗑️ Semua ucapan berhasil dihapus.');
      }
    });
  }

  // --- Logout ---
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      if (adminPanelModal) adminPanelModal.classList.remove('active');
      showToast('👋 Anda telah keluar dari panel admin.');
    });
  }

  // --- Close modals (button & overlay click) ---
  if (btnCloseAdminLogin && adminLoginModal) {
    btnCloseAdminLogin.addEventListener('click', () => {
      adminLoginModal.classList.remove('active');
      if (adminLoginError) adminLoginError.classList.remove('show');
    });
  }
  if (btnCloseAdminPanel && adminPanelModal) {
    btnCloseAdminPanel.addEventListener('click', () => {
      adminPanelModal.classList.remove('active');
    });
  }
  if (adminLoginModal) {
    adminLoginModal.addEventListener('click', (e) => {
      if (e.target === adminLoginModal) adminLoginModal.classList.remove('active');
    });
  }
  if (adminPanelModal) {
    adminPanelModal.addEventListener('click', (e) => {
      if (e.target === adminPanelModal) adminPanelModal.classList.remove('active');
    });
  }

  // --- Auto-open admin area when URL matches ---
  if (isAdminAccess()) {
    openAdminArea();
  }

  // -------------------------------------------------------------
  // 9. ACTIVE BOTTOM NAVIGATION HIGHLIGHT ON SCROLL
  // -------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.bottom-nav a');

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset + 200;
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll);

  // -------------------------------------------------------------
  // 10. FALLING ROSE PETALS CANVAS ANIMATION
  // -------------------------------------------------------------
  function initPetalsCanvas() {
    const canvas = document.getElementById('petalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petalCount = 24;
    const petals = [];
    const colors = ['#f7d1d5', '#e8b4b8', '#df9aa0', '#fae1e4'];

    class Petal {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 50;
        this.size = 8 + Math.random() * 12;
        this.speedY = 1 + Math.random() * 1.5;
        this.speedX = -0.5 + Math.random() * 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = 0.5 + Math.random() * 0.4;
      }

      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.8 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        // Rose petal organic bezier curve
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size * 1.3);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        ctx.fill();

        ctx.restore();
      }
    }

    for (let i = 0; i < petalCount; i++) {
      const p = new Petal();
      p.y = Math.random() * height; // distribute initially
      petals.push(p);
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      petals.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  // -------------------------------------------------------------
  // INITIALIZE ALL COMPONENTS
  // -------------------------------------------------------------
  initGuestName();
  initCountdown();
  renderWishes();
  initPetalsCanvas();
});

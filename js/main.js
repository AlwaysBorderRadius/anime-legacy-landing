const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const ambientGlow = document.getElementById('ambient-glow');
const heroSection = document.querySelector('main > section:first-child');

const WORKER_URL = 'https://anime-legacy-api.animelegacyalpha.workers.dev';

async function fetchServerInfo() {
  try {
    const response = await fetch(`${WORKER_URL}/api/server-info`);
    if (!response.ok) throw new Error('Worker error');
    
    const data = await response.json();
    
    const memberBadge = document.getElementById('member-badge');
    const ctaMemberCount = document.getElementById('cta-member-count');
    if (memberBadge && data.memberCount) {
      memberBadge.textContent = `+${data.memberCount.toLocaleString()} miembros • 2° servidor de anime en España`;
    }
    if (ctaMemberCount && data.memberCount) {
      ctaMemberCount.textContent = data.memberCount.toLocaleString();
    }
    
    const navName = document.getElementById('nav-name');
    if (navName && data.name) {
      navName.textContent = data.name;
    }
    
    const navIcon = document.getElementById('nav-icon');
    if (data.iconUrl && navIcon) {
      navIcon.src = data.iconUrl;
    }
    
    const heroBackground = document.getElementById('hero-background');
    if (heroBackground && data.bannerUrl) {
      heroBackground.style.backgroundImage = `url('${data.bannerUrl}')`;
    }
    
  } catch (error) {
    console.log('Using fallback data:', error.message);
  }
}

fetchServerInfo();

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    if (window.scrollY > heroBottom - 200) {
        ambientGlow.classList.add('visible');
    } else {
        ambientGlow.classList.remove('visible');
    }
});

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, index * 80);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

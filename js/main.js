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

async function fetchReviews() {
  try {
    const response = await fetch(`${WORKER_URL}/api/reviews`);
    if (!response.ok) throw new Error('Worker error');
    
    const reviews = await response.json();
    const container = document.getElementById('reviews-container');
    
    if (!container || reviews.length === 0) return;
    
    container.innerHTML = reviews.slice(0, 6).map(review => {
      const stars = Array(5).fill(0).map((_, i) => 
        `<svg class="w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
      ).join('');
      
      return `
        <div class="scroll-reveal bg-dark-800/50 border border-white/5 rounded-2xl p-6 hover:border-accent/20 transition-all duration-300">
          <div class="flex items-center gap-1 mb-3">
            ${stars}
          </div>
          ${review.title ? `<h3 class="text-lg font-semibold mb-2 text-white">${review.title}</h3>` : ''}
          <p class="text-gray-300 text-sm leading-relaxed mb-4">"${review.body}"</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">${review.author.charAt(0).toUpperCase()}</div>
              <div>
                <p class="text-sm font-medium text-white">${review.author}</p>
                <p class="text-xs text-gray-500">Disboard</p>
              </div>
            </div>
            ${review.date ? `<span class="text-xs text-gray-500">${review.date}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    document.querySelectorAll('#reviews-container .scroll-reveal').forEach(el => {
      observer.observe(el);
    });
    
  } catch (error) {
    console.log('Failed to fetch reviews:', error.message);
  }
}

fetchServerInfo();
fetchReviews();

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

// API Base URL
const API_BASE = ‘/.netlify/functions’;

// Cache for API data
let cachedData = {
portfolio: null,
services: null,
testimonials: null,
blog: null
};

// Fetch data from API
async function fetchData(endpoint) {
try {
const response = await fetch(`${API_BASE}/${endpoint}`);
if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
return await response.json();
} catch (error) {
console.error(`Error fetching ${endpoint}:`, error);
return null;
}
}

// Load Portfolio
async function loadPortfolio() {
if (!cachedData.portfolio) {
cachedData.portfolio = await fetchData(‘portfolio’);
}
return cachedData.portfolio || [];
}

// Load Services
async function loadServices() {
if (!cachedData.services) {
cachedData.services = await fetchData(‘services’);
}
return cachedData.services || [];
}

// Load Testimonials
async function loadTestimonials() {
if (!cachedData.testimonials) {
cachedData.testimonials = await fetchData(‘testimonials’);
}
return cachedData.testimonials || [];
}

// Load Blog Posts
async function loadBlog() {
if (!cachedData.blog) {
cachedData.blog = await fetchData(‘blog’);
}
return cachedData.blog || [];
}

// Render featured portfolio items
async function renderFeaturedPortfolio() {
const container = document.getElementById(‘featuredPortfolio’);
if (!container) return;

```
const items = await fetchData('portfolio?featured=true');

if (!items || items.length === 0) {
    // Fallback to placeholder images
    container.innerHTML = `
        <div class="portfolio-item">
            <img src="https://picsum.photos/id/1062/400/500" alt="Woman in a field portrait">
            <div class="portfolio-label">
                <h3>Portraits</h3>
                <p>Authentic moments captured beautifully</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/id/1082/400/500" alt="Engaged couple smiling">
            <div class="portfolio-label">
                <h3>Couples & Engagements</h3>
                <p>Love stories in their truest form</p>
            </div>
        </div>
        <div class="portfolio-item">
            <img src="https://picsum.photos/id/1015/400/500" alt="Family on a beach">
            <div class="portfolio-label">
                <h3>Family</h3>
                <p>Cherished memories that last forever</p>
            </div>
        </div>
    `;
    return;
}

container.innerHTML = items.map(item => `
    <div class="portfolio-item">
        <img src="${item.image_url}" alt="${item.title || item.category}">
        <div class="portfolio-label">
            <h3>${item.title || item.category}</h3>
            <p>${item.description || ''}</p>
        </div>
    </div>
`).join('');
```

}

// Render full portfolio by category
async function renderFullPortfolio() {
const container = document.getElementById(‘portfolioContent’);
if (!container) return;

```
const items = await loadPortfolio();

if (!items || items.length === 0) {
    container.innerHTML = '<p style="text-align: center;">No portfolio items available yet.</p>';
    return;
}

// Group by category
const categories = {};
items.forEach(item => {
    if (!categories[item.category]) {
        categories[item.category] = [];
    }
    categories[item.category].push(item);
});

container.innerHTML = Object.keys(categories).map(category => `
    <h3 style="font-size: 2rem; margin: 3rem 0 2rem; color: var(--gold);">${category}</h3>
    <div class="portfolio-grid">
        ${categories[category].map(item => `
            <div class="portfolio-item">
                <img src="${item.image_url}" alt="${item.title || category}">
            </div>
        `).join('')}
    </div>
`).join('');
```

}

// Render services
async function renderServices() {
const container = document.getElementById(‘servicesGrid’);
const selectElement = document.getElementById(‘session-type’);

```
if (!container && !selectElement) return;

const services = await loadServices();

if (!services || services.length === 0) {
    if (container) {
        container.innerHTML = '<p style="text-align: center;">No services available yet.</p>';
    }
    return;
}

// Render service cards
if (container) {
    container.innerHTML = services.map(service => {
        const features = Array.isArray(service.features) ? service.features : JSON.parse(service.features || '[]');
        const priceRange = service.price_min === service.price_max 
            ? `$${service.price_min}` 
            : `$${service.price_min}–$${service.price_max}`;
        
        return `
            <div class="service-card">
                <h3>${service.name}</h3>
                <p class="service-price">${priceRange}</p>
                <ul class="service-features">
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="#booking" class="cta-button" style="display: inline-block; margin-top: 1rem;">Book Now</a>
            </div>
        `;
    }).join('');
}

// Populate booking form dropdown
if (selectElement) {
    selectElement.innerHTML = '<option value="">Select a session type</option>' + 
        services.map(service => {
            const priceRange = service.price_min === service.price_max 
                ? `$${service.price_min}` 
                : `$${service.price_min}-$${service.price_max}`;
            return `<option value="${service.name}">${service.name} (${priceRange})</option>`;
        }).join('');
}
```

}

// Render testimonials
async function renderTestimonials() {
const testimonialsGrid = document.getElementById(‘testimonialsGrid’);
const homeTestimonial = document.getElementById(‘homeTestimonial’);

```
const testimonials = await loadTestimonials();

if (!testimonials || testimonials.length === 0) return;

// Render all testimonials on testimonials page
if (testimonialsGrid) {
    testimonialsGrid.innerHTML = testimonials.map(t => `
        <div class="testimonial-carousel">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
            <p class="testimonial-text">"${t.testimonial_text}"</p>
            <p class="testimonial-author">— ${t.author_name}</p>
        </div>
    `).join('');
}

// Setup carousel on home page
if (homeTestimonial) {
    setupTestimonialCarousel(testimonials, homeTestimonial);
}
```

}

// Testimonial carousel
function setupTestimonialCarousel(testimonials, container) {
let currentIndex = 0;
const textEl = container.querySelector(’.testimonial-text’);
const authorEl = container.querySelector(’.testimonial-author’);
const dotsContainer = container.querySelector(’.carousel-dots’);

```
if (!textEl || !authorEl || !dotsContainer) return;

// Create dots
dotsContainer.innerHTML = testimonials.map((_, i) => 
    `<span class="dot ${i === 0 ? 'active' : ''}"></span>`
).join('');

const dots = dotsContainer.querySelectorAll('.dot');

function updateTestimonial() {
    const t = testimonials[currentIndex];
    textEl.textContent = `"${t.testimonial_text}"`;
    authorEl.textContent = `— ${t.author_name}`;
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

// Initial render
updateTestimonial();

// Dot click handlers
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        currentIndex = i;
        updateTestimonial();
    });
});

// Auto-rotate
setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial();
}, 6000);
```

}

// Render blog posts
async function renderBlog() {
const container = document.getElementById(‘blogGrid’);
if (!container) return;

```
const posts = await loadBlog();

if (!posts || posts.length === 0) {
    container.innerHTML = '<p style="text-align: center;">No blog posts available yet.</p>';
    return;
}

container.innerHTML = posts.map(post => {
    const date = new Date(post.published_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    return `
        <div class="blog-card">
            <img class="blog-image" src="${post.image_url}" alt="${post.title}">
            <div class="blog-content">
                <p class="blog-date">${date}</p>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="#" class="read-more">Read More →</a>
            </div>
        </div>
    `;
}).join('');
```

}

// Page Router
function router() {
const hash = window.location.hash || ‘#home’;
const pageId = hash.substring(1);

```
document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
});

const targetPage = document.getElementById(pageId);
if (targetPage) {
    targetPage.classList.add('active');
} else {
    document.getElementById('home').classList.add('active');
}

window.scrollTo(0, 0);

// Load content for specific pages
if (pageId === 'portfolio') {
    renderFullPortfolio();
} else if (pageId === 'services' || pageId === 'booking') {
    renderServices();
} else if (pageId === 'testimonials') {
    renderTestimonials();
} else if (pageId === 'blog') {
    renderBlog();
}
```

}

// Initialize
document.addEventListener(‘DOMContentLoaded’, function () {
const mobileMenu = document.getElementById(‘mobileMenu’);
const navLinks = document.getElementById(‘navLinks’);
const navbar = document.getElementById(‘navbar’);
const scrollTopBtn = document.getElementById(‘scrollTop’);

```
// Setup router
window.addEventListener('hashchange', router);
router();

// Load initial content
renderFeaturedPortfolio();
renderServices();
renderTestimonials();

// Mobile menu toggle
if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu on link click
if (navLinks) {
    navLinks.addEventListener('click', function() {
        navLinks.classList.remove('active');
    });
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Scroll to top button
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

// Scroll to top
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements
const elementsToAnimate = document.querySelectorAll('.portfolio-item, .service-card, .blog-card, .highlight-item, .booking-step');
elementsToAnimate.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
```

});
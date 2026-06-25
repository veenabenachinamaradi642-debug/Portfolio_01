/**
 * Veena R Benachinamaradi - Portfolio Interactive Scripts
 * Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Theme Toggle (Dark / Light Mode)
    initThemeToggle();

    // 3. Floating Navbar Scroll Effects
    initFloatingNavbar();

    // 4. Typing Effect for Hero Subtitle
    initTypingEffect();

    // 5. Background Particle Animation
    initParticleCanvas();

    // 6. Scroll Progress Indicator
    initScrollProgress();

    // 7. Scroll Reveal (Fade in on scroll)
    initScrollReveal();

    // 8. Statistics Counter Animation
    initStatsCounter();

    // 9. Skills Tab & Progress Bars
    initSkillsTabs();

    // 10. Interactive SVG Radar Chart
    initRadarChart();

    // 11. Project Filtering
    initProjectFiltering();

    // 12. Project Modals Control
    initProjectModals();

    // 13. Testimonials Carousel
    initTestimonialsCarousel();

    // 14. Resume Download Tracker
    initResumeTracker();

    // 15. Contact Form Submission Handling
    initContactForm();
});

/* ==========================================================================
   Theme Toggle System
   ========================================================================== */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = themeToggleBtn.querySelector('.theme-icon-dark');
    const lightIcon = themeToggleBtn.querySelector('.theme-icon-light');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        enableLightMode();
    } else {
        enableDarkMode();
    }

    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            enableDarkMode();
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            enableLightMode();
            localStorage.setItem('portfolio-theme', 'light');
        }
    });

    function enableLightMode() {
        document.body.classList.add('light-mode');
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    }

    function enableDarkMode() {
        document.body.classList.remove('light-mode');
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }
}

/* ==========================================================================
   Floating Navbar Scroll Effects
   ========================================================================== */
function initFloatingNavbar() {
    const navbar = document.getElementById('floating-navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    
    let lastScrollY = window.scrollY;
    const scrollThreshold = 10;
    const hideThreshold = 150;

    // Scroll listener for sticky header styling and auto-hiding
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Sticky transition class
        if (currentScrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Hide/Show navbar on scroll direction (only if dropdown menu is closed)
        if (!mobileDropdown.classList.contains('open')) {
            if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
                // Scrolling down - hide
                navbar.classList.add('nav-hidden');
            } else if (currentScrollY < lastScrollY && Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
                // Scrolling up - show
                navbar.classList.remove('nav-hidden');
            }
        }
        
        lastScrollY = currentScrollY;

        // Sync active nav links based on scrolling section
        syncActiveNavLinks();
    }, { passive: true });

    // Mobile menu toggle click
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileDropdown.classList.toggle('open');
        const menuIcon = mobileMenuBtn.querySelector('i');
        if (mobileDropdown.classList.contains('open')) {
            menuIcon.setAttribute('data-lucide', 'x');
        } else {
            menuIcon.setAttribute('data-lucide', 'menu');
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Close mobile dropdown when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDropdown.classList.remove('open');
            const menuIcon = mobileMenuBtn.querySelector('i');
            menuIcon.setAttribute('data-lucide', 'menu');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });

    // Close mobile dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && mobileDropdown.classList.contains('open')) {
            mobileDropdown.classList.remove('open');
            const menuIcon = mobileMenuBtn.querySelector('i');
            menuIcon.setAttribute('data-lucide', 'menu');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    });

    // Sync active class on navigation links based on current viewport
    const sections = document.querySelectorAll('section');
    function syncActiveNavLinks() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

/* ==========================================================================
   Typing Effect for Hero Title
   ========================================================================== */
function initTypingEffect() {
    const textElement = document.getElementById('dynamic-role');
    const roles = [
        "Python Developer",
        "Data Analyst",
        "Data Science Enthusiast",
        "Software Engineer"
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let erasingSpeed = 60;
    let delayBetweenRoles = 2000;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            textElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(type, 500); // short pause before typing next role
                return;
            }
            setTimeout(type, erasingSpeed);
        } else {
            textElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(type, delayBetweenRoles); // pause on full typed word
                return;
            }
            setTimeout(type, typingSpeed);
        }
    }

    // Start typist loop
    setTimeout(type, 1000);
}

/* ==========================================================================
   Background Particle Canvas
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const particleCount = 60;
    
    // Set Canvas Bounds
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Object constructor
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100; // start below screen
            this.size = Math.random() * 2 + 1;
            this.speedY = -(Math.random() * 0.8 + 0.3); // float upward
            this.speedX = (Math.random() * 0.4 - 0.2);  // slight breeze
            this.opacity = Math.random() * 0.6 + 0.2;
            this.fadeSpeed = 0.003;
            // Palette matches
            const randomVal = Math.random();
            if (randomVal < 0.4) {
                this.color = '168, 85, 247'; // purple
            } else if (randomVal < 0.7) {
                this.color = '99, 102, 241'; // indigo
            } else {
                this.color = '6, 182, 212';  // cyan
            }
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            
            // Fade out as it floats higher
            if (this.y < canvas.height * 0.2) {
                this.opacity -= this.fadeSpeed;
            }
            
            // Reset if out of bounds or invisible
            if (this.y < 0 || this.opacity <= 0 || this.x < 0 || this.x > canvas.width) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        // pre-populate coordinates so they are spread out initially
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }

    // Render loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ==========================================================================
   Scroll Progress Indicator
   ========================================================================== */
function initScrollProgress() {
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    }
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

/* ==========================================================================
   Scroll Reveal Observer
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // once revealed, stop observing to optimize
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Stats Counter Animation
   ========================================================================== */
function initStatsCounter() {
    const statsSection = document.getElementById('stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
            statNumbers.forEach(num => {
                const target = parseFloat(num.getAttribute('data-target'));
                const isFloat = target % 1 !== 0;
                animateCount(num, target, isFloat);
            });
            hasAnimated = true;
        }
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);

    function animateCount(element, target, isFloat) {
        let current = 0;
        const duration = 1500; // ms
        const steps = 60;
        const increment = target / steps;
        let stepCount = 0;
        
        const timer = setInterval(() => {
            current += increment;
            stepCount++;
            
            if (stepCount >= steps) {
                element.textContent = isFloat ? target.toFixed(1) : Math.round(target);
                clearInterval(timer);
            } else {
                element.textContent = isFloat ? current.toFixed(1) : Math.round(current);
            }
        }, duration / steps);
    }
}

/* ==========================================================================
   Skills Tab & Progress Bars
   ========================================================================== */
function initSkillsTabs() {
    const tabBtns = document.querySelectorAll('.skills-tab-btn');
    const tabContents = document.querySelectorAll('.skills-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            targetContent.classList.add('active');
            
            // Re-trigger fills
            triggerProgressFills(targetContent);
        });
    });

    // Run initial progress bar fills for the default active tab
    const initialActiveTab = document.querySelector('.skills-tab-content.active');
    if (initialActiveTab) {
        // Delay slightly for initial load view
        setTimeout(() => triggerProgressFills(initialActiveTab), 300);
    }

    function triggerProgressFills(container) {
        const fills = container.querySelectorAll('.progress-fill');
        fills.forEach(fill => {
            const width = fill.parentElement.previousElementSibling.lastElementChild.textContent; // parses e.g. "90%"
            fill.style.width = '0%';
            // force repaint to allow transitions
            fill.offsetHeight;
            fill.style.width = width;
        });
    }

    // Set up intersection observer to animate progress bars when skills section first enters viewport
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const observer = new IntersectionObserver((entries, observer) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                const activeTab = document.querySelector('.skills-tab-content.active');
                if (activeTab) triggerProgressFills(activeTab);
                observer.unobserve(skillsSection);
            }
        }, { threshold: 0.2 });
        observer.observe(skillsSection);
    }
}

/* ==========================================================================
   Interactive SVG Radar Chart
   ========================================================================== */
function initRadarChart() {
    const radarNodes = document.querySelectorAll('.radar-node');
    const captionEl = document.querySelector('.chart-caption');
    
    const skillInsights = {
        'Python': 'Python (90%): Highly skilled in OOPs design, script automation, data structure algorithms, Django/Flask, and Numpy/Pandas processing.',
        'Data Science': 'Data Science & ML (88%): Proficient in Scikit-Learn pipelines, regression models, dataset normalization, classification, Matplotlib visualizations.',
        'SQL & Databases': 'SQL (85%): Experienced in writing joins, indexes, subqueries, relational database models, transaction management, and DDL/DML scripts.',
        'Frontend': 'Frontend (80%): Solid knowledge of Semantic HTML, modern flexbox/grid layout design, glassmorphic styling, vanilla Javascript animations.',
        'Electronics / Analytics': 'ECE & Analytics (87%): Strong core background in signal logic, diagnostic debugging, mathematical calculations, and hardware integration.'
    };

    radarNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const skillName = node.getAttribute('data-skill');
            const insightText = skillInsights[skillName] || '';
            captionEl.innerHTML = `<strong class="violet-text">${skillName}</strong>: ${insightText}`;
            captionEl.style.color = 'var(--text-primary)';
            node.setAttribute('r', '7');
        });

        node.addEventListener('mouseleave', () => {
            captionEl.textContent = 'Hover over nodes to see proficiency distribution.';
            captionEl.style.color = 'var(--text-muted)';
            node.setAttribute('r', '5');
        });
    });
}

/* ==========================================================================
   Project Filtering
   ========================================================================== */
function initProjectFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Active btn swap
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Hide with transition, then toggle display
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // force layout trigger
                    card.offsetHeight;
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    // wait for transition, then set display
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

/* ==========================================================================
   Project Modals Control
   ========================================================================== */
function initProjectModals() {
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    const closeBtns = document.querySelectorAll('.modal-close-btn');
    const modals = document.querySelectorAll('.project-modal');
    
    // Open modal
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.style.display = 'flex';
                // force redraw
                targetModal.offsetHeight;
                targetModal.classList.add('open');
                document.body.style.overflow = 'hidden'; // lock background scroll
            }
        });
    });

    // Close modal via close button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeModal = btn.closest('.project-modal');
            closeModal(activeModal);
        });
    });

    // Close modal clicking outside content box
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.project-modal.open');
            if (openModal) closeModal(openModal);
        }
    });

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = ''; // restore scrolling
        
        // Wait for CSS fade out to finish, then set display none
        setTimeout(() => {
            if (!modal.classList.contains('open')) {
                modal.style.display = 'none';
            }
        }, 300);
    }
}

/* ==========================================================================
   Testimonials Carousel
   ========================================================================== */
function initTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let currentSlide = 0;
    let carouselInterval;
    
    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startAutoSlide() {
        carouselInterval = setInterval(nextSlide, 6000);
    }

    function stopAutoSlide() {
        clearInterval(carouselInterval);
    }

    // Bind Dot Click listeners
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            showSlide(slideIndex);
            startAutoSlide();
        });
    });

    // Start auto slide loop
    startAutoSlide();
}

/* ==========================================================================
   Resume Download Tracker
   ========================================================================== */
function initResumeTracker() {
    const resumeBtns = [
        document.getElementById('nav-resume-btn'),
        document.getElementById('mobile-resume-btn'),
        document.getElementById('hero-resume-btn'),
        document.getElementById('footer-resume-download')
    ];
    
    const banner = document.getElementById('resume-download-banner');
    
    resumeBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            // Log local storage counter
            let downloads = parseInt(localStorage.getItem('resume-download-count') || '0');
            downloads++;
            localStorage.setItem('resume-download-count', downloads);
            
            // Show toast notification banner
            banner.classList.add('show');
            
            // Hide banner after 4.5 seconds
            setTimeout(() => {
                banner.classList.remove('show');
            }, 4500);
        });
    });
}

/* ==========================================================================
   Contact Form Validation & Processing
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const successModal = document.getElementById('contact-success-modal');
    const successCloseBtn = document.getElementById('success-close-btn');
    const submitBtn = form.querySelector('.form-submit-btn');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();
        
        if (!name || !email || !subject || !message) {
            return;
        }

        // Animate button sending states
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.8';
        submitBtn.innerHTML = `Sending... <i data-lucide="loader" class="animate-spin"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Simulate API network latency (1.5 seconds)
        setTimeout(() => {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = originalBtnContent;
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Log submission metadata locally
            const contactLogs = JSON.parse(localStorage.getItem('contact-submissions') || '[]');
            contactLogs.push({
                name,
                email,
                subject,
                message,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('contact-submissions', JSON.stringify(contactLogs));

            // Trigger success dialog modal
            successModal.style.display = 'flex';
            successModal.offsetHeight;
            successModal.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Clear inputs
            form.reset();
        }, 1500);
    });

    // Close success dialog
    successCloseBtn.addEventListener('click', () => {
        closeSuccessModal();
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });

    function closeSuccessModal() {
        successModal.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!successModal.classList.contains('open')) {
                successModal.style.display = 'none';
            }
        }, 300);
    }
}

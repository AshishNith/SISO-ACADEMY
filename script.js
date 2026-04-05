document.addEventListener('DOMContentLoaded', () => {
    // 1. STICKY NAV & BACKGROUND CHANGE
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. SCROLL REVEAL ANIMATIONS
    const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-fade');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Only reveal once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. STATS COUNTER ANIMATION
    const stats = document.querySelectorAll('.hstat-num[data-target], .an-num[data-target]');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => countObserver.observe(stat));

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + (obj.innerHTML.includes('+') ? '+' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // 4. SMOOTH SCROLLING FOR INTERNAL LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = nav.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });

    // 5. MOBILE MENU TOGGLE
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open on mobile
            if (navLinks.classList.contains('active')) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Reset menu state on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // 6. MAGNETIC BUTTON EFFECT (Subtle)
    const btns = document.querySelectorAll('.btn-primary, .btn-ghost, .btn-white');
    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });

    // 7. FETCH LATEST YOUTUBE VIDEOS
    const videoContainer = document.getElementById('video-container');
    const channelId = 'UCLQhONeigx8Y3r-c9TRT3fA';
    
    if (videoContainer) {
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D${channelId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    videoContainer.innerHTML = ''; // Clear loading state
                    data.items.slice(0, 3).forEach((item, index) => {
                        const date = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        
                        const videoCard = document.createElement('article');
                        videoCard.className = 'vid-card reveal-up';
                        videoCard.innerHTML = `
                            <div class="vid-thumb" style="background-image: linear-gradient(rgba(13,13,13,0.3), rgba(13,13,13,0.3)), url('${item.thumbnail}')">
                                <div class="vid-overlay-sym">${getSymbol(item.title)}</div>
                                <a href="${item.link}" target="_blank" class="vid-play" aria-label="Play Video">▶</a>
                                <div class="vid-badge">Latest</div>
                            </div>
                            <div class="vid-body">
                                <div class="vid-subj">Mathematics</div>
                                <h3 class="vid-title">${item.title}</h3>
                                <div class="vid-meta">${date} · Siso Academy</div>
                            </div>
                        `;
                        videoContainer.appendChild(videoCard);
                        
                        // Observe the newly created element for scroll reveal
                        revealObserver.observe(videoCard);
                    });
                } else {
                    throw new Error('RSS conversion failed');
                }
            })
            .catch(err => {
                console.error('Error fetching videos:', err);
                videoContainer.innerHTML = '<div class="loading-state">Failed to load recent lessons. Visit YouTube for more.</div>';
            });
    }

    function getSymbol(title) {
        const text = title.toLowerCase();
        if (text.includes('algebra') || text.includes('quadratic')) return 'x²';
        if (text.includes('calculus') || text.includes('derivative') || text.includes('integration')) return '∫';
        if (text.includes('geometry') || text.includes('triangle') || text.includes('angle')) return '△';
        if (text.includes('stats') || text.includes('probability') || text.includes('data')) return '%';
        if (text.includes('trigo')) return 'sin θ';
        return '∑';
    }

    console.log('Siso Academy scripts initialized.');
});

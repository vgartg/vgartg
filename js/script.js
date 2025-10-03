let currentLanguage = 'ru';
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.error(`Error loading ${lang} translations:`, error);
        return {};
    }
}

function updateContent(lang) {
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(translations[lang], key);
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    localStorage.setItem('preferred-language', lang);
    currentLanguage = lang;
    
    updateExperienceDurations();
    updateDateRanges();
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getTranslation(obj, key) {
    return key.split('.').reduce((o, k) => o && o[k], obj);
}

function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const newLang = btn.getAttribute('data-lang');
            if (newLang !== currentLanguage) {
                if (!translations[newLang]) {
                    await loadTranslations(newLang);
                }
                updateContent(newLang);
            }
        });
    });
}

function loadComponents() {
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initNavigation();
            initLanguageSwitcher();
        })
        .catch(error => {
            console.error('Error loading header:', error);
            createFallbackNavigation();
        });

    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            createFallbackFooter();
        });
}

function createFallbackNavigation() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <nav class="navbar">
            <a href="#home" class="logo">vgartg</a>
            <div class="nav-links">
                <a href="#home">Главная</a>
                <a href="#about">Обо мне</a>
                <a href="#projects">Проекты</a>
                <a href="#experience">Опыт</a>
                <a href="#contact">Контакты</a>
            </div>
            <button class="menu-btn">
                <i class="fas fa-bars"></i>
            </button>
        </nav>
    `;
    initNavigation();
}

function createFallbackFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <footer>
            <div class="footer-content">
                <div class="footer-logo">vgartg</div>
                <div class="footer-links">
                    <a href="#home">Главная</a>
                    <a href="#about">Обо мне</a>
                    <a href="#projects">Проекты</a>
                    <a href="#experience">Опыт</a>
                    <a href="#contact">Контакты</a>
                </div>
                <div class="copyright">© 2024 vgartg. Все права защищены.</div>
            </div>
        </footer>
    `;
}

function initNavigation() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks && menuBtn) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                    menuBtn.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && navLinks && menuBtn) {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        }
    });
}

function calculateMonthDifference(startDate, endDate = new Date()) {
    const start = new Date(startDate);
    const end = endDate === 'present' ? new Date() : new Date(endDate);
    
    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();
    
    return yearsDifference * 12 + monthsDifference;
}

function formatDurationRu(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
        return `${months} ${getRussianMonths(months)}`;
    } else if (remainingMonths === 0) {
        return `${years} ${getRussianYears(years)}`;
    } else {
        return `${years} ${getRussianYears(years)} ${remainingMonths} ${getRussianMonths(remainingMonths)}`;
    }
}

function formatDurationEn(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
        return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
        return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
}

function getRussianYears(years) {
    if (years === 1) return 'год';
    if (years >= 2 && years <= 4) return 'года';
    return 'лет';
}

function getRussianMonths(months) {
    if (months === 1) return 'месяц';
    if (months >= 2 && months <= 4) return 'месяца';
    return 'месяцев';
}

function updateExperienceDurations() {
    const experienceData = [
        {
            key: 'trucker',
            startDate: '2024-12-01',
            endDate: 'present'
        },
        {
            key: 'jammer',
            startDate: '2024-07-01',
            endDate: 'present'
        },
        {
            key: 'elina',
            startDate: '2025-08-01',
            endDate: 'present'
        },
        {
            key: 'purmarili',
            startDate: '2024-05-01',
            endDate: '2024-09-01'
        },
        {
            key: 'viomitra',
            startDate: '2023-07-01',
            endDate: '2024-12-01'
        }
    ];

    experienceData.forEach(exp => {
        const months = calculateMonthDifference(exp.startDate, exp.endDate);
        const duration = currentLanguage === 'ru' ? formatDurationRu(months) : formatDurationEn(months);
        
        const durationElement = document.querySelector(`[data-i18n="experience.durations.${exp.key}"]`);
        if (durationElement) {
            durationElement.textContent = duration;
        }
        
        if (translations.ru && translations.ru.experience && translations.ru.experience.durations) {
            translations.ru.experience.durations[exp.key] = formatDurationRu(months);
        }
        if (translations.en && translations.en.experience && translations.en.experience.durations) {
            translations.en.experience.durations[exp.key] = formatDurationEn(months);
        }
    });
}

function updateDateRanges() {
    const dateRanges = {
        'trucker': { start: 'Декабрь 2024', end: 'настоящее время' },
        'jammer': { start: 'Июль 2024', end: 'настоящее время' },
        'elina': { start: 'Август 2025', end: 'настоящее время' },
        'purmarili': { start: 'Май 2024', end: 'Сентябрь 2024' },
        'viomitra': { start: 'Июль 2023', end: 'Декабрь 2024' }
    };

    Object.keys(dateRanges).forEach(key => {
        const range = dateRanges[key];
        const rangeText = currentLanguage === 'ru' 
            ? `${range.start} — ${range.end}`
            : `${range.start} — ${range.end === 'настоящее время' ? 'Present' : range.end}`;
        
        const rangeElement = document.querySelector(`[data-i18n="experience.dateRanges.${key}"]`);
        if (rangeElement) {
            rangeElement.textContent = rangeText;
        }
        
        if (translations.ru && translations.ru.experience && translations.ru.experience.dateRanges) {
            translations.ru.experience.dateRanges[key] = `${range.start} — ${range.end}`;
        }
        if (translations.en && translations.en.experience && translations.en.experience.dateRanges) {
            translations.en.experience.dateRanges[key] = `${range.start} — ${range.end === 'настоящее время' ? 'Present' : range.end}`;
        }
    });
}

function initMobileAnimations() {
    if (window.innerWidth <= 768) {
        console.log('Initializing mobile animations...');
        
        const mobileAnimateElements = (elements, delay = 0) => {
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay + (index * 100));
            });
        };

        const heroElements = document.querySelectorAll('.hero .fade-in');
        setTimeout(() => {
            mobileAnimateElements(heroElements, 300);
        }, 500);

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.transition = 'all 0.6s ease';
                    }, 200);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animateOnScroll = document.querySelectorAll('.about-content, .project-card, .experience-item, .contact-content, .skills');
        animateOnScroll.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease 0.2s';
            observer.observe(el);
        });

        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach((tag, index) => {
            tag.style.opacity = '0';
            tag.style.transform = 'translateX(-20px)';
            tag.style.transition = `all 0.4s ease ${index * 0.05}s`;
        });

        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillTags.forEach(tag => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateX(0)';
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            skillsObserver.observe(skillsSection);
        }
    }
}

function initScrollAnimations() {
    if (window.innerWidth <= 768) {
        initMobileAnimations();
        return;
    }

    const fadeElements = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);
    
    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
}

function initTypingAnimation() {
    const techStack = ['Ruby', 'Ruby-on-Rails', 'JavaScript', 'TypeScript', 'React', 'ASP.NET'];
    let currentTechIndex = 0;
    const typingElement = document.querySelector('.changing-tech');
    
    if (typingElement) {
        function typeTech() {
            const currentTech = techStack[currentTechIndex];
            typingElement.textContent = currentTech;
            currentTechIndex = (currentTechIndex + 1) % techStack.length;
        }
        
        if (window.innerWidth > 768 || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            typeTech();
            setInterval(typeTech, 2000);
        } else {
            typingElement.textContent = 'современных технологий';
        }
    }
}

function initNavbarScroll() {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.padding = '1rem 5%';
            navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.95)';
            
            if (window.innerWidth <= 768) {
                if (window.scrollY > lastScrollY && window.scrollY > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
        } else {
            navbar.style.padding = '1.5rem 5%';
            navbar.style.backgroundColor = 'rgba(13, 13, 20, 0.9)';
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = window.scrollY;
    });
}

function initGSAPScrollAnimations() {
    if (window.innerWidth <= 768) {
        console.log('Using mobile animations instead of GSAP');
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not available, using fallback animations');
        initMobileAnimations();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    try {
        gsap.fromTo('.hero .fade-in', 
            {
                y: 50,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                delay: 0.3
            }
        );

        gsap.fromTo('.about-content', 
            {
                y: 80,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: '.about',
                    start: 'top 80%',
                    end: 'bottom 40%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo('.skill-tag', 
            {
                x: -50,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: '.skills',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo('.project-card', 
            {
                y: 80,
                opacity: 0,
                scale: 0.9
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.projects-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo('.experience-item', 
            {
                x: -60,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.experience-timeline',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo('.contact-content', 
            {
                y: 60,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: '.contact',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    } catch (error) {
        console.error('GSAP animation error:', error);
        initMobileAnimations();
    }
}

function supportsIntersectionObserver() {
    return 'IntersectionObserver' in window &&
           'IntersectionObserverEntry' in window &&
           'intersectionRatio' in window.IntersectionObserverEntry.prototype;
}

function supportsGSAP() {
    return typeof gsap !== 'undefined';
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing...');
    
    if (!supportsIntersectionObserver()) {
        console.warn('Intersection Observer not supported, using fallback animations');
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    const savedLanguage = localStorage.getItem('preferred-language') || 'ru';
    
    try {
        await loadTranslations(savedLanguage);
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
    
    loadComponents();
    
    setTimeout(() => {
        if (supportsGSAP() && window.innerWidth > 768) {
            initGSAPScrollAnimations();
        } else {
            console.log('Using fallback animations');
            initMobileAnimations();
        }
        
        initScrollAnimations();
        initTypingAnimation();
        initNavbarScroll();
    }, 100);
    
    updateContent(savedLanguage);
    updateExperienceDurations();
    updateDateRanges();
});

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized, reinitializing animations...');
        if (window.innerWidth <= 768) {
            initMobileAnimations();
        } else {
            initGSAPScrollAnimations();
        }
    }, 250);
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                initMobileAnimations();
            }
        }, 100);
    }
});

window.addEventListener('error', function(e) {
    console.error('Error loading resource:', e);
});

window.reinitAnimations = function() {
    if (window.innerWidth <= 768) {
        initMobileAnimations();
    } else {
        initGSAPScrollAnimations();
    }
    initScrollAnimations();
};
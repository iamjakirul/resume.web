/**
 * PORTFOLIO INTERACTION & ANIMATION CONTROLLER
 * Developer: MD. Jakirul Islam
 * Features:
 *   1. Smooth Custom Cursor & Purple Spotlight Follower
 *   2. Interactive Resume Popover / Dropdown Menus
 *   3. Staggered Entrance Animations for Project Cards
 *   4. Segmented Timeline Switcher [Experience | Education]
 *   5. Interactive Glowing "Copy Email" Button & Tooltips
 *   6. Dynamic Typewriter Role Animator
 *   7. Interactive C Simulation Terminal Modals
 *   8. Interactive CV / Resume Preview Modal
 *   9. 3D Pointer Card Tilting & Responsive Nav
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursorSpotlight();
  initBackgroundCanvas();
  initTypewriter();
  initHeaderScroll();
  initMobileDrawer();
  initActiveNavObserver();
  initResumeDropdowns();
  initTimelineSwitcher();
  initProjectSlider();
  initMainCopyEmail();
  initContactForm();
  initTerminalSimulator();
  initResumeModal();
  initCardTilt();

  // Instant scroll on direct anchor or query param
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('target') || (window.location.hash ? window.location.hash.substring(1) : null);
  if (targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, target.offsetTop - 70);
    }
  }

  // Auto-launch simulation modal if specified in URL query
  const simParam = urlParams.get('sim');
  if (simParam) {
    setTimeout(() => {
      const trigger = document.querySelector(`[data-run-terminal="${simParam}"]`);
      if (trigger) trigger.click();
    }, 200);
  }

  // Auto-launch resume modal if specified in URL query
  if (urlParams.get('resume') === '1') {
    setTimeout(() => {
      const resumeModal = document.getElementById('resume-modal');
      if (resumeModal) {
        resumeModal.classList.add('open');
        resumeModal.setAttribute('aria-hidden', 'false');
      }
    }, 200);
  }
});

/* --------------------------------------------------------------------------
   1. Custom Cursor & Purple Spotlight Follower (Global Animation Requirement)
   -------------------------------------------------------------------------- */
function initCursorSpotlight() {
  const spotlight = document.getElementById('cursor-spotlight');
  const dot = document.getElementById('cursor-dot');

  // Only enable on fine pointer devices (desktop mouse)
  if (!spotlight || !dot || !window.matchMedia('(pointer: fine)').matches) {
    if (spotlight) spotlight.style.display = 'none';
    if (dot) dot.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let spotX = mouseX;
  let spotY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Direct snappy position for center dot
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderSpotlight);
    }
  });

  // Smooth lerp (linear interpolation) for trailing purple background glow
  function renderSpotlight() {
    const ease = 0.12;
    spotX += (mouseX - spotX) * ease;
    spotY += (mouseY - spotY) * ease;

    spotlight.style.transform = `translate(${spotX}px, ${spotY}px) translate(-50%, -50%)`;

    const dist = Math.hypot(mouseX - spotX, mouseY - spotY);
    if (dist > 0.3) {
      requestAnimationFrame(renderSpotlight);
    } else {
      isMoving = false;
    }
  }

  // Hover detection for interactive elements (dot expands and pulses)
  const hoverSelectors = 'a, button, .clean-project-card, .timeline-pill-btn, .tool-chip, .skill-tag-pill, .about-mini-badge, input, textarea';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelectors)) {
      dot.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelectors)) {
      dot.classList.remove('hovered');
    }
  });

  // Fade out cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
    dot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    spotlight.style.opacity = '1';
    dot.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   2. Background Stars / Twinkle Grid Canvas
   -------------------------------------------------------------------------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars();
  });

  let stars = [];
  function createStars() {
    stars = [];
    const count = Math.min(Math.floor((width * height) / 16000), 80);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.015 + 0.005,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  createStars();

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.alpha += s.speed * s.direction;
      if (s.alpha >= 0.85) {
        s.alpha = 0.85;
        s.direction = -1;
      } else if (s.alpha <= 0.12) {
        s.alpha = 0.12;
        s.direction = 1;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192, 132, 252, ${s.alpha * 0.5})`;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   3. Dynamic Typewriter Role Animator
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const target = document.getElementById('typewriter-text');
  if (!target) return;

  const titles = [
    'AI & Software',
    'Algorithm & C Core',
    'Problem Solver',
    'System Architecture',
    'Competitive Coder'
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
      target.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      target.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      typingSpeed = 2200; // Pause on completed phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typingSpeed = 450; // Pause before typing next phrase
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* --------------------------------------------------------------------------
   4. Header Scroll Glassmorphic Effect
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   5. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggleBtn || !drawer) return;

  function toggleMenu() {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  toggleBtn.addEventListener('click', toggleMenu);

  drawer.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   6. Active Nav Link Intersection Observer
   -------------------------------------------------------------------------- */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-drawer .mobile-nav-link');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          desktopLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
          mobileLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { threshold: 0.25 }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* --------------------------------------------------------------------------
   7. Resume Dropdown / Popover Menus (Inspired by Video Images 4 & 5)
   -------------------------------------------------------------------------- */
function initResumeDropdowns() {
  const dropdownWrappers = document.querySelectorAll('.resume-dropdown-wrapper');

  dropdownWrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector('.resume-dropdown-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');

      // Close all other open dropdowns first
      dropdownWrappers.forEach((w) => w.classList.remove('open'));

      if (!isOpen) {
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.resume-dropdown-wrapper')) {
      dropdownWrappers.forEach((w) => {
        w.classList.remove('open');
        const trigger = w.querySelector('.resume-dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close dropdowns on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownWrappers.forEach((w) => {
        w.classList.remove('open');
        const trigger = w.querySelector('.resume-dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Popover buttons triggering modal preview
  const previewModalBtns = [
    document.getElementById('popover-preview-modal-btn'),
    document.getElementById('about-preview-modal-trigger')
  ];

  previewModalBtns.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownWrappers.forEach((w) => w.classList.remove('open'));
      const resumeModal = document.getElementById('resume-modal');
      if (resumeModal) {
        resumeModal.classList.add('open');
        resumeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Segmented Timeline Switcher [Education | Experience] (Inspired by Image 2)
   -------------------------------------------------------------------------- */
function initTimelineSwitcher() {
  const tabEducation = document.getElementById('tab-education');
  const tabExperience = document.getElementById('tab-experience');
  const viewEducation = document.getElementById('view-education');
  const viewExperience = document.getElementById('view-experience');

  if (!tabEducation || !tabExperience || !viewEducation || !viewExperience) return;

  tabEducation.addEventListener('click', () => {
    tabEducation.classList.add('active');
    tabExperience.classList.remove('active');

    viewEducation.classList.add('active');
    viewExperience.classList.remove('active');
  });

  tabExperience.addEventListener('click', () => {
    tabExperience.classList.add('active');
    tabEducation.classList.remove('active');

    viewExperience.classList.add('active');
    viewEducation.classList.remove('active');
  });
}

/* --------------------------------------------------------------------------
   9. Side-Sliding Project Showcase Carousel (User Requirement)
   -------------------------------------------------------------------------- */
function initProjectSlider() {
  const track = document.getElementById('project-slider-track');
  const slides = document.querySelectorAll('.project-slide');
  const prevBtn = document.getElementById('project-prev-btn');
  const nextBtn = document.getElementById('project-next-btn');
  const dots = document.querySelectorAll('.slider-dot');
  const currentNumEl = document.getElementById('slider-current-num');
  const viewport = document.getElementById('project-slider-viewport');
  const sliderWrapper = document.getElementById('project-slider-wrapper');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlider(index) {
    if (index < 0) {
      index = totalSlides - 1;
    } else if (index >= totalSlides) {
      index = 0;
    }
    currentIndex = index;

    // Slide track horizontally: each slide occupies 100% width
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Visual emphasis on active slide
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Update pagination dots
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });

    // Update counter text (01 / 03)
    if (currentNumEl) {
      currentNumEl.textContent = `0${currentIndex + 1}`;
    }
  }

  // Previous & Next Button Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlider(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlider(currentIndex + 1);
    });
  }

  // Dot Indicators
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const gotoIdx = parseInt(dot.getAttribute('data-goto'), 10);
      if (!isNaN(gotoIdx)) {
        updateSlider(gotoIdx);
      }
    });
  });

  // Touch & Swipe for mobile/tablet
  if (viewport) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Ensure horizontal swipe is dominant and exceeds 40px threshold
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          updateSlider(currentIndex + 1);
        } else {
          updateSlider(currentIndex - 1);
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation when slider area is focused or hovered
  if (sliderWrapper) {
    sliderWrapper.setAttribute('tabindex', '0');
    sliderWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSlider(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSlider(currentIndex + 1);
      }
    });
  }

  // Initialize first slide
  updateSlider(0);
}

/* --------------------------------------------------------------------------
   10. Interactive Glowing "Copy Email" Button (Inspired by Image 1)
   -------------------------------------------------------------------------- */
function initMainCopyEmail() {
  const copyBtn = document.getElementById('main-copy-email-btn');
  const btnText = document.getElementById('main-copy-btn-text');
  const emailTextEl = document.getElementById('email-address-text');

  if (!copyBtn) return;

  const emailToCopy = emailTextEl ? emailTextEl.textContent.trim() : 'jakirulislam.cse@gmail.com';

  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        const temp = document.createElement('textarea');
        temp.value = emailToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      // Visual feedback on button
      copyBtn.classList.add('copied');
      if (btnText) btnText.textContent = 'Email Copied! 🎉';
      showToast(`Copied to clipboard: ${emailToCopy}`, 'success');

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (btnText) btnText.textContent = 'Copy Email';
      }, 2400);
    } catch (err) {
      showToast(`Email: ${emailToCopy}`, 'info');
    }
  });

  // Open Message Form Button
  const openFormBtn = document.getElementById('open-message-form-btn');
  const formContainer = document.getElementById('message-form-container');
  if (openFormBtn && formContainer) {
    openFormBtn.addEventListener('click', (e) => {
      e.preventDefault();
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = formContainer.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }
}

/* --------------------------------------------------------------------------
   11. Contact Form Handler & Submission Feedback
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const feedback = document.getElementById('form-feedback');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    [nameError, emailError, messageError].forEach((el) => {
      if (el) {
        el.textContent = '';
        el.classList.remove('show');
      }
    });

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const messageVal = messageInput.value.trim();
    const subjectVal = subjectInput ? subjectInput.value.trim() : '';

    if (!nameVal) {
      if (nameError) {
        nameError.textContent = 'Please enter your name.';
        nameError.classList.add('show');
      }
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      if (emailError) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.classList.add('show');
      }
      isValid = false;
    }

    if (!messageVal || messageVal.length < 5) {
      if (messageError) {
        messageError.textContent = 'Please write a message with at least 5 characters.';
        messageError.classList.add('show');
      }
      isValid = false;
    }

    if (!isValid) return;

    // Loading State
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      feedback.className = 'form-feedback success';
      feedback.innerHTML = `
        <strong>Thank you, ${escapeHtml(nameVal)}!</strong> Your message has been received.<br>
        I will review it and reply back to <em>${escapeHtml(emailVal)}</em> promptly.
      `;
      showToast('Message sent successfully!', 'success');

      form.reset();
    }, 1100);
  });
}

/* --------------------------------------------------------------------------
   12. Live Terminal Simulation Modal
   -------------------------------------------------------------------------- */
const terminalSimData = {
  'hall-canteen': {
    title: 'bash — ./hall_canteen_portal.c (Role: Admin / Student)',
    commands: [
      { id: 'hc-rooms', label: '1. View Room Matrix', action: runHCRooms },
      { id: 'hc-alloc', label: '2. Allocate Room #B-405', action: runHCAlloc },
      { id: 'hc-meal', label: '3. Issue Meal Token', action: runHCMeal },
      { id: 'hc-bill', label: '4. Calculate Monthly Ledger', action: runHCBill }
    ],
    initScreen: [
      '<span class="terminal-prompt">diu_admin@smart-hall:~$</span> <span class="terminal-cmd">./hall_canteen_portal --init</span>',
      '<span class="terminal-highlight">===============================================================</span>',
      '<span class="terminal-highlight">  DIU SMART HALL & CANTEEN MANAGEMENT SYSTEM [v2.4]</span>',
      '<span class="terminal-highlight">  Developed in C by MD. Jakirul Islam (Structs & File I/O)</span>',
      '<span class="terminal-highlight">===============================================================</span>',
      '<span class="terminal-success">[OK] Loaded binary database "hall_database.dat" (120 rooms indexed).</span>',
      '<span class="terminal-success">[OK] Role authenticated: System Administrator (ID: 231-15-4892).</span>',
      'Ready for command. Click simulation buttons below or observe output.'
    ]
  },
  'hall-student': {
    title: 'bash — ./student_linked_list.c (Singly Linked List Engine)',
    commands: [
      { id: 'sl-insert', label: '1. Insert Node via malloc()', action: runSLInsert },
      { id: 'sl-traverse', label: '2. Traverse Linked List', action: runSLTraverse },
      { id: 'sl-search', label: '3. Search by ID (O(1) Check)', action: runSLSearch },
      { id: 'sl-free', label: '4. Memory Audit (valgrind)', action: runSLMemory }
    ],
    initScreen: [
      '<span class="terminal-prompt">jakirul@diu-terminal:~$</span> <span class="terminal-cmd">gcc -Wall -O2 student_linked_list.c -o student_engine</span>',
      '<span class="terminal-prompt">jakirul@diu-terminal:~$</span> <span class="terminal-cmd">./student_engine</span>',
      '<span class="terminal-highlight">== SINGLY LINKED LIST STUDENT LIFECYCLE CONTROLLER ==</span>',
      'Node structure: sizeof(StudentNode) = 64 bytes on 64-bit architecture.',
      '<span class="terminal-success">HEAD pointer initialized to NULL. Ready for dynamic allocations.</span>'
    ]
  },
  'hospital-queue': {
    title: 'bash — ./hospital_triage_queue.c (Max-Heap & Greedy Triage)',
    commands: [
      { id: 'hq-emergency', label: '1. Triage Critical Patient (Score: 99)', action: runHQEmergency },
      { id: 'hq-dispatch', label: '2. Extract Max & Assign Doctor', action: runHQDispatch },
      { id: 'hq-view', label: '3. Show Triage Heap Levels', action: runHQView },
      { id: 'hq-sim', label: '4. Simulate 5 Incoming Cases', action: runHQBatch }
    ],
    initScreen: [
      '<span class="terminal-prompt">root@triage-monitor:~$</span> <span class="terminal-cmd">./hospital_queue --live-emergency</span>',
      '<span class="terminal-danger">🚨 EMERGENCY DEPARTMENT TRIAGE CONTROLLER ACTIVE</span>',
      'Max-Heap Priority Queue allocated with capacity = 100.',
      'Greedy Heuristic Dispatching enabled: Priority = f(vitals, severity, wait_time).',
      '<span class="terminal-success">System listening for emergency arrivals...</span>'
    ]
  }
};

let currentSimKey = 'hall-canteen';

function initTerminalSimulator() {
  const modal = document.getElementById('terminal-modal');
  const screen = document.getElementById('modal-terminal-screen');
  const titleText = document.getElementById('terminal-title-text');
  const tabs = document.querySelectorAll('[data-switch-sim]');
  const btnGroup = document.getElementById('sim-btn-group');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeDot = document.getElementById('modal-close-dot');

  if (!modal || !screen) return;

  function openSim(key) {
    currentSimKey = key;
    const data = terminalSimData[key];
    if (!data) return;

    if (titleText) titleText.textContent = data.title;

    tabs.forEach((tab) => {
      if (tab.getAttribute('data-switch-sim') === key) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    screen.innerHTML = data.initScreen.map((line) => `<div class="terminal-line">${line}</div>`).join('');

    if (btnGroup) {
      btnGroup.innerHTML = '';
      data.commands.forEach((cmd) => {
        const btn = document.createElement('button');
        btn.className = 'sim-action-btn';
        btn.textContent = cmd.label;
        btn.addEventListener('click', () => {
          cmd.action(screen);
        });
        btnGroup.appendChild(btn);
      });
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSim() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-run-terminal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-run-terminal');
      openSim(key);
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-switch-sim');
      openSim(key);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeSim);
  if (closeDot) closeDot.addEventListener('click', closeSim);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSim();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeSim();
    }
  });
}

function appendTermLine(screen, html) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = html;
  screen.appendChild(line);
  screen.scrollTop = screen.scrollHeight;
}

// Hall Canteen Simulator Actions
function runHCRooms(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: print_hall_matrix()</span>');
  appendTermLine(
    screen,
    `<span class="terminal-highlight">---------------------------------------------------------</span><br>
     [ROOM]  [OCCUPANT ID]   [NAME]             [MEAL TOKENS]<br>
     #B-401  231-15-4810     Rahim Chowdhury    54 (Active)<br>
     #B-402  231-15-4892     Jakirul Islam      62 (Active)<br>
     #B-403  231-15-5102     Tanvir Ahmed       45 (Active)<br>
     #B-404  -- VACANT --    -- OPEN --         0<br>
     <span class="terminal-highlight">---------------------------------------------------------</span><br>
     Total occupancy: 118 / 120 (98.3%). Status: STABLE.`
  );
}

function runHCAlloc(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: allocate_room("231-15-6200", "B-404")</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">✔ Student "Amina Begum" (ID: 231-15-6200) assigned to Room #B-404.</span><br>
     ✔ Security deposit recorded: 5,000 BDT.<br>
     ✔ Struct written to "hall_database.dat" via fwrite(). Persistence guaranteed.`
  );
}

function runHCMeal(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: issue_canteen_token("231-15-4892", MEAL_DINNER)</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">★ DINNER TOKEN GENERATED: [TKN-9842]</span><br>
     Student: MD. Jakirul Islam | Room: #B-402<br>
     Deduction: 65 BDT | Remaining Tokens: 61<br>
     Time: 08:30 PM | Canteen Ledger updated in O(1).`
  );
}

function runHCBill(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: generate_monthly_ledger()</span>');
  appendTermLine(
    screen,
    `<span class="terminal-highlight">=== MONTHLY CANTEEN & HALL LEDGER SUMMARY ===</span><br>
     Total Meals Served: 4,890 tokens<br>
     Canteen Revenue: 317,850 BDT<br>
     Room Maintenance Fund: 240,000 BDT<br>
     <span class="terminal-success">Audit complete. Zero discrepancies detected across records.</span>`
  );
}

// Student Linked List Simulator Actions
function runSLInsert(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: insert_node_head("231-15-9999", "Naimur Rahman", 3.95)</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">✔ malloc(sizeof(StudentNode)) allocated at heap addr: 0x7ffee4b2a810.</span><br>
     ✔ Node created: [ID: 231-15-9999 | Naimur Rahman | GPA: 3.95]<br>
     ✔ newNode-&gt;next = HEAD; HEAD = newNode; (Execution: O(1) constant time).`
  );
}

function runSLTraverse(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: traverse_list(HEAD)</span>');
  appendTermLine(
    screen,
    `<span class="terminal-highlight">[HEAD: 0x7ffee4b2a810]</span><br>
     ➜ [Node 1: 231-15-9999 | Naimur Rahman | 3.95] -&gt;<br>
     ➜ [Node 2: 231-15-4892 | Jakirul Islam | 3.90] -&gt;<br>
     ➜ [Node 3: 231-15-5100 | Sadia Rahman  | 3.85] -&gt;<br>
     <span class="terminal-warn">➜ [NULL Terminator]</span><br>
     <span class="terminal-success">Total Nodes: 3 | Traversal latency: 0.00012 ms.</span>`
  );
}

function runSLSearch(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: search_student_by_id(HEAD, "231-15-4892")</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">✔ Match Found!</span><br>
     Name: MD. Jakirul Islam<br>
     ID: 231-15-4892<br>
     Department: Computer Science & Engineering (DIU)<br>
     GPA: 3.90<br>
     Traversed Hops: 2 | Pointer: 0x7ffee4b2a850.`
  );
}

function runSLMemory(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: valgrind --leak-check=full ./student_engine</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">== HEAP SUMMARY ==</span><br>
     in use at exit: 0 bytes in 0 blocks<br>
     total heap usage: 4 allocs, 4 frees, 256 bytes allocated<br>
     <span class="terminal-success">All heap blocks were freed -- no leaks are possible!</span><br>
     ERROR SUMMARY: 0 errors from 0 contexts.`
  );
}

// Hospital Queue Simulator Actions
function runHQEmergency(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: insert_patient_heap("P-999", "Acute Stroke", 99, 0)</span>');
  appendTermLine(
    screen,
    `<span class="terminal-danger">🚨 CRITICAL ADMISSION INJECTED!</span><br>
     Patient: #P-999 | Condition: Acute Stroke | Severity Score: <span class="terminal-danger">99 / 100</span><br>
     Max-Heap: Bubbled up to ROOT in 2 swap operations [O(log N)].<br>
     Alarm triggered: Audio alert sent to ER Resuscitation Bay 1.`
  );
}

function runHQDispatch(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: extract_max_greedy_triage()</span>');
  appendTermLine(
    screen,
    `<span class="terminal-success">✔ Greedy Heuristic Dispatched: Patient #P-999</span><br>
     Assigned: Dr. M. Hasan (Senior ER Specialist)<br>
     Destination: Trauma & Critical ICU Unit<br>
     Heap Re-balanced in O(log N) down-heap swaps. Next highest severity ready.`
  );
}

function runHQView(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: print_heap_queue_levels()</span>');
  appendTermLine(
    screen,
    `<span class="terminal-highlight">=== MAX-HEAP PRIORITY QUEUE STATUS ===</span><br>
     [ROOT] Level 1 (Severity 94): Patient #P-901 (Cardiac Arrest) -&gt; ICU 1<br>
     ├── [L2-A] Level 2 (Severity 78): Patient #P-884 (Fracture Trauma) -&gt; Surg 2<br>
     └── [L2-B] Level 2 (Severity 72): Patient #P-820 (Severe Burn) -&gt; Burn Bay<br>
     Total In Queue: 14 patients. Average wait for critical: 0 minutes.`
  );
}

function runHQBatch(screen) {
  appendTermLine(screen, '<span class="terminal-prompt">&gt;</span> <span class="terminal-cmd">execute: simulate_rush_hour(5_patients)</span>');
  appendTermLine(
    screen,
    `<span class="terminal-warn">⚡ Simulating 5 arrivals with randomized severity distributions...</span><br>
     + P-101 (Score: 45) -> Enqueued Level 3 (General Clinic)<br>
     + P-102 (Score: 88) -> Enqueued Level 2 (Emergency Ward)<br>
     + P-103 (Score: 22) -> Enqueued Level 3 (Prescription Counter)<br>
     + P-104 (Score: 96) -> <span class="terminal-danger">HEAP TOP PRIORITY (Cardiac)</span><br>
     + P-105 (Score: 60) -> Enqueued Level 3<br>
     <span class="terminal-success">Greedy queue re-indexed in 0.0004s. Doctors alerted.</span>`
  );
}

/* --------------------------------------------------------------------------
   13. Resume Viewer Modal
   -------------------------------------------------------------------------- */
function initResumeModal() {
  const modal = document.getElementById('resume-modal');
  const closeBtn = document.getElementById('resume-modal-close');

  if (!modal) return;

  function closeResume() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeResume);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeResume();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeResume();
    }
  });
}

/* --------------------------------------------------------------------------
   14. Card 3D Tilt Micro-Interaction
   -------------------------------------------------------------------------- */
function initCardTilt() {
  const tiltCards = document.querySelectorAll('[data-tilt], .clean-project-card');
  if (!window.matchMedia('(pointer: fine)').matches) return;

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(750px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(750px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* --------------------------------------------------------------------------
   15. Toast Notifications Utility
   -------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const iconSvg =
    type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }, 3000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

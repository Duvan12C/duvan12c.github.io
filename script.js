/* ==========================================================================
   STATE & VARIABLES
   ========================================================================== */
const targetDate = new Date("2026-07-25T17:00:00").getTime();
let activeSlideIndex = 0;
const totalSlides = 4; // Slides 1 to 4
let musicStarted = false;
let touchStartX = 0;
let touchStartY = 0;
let touchStartSlide = 0;
let isTouchingSlider = false;

// DOM Elements
const envelope = document.getElementById("envelope");
const waxSeal = document.getElementById("wax-seal");
const envelopeWrapper = document.getElementById("envelope-wrapper");
const invitationContainer = document.getElementById("invitation-container");
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const sliderTrack = document.getElementById("slider-track");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const dots = document.querySelectorAll(".dot");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");

/* ==========================================================================
   1. WEB AUDIO API SYNTHESIZER: PAPER RUSTLE SOUND
   ========================================================================== */
function playPaperSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Generate a 0.5s white noise buffer
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        // Bandpass filter to sculpt the sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
        filter.Q.value = 2.5;
        
        // Volume envelope (quick attack, long smooth decay)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45); // Decay
        
        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noiseNode.start();
    } catch (e) {
        console.warn("Web Audio sound blocked or unsupported:", e);
    }
}

/* ==========================================================================
   2. ENVELOPE INTERACTION (OPEN ACTION)
   ========================================================================== */
waxSeal.addEventListener("click", () => {
    // 1. Play paper rustling synthesized sound
    playPaperSound();
    
    // 2. Open envelope flaps
    envelope.classList.add("open");
    
    // 3. Start background music (user action allows autoplay)
    startMusic();
    
    // 4. Transition to invitation slider
    setTimeout(() => {
        envelopeWrapper.classList.add("fade-out");
        invitationContainer.classList.remove("hidden");
        musicToggle.classList.remove("hidden");
        
        // Force slide-1 animations to trigger
        document.getElementById("slide-1").classList.add("active");
        
        // Delete envelope DOM after fade-out completes
        setTimeout(() => {
            envelopeWrapper.style.display = "none";
        }, 1000);
    }, 1500);
});

/* ==========================================================================
   3. BACKGROUND MUSIC CONTROLLER
   ========================================================================== */
function startMusic() {
    if (musicStarted) return;
    
    bgMusic.volume = 0.5; // Set comfortable volume
    bgMusic.play()
        .then(() => {
            musicStarted = true;
            musicToggle.classList.add("playing");
        })
        .catch(err => {
            console.log("Music play was prevented, waiting for user click.", err);
        });
}

musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.classList.add("playing");
    } else {
        bgMusic.pause();
        musicToggle.classList.remove("playing");
    }
});

/* ==========================================================================
   4. DYNAMIC BRISA TROPICAL (FALLING LEAVES AND FLOWERS)
   ========================================================================== */
function createFallingLeaf() {
    const container = document.getElementById("falling-leaves-container");
    if (!container) return;
    
    // Limit active items to maintain smooth 60fps performance on mobile
    if (container.querySelectorAll(".falling-item").length > 15) return;
    
    const leaf = document.createElement("div");
    
    // Randomize leaf types: 0 (magenta hibiscus), 1 (pink hibiscus), 2 (orange palm leaf)
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
        leaf.className = "falling-item hibiscus";
    } else if (type === 1) {
        leaf.className = "falling-item hibiscus-pink";
    } else {
        leaf.className = "falling-item palm-leaf";
    }
    
    // Random starting horizontal position
    const startX = Math.random() * 100;
    leaf.style.left = `${startX}vw`;
    
    // Random scale size (0.5x to 1.1x)
    const scale = Math.random() * 0.6 + 0.5;
    leaf.style.transform = `scale(${scale})`;
    
    // Random animation speed (6s to 12s)
    const duration = Math.random() * 6 + 6;
    leaf.style.animationDuration = `${duration}s`;
    
    container.appendChild(leaf);
    
    // Clean up DOM elements after animation completes
    setTimeout(() => {
        leaf.remove();
    }, duration * 1000);
}

// Spawn falling elements every 800ms
setInterval(createFallingLeaf, 800);

/* ==========================================================================
   5. SPARKLES DYNAMIC EMITTER (GLITTER EFFECT)
   ========================================================================== */
function createSparkle() {
    const container = document.getElementById("bg-effects-container");
    if (!container) return;
    
    // Limit maximum sparkles to avoid performance lags
    if (container.querySelectorAll(".sparkle-star").length > 20) return;
    
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle-star";
    
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    sparkle.style.left = `${posX}%`;
    sparkle.style.top = `${posY}%`;
    
    const size = Math.random() * 10 + 6; // 6px to 16px
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    const duration = Math.random() * 3 + 2; // 2s to 5s
    sparkle.style.animationDuration = `${duration}s`;
    
    container.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, duration * 1000);
}

// Spawn sparkles every 500ms
setInterval(createSparkle, 500);

/* ==========================================================================
   6. COUNTDOWN TIMER LOGIC
   ========================================================================== */
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
        document.getElementById("countdown-timer").innerHTML = "<div class='time-block' style='width: 100%; padding: 15px;'><span class='time-num'>¡ES HOY!</span></div>";
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Format digits to always show double numbers (e.g. 09)
    cdDays.innerText = String(days).padStart(2, '0');
    cdHours.innerText = String(hours).padStart(2, '0');
    cdMinutes.innerText = String(minutes).padStart(2, '0');
    cdSeconds.innerText = String(seconds).padStart(2, '0');
}

// Initial run and repeat every second
updateCountdown();
setInterval(updateCountdown, 1000);

/* ==========================================================================
   7. CUSTOM TOUCH SLIDER & SCROLL SNAPPING CONTROLS
   ========================================================================== */
function updateActiveDot(slideIndex) {
    dots.forEach((dot, idx) => {
        if (idx === slideIndex) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
    
    // Highlight arrows accordingly
    if (slideIndex === 0) {
        prevBtn.style.opacity = "0.3";
        prevBtn.style.pointerEvents = "none";
    } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
    }
    
    if (slideIndex === totalSlides - 1) {
        nextBtn.style.opacity = "0.3";
        nextBtn.style.pointerEvents = "none";
    } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
    }

    // Toggle slide classes for content animations
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide, idx) => {
        if (idx === slideIndex) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    });
}

// Sync active dot on scrolling
sliderTrack.addEventListener("scroll", () => {
    const width = sliderTrack.clientWidth;
    const scrollLeft = sliderTrack.scrollLeft;
    // Calculate current slide with rounding to handle floating point widths
    const currentSlide = Math.round(scrollLeft / width);
    
    if (currentSlide !== activeSlideIndex) {
        activeSlideIndex = currentSlide;
        updateActiveDot(activeSlideIndex);
    }
});

// Arrow Navigation Click Handlers
nextBtn.addEventListener("click", () => {
    if (activeSlideIndex < totalSlides - 1) {
        activeSlideIndex++;
        scrollToSlide(activeSlideIndex);
    }
});

prevBtn.addEventListener("click", () => {
    if (activeSlideIndex > 0) {
        activeSlideIndex--;
        scrollToSlide(activeSlideIndex);
    }
});

// Dot Indicator Click Handlers
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        activeSlideIndex = index;
        scrollToSlide(activeSlideIndex);
    });
});

function scrollToSlide(index) {
    const width = sliderTrack.clientWidth;
    const nextIndex = Math.max(0, Math.min(totalSlides - 1, index));
    activeSlideIndex = nextIndex;
    sliderTrack.scrollTo({
        left: nextIndex * width,
        behavior: 'smooth'
    });
    updateActiveDot(nextIndex);
}

sliderTrack.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartSlide = activeSlideIndex;
    isTouchingSlider = true;
}, { passive: true });

sliderTrack.addEventListener("touchend", (e) => {
    if (!isTouchingSlider || e.changedTouches.length !== 1) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minSwipeDistance = 45;

    isTouchingSlider = false;

    if (absY > absX || absX < minSwipeDistance) {
        scrollToSlide(touchStartSlide);
        return;
    }

    if (deltaX < 0) {
        scrollToSlide(touchStartSlide + 1);
    } else {
        scrollToSlide(touchStartSlide - 1);
    }
}, { passive: true });

sliderTrack.addEventListener("touchcancel", () => {
    isTouchingSlider = false;
}, { passive: true });

// Ensure proper slide sizing on resize
window.addEventListener("resize", () => {
    scrollToSlide(activeSlideIndex);
});

// Initial dot update
updateActiveDot(0);

/* ==========================================================================
   8. LIGHTBOX MODAL FOR DRESS CODE COLLAGES
   ========================================================================== */
function openLightbox(src, alt) {
    lightbox.style.display = "block";
    lightboxImg.src = src;
    lightboxCaption.innerText = alt;
}

function closeLightbox() {
    lightbox.style.display = "none";
}

// Close lightbox on escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeLightbox();
    }
});

// Expose lightbox functions globally for inline HTML click calls
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

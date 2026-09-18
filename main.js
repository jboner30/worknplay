const container = document.querySelector('.fireworks-container');

let isMouseDown = false;
let pulseInterval = null;
let currentMouseX = 0;
let currentMouseY = 0;

// Color palette for multi-color pulses
const colors = [
    { h: 0, s: 100 },    // Red
    { h: 30, s: 100 },   // Orange
    { h: 60, s: 100 },   // Yellow
    { h: 120, s: 100 },  // Green
    { h: 180, s: 100 },  // Cyan
    { h: 240, s: 100 },  // Blue
    { h: 270, s: 100 },  // Purple
];

// Create a ringed pulse effect
function createPulse(x, y) {
    // Pick a random color from the palette
    const colorObj = colors[Math.floor(Math.random() * colors.length)];
    const hue = colorObj.h;
    const saturation = colorObj.s;
    
    // Number of particles in the ring - create a full circle
    const particleCount = 32;
    
    // Create particles in a ring formation
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework');
        
        // Evenly distributed angles around a ring
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 100;
        
        // Initial position is slightly offset from the origin
        const initialX = Math.cos(angle) * 5;
        const initialY = Math.sin(angle) * 5;
        
        // Final position (the ring)
        const tx = Math.cos(angle) * distance - initialX;
        const ty = Math.sin(angle) * distance - initialY;
        
        // Color with good lightness for visibility
        const lightness = 50 + Math.random() * 20;
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        particle.style.left = (x + initialX) + 'px';
        particle.style.top = (y + initialY) + 'px';
        particle.style.backgroundColor = color;
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.boxShadow = `0 0 8px ${color}`;
        
        // Animation duration for the pulse - slower and calmer
        const duration = 1.2;
        particle.style.animationDuration = duration + 's';
        
        container.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
}

// Mouse down - start the pulse interval
document.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    
    // Create initial pulse immediately
    createPulse(currentMouseX, currentMouseY);
    
    // Set up interval for subsequent pulses every 750ms
    pulseInterval = setInterval(() => {
        if (isMouseDown) {
            createPulse(currentMouseX, currentMouseY);
        }
    }, 750);
});

// Mouse move - update position
document.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;
    }
});

// Mouse up - stop the pulses
document.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
    }
});

// Optional: Touch support for mobile
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    isMouseDown = true;
    currentMouseX = touch.clientX;
    currentMouseY = touch.clientY;
    
    createPulse(currentMouseX, currentMouseY);
    
    pulseInterval = setInterval(() => {
        if (isMouseDown) {
            createPulse(currentMouseX, currentMouseY);
        }
    }, 750);
});

document.addEventListener('touchmove', (e) => {
    if (isMouseDown && e.touches.length > 0) {
        const touch = e.touches[0];
        currentMouseX = touch.clientX;
        currentMouseY = touch.clientY;
    }
});

document.addEventListener('touchend', () => {
    isMouseDown = false;
    if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
    }
});

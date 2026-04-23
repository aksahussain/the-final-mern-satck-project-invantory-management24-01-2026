import React, { useEffect, useRef } from 'react';

const MagicCursor = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
            // Add more particles for a denser trail
            for (let i = 0; i < 4; i++) {
                particles.current.push(new Particle(e.clientX, e.clientY));
            }
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 4 + 2; // Smaller particles
                this.speedX = (Math.random() - 0.5) * 3;
                this.speedY = (Math.random() - 0.5) * 3;
                // Vibrant blue range matching theme (approx hue 210-230)
                const hue = 210 + Math.random() * 20;
                this.color = `hsla(${hue}, 100%, 65%, 1)`;
                this.life = 1;
                this.decay = Math.random() * 0.03 + 0.02;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.2) this.size -= 0.1;
                this.life -= this.decay;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;

                // Add subtle glow effect
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Subtle radial glow at cursor matching theme blue
            const gradient = ctx.createRadialGradient(
                mouse.current.x, mouse.current.y, 0,
                mouse.current.x, mouse.current.y, 80 // Smaller glow radius
            );
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // Blue 500
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.current.length; i++) {
                particles.current[i].update();
                particles.current[i].draw();

                if (particles.current[i].life <= 0) {
                    particles.current.splice(i, 1);
                    i--;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
            style={{ pointerEvents: 'none' }} // Ensure no clicks are blocked
        />
    );
};

export default MagicCursor;

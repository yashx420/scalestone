import React, { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './index.css';

const FRAME_COUNT = 240;

const currentFrame = (index) =>
  `/frames/frame_${index.toString().padStart(4, '0')}.jpg`;

const SECTIONS = [
  {
    id: 'input',
    start: 0.02,
    end: 0.15,
    position: 'right',
    headline: 'The Chaos of Choice.',
    body: 'In a market saturated with fragmented vendors and legacy debt, the path forward is often obscured by noise. For US businesses, finding the right APAC partner should not feel like a shot in the dark.',
    clarity: 'We enter the void to identify the signal within the noise.',
  },
  {
    id: 'crystallization',
    start: 0.20,
    end: 0.36,
    position: 'bottom-left',
    headline: 'Engineering Certainty.',
    body: "Scalestone is the filter. We don't just find vendors; we crystallize your requirements into a high-performance roadmap. We vet the elite 1% of technical talent so your strategy has a solid foundation.",
    clarity: 'Turning scattered potential into structural strength.',
  },
  {
    id: 'refraction',
    start: 0.42,
    end: 0.58,
    position: 'top-left',
    headline: 'One Vision. Four Directions.',
    body: 'Our expertise refracts your singular goal into specialized workstreams. From high-level Strategy and precision Vetting to cross-border Scaling and final Delivery.',
    clarity: 'Complexity, refined into a spectrum of action.',
  },
  {
    id: 'extension',
    start: 0.62,
    end: 0.76,
    position: 'bottom-left',
    headline: 'Beyond the Horizon.',
    body: 'Transformation is a trajectory, not a destination. We provide the ongoing momentum needed to modernize legacy systems and dominate the US-APAC corridor.',
    clarity: 'Your growth, clearly defined and infinitely scalable.',
  },
  {
    id: 'hook',
    start: 0.84,
    end: 1.0,
    position: 'top-center-hero',
    headline: 'The journey begins now.',
    body: 'We are currently architecting a closed-loop marketplace featuring 1,000+ curated vendor intelligence profiles.',
    clarity: null,
    brandCenter: 'SCALESTONE',
  },
];

function App() {
  const canvasRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [introStage, setIntroStage] = useState(0); // 0 loading, 1 wordmark hold, 2 entered
  const [scrollFraction, setScrollFraction] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(0);

  const scrollTargetRef = useRef(0);
  const displayedFracRef = useRef(0);
  const velocityRef = useRef(0);
  const renderedFracRef = useRef(0);
  const renderedVelRef = useRef(0);
  const lenisRef = useRef(null);

  useEffect(() => {
    const loadedImages = [];
    let loadCounter = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadCounter++;
        setLoaded(loadCounter);
        if (loadCounter === FRAME_COUNT) setIsReady(true);
      };
      img.onerror = () => {
        loadCounter++;
        setLoaded(loadCounter);
        if (loadCounter === FRAME_COUNT) setIsReady(true);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 28,
        y: (e.clientY / window.innerHeight - 0.5) * 28,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let hovering = false;
    let rafId;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const onOver = (e) => {
      const el = e.target;
      hovering = !!(el && (el.closest('a') || el.closest('button') || el.closest('[data-cursor-hover]')));
    };
    const onLeave = () => { hovering = false; };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      const size = hovering ? 60 : 36;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.width = `${size}px`;
        cursorRingRef.current.style.height = `${size}px`;
        cursorRingRef.current.style.transform = `translate3d(${ring.x - size / 2}px, ${ring.y - size / 2}px, 0)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${target.x - 2}px, ${target.y - 2}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenis.stop(); // unlocked once intro completes
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Intro stage progression: loading -> wordmark hold -> entered.
  useEffect(() => {
    if (!isReady) return;
    const t = setTimeout(() => setIntroStage(1), 380);
    return () => clearTimeout(t);
  }, [isReady]);

  useEffect(() => {
    if (introStage !== 1) return;
    const t = setTimeout(() => setIntroStage(2), 1700);
    return () => clearTimeout(t);
  }, [introStage]);

  useEffect(() => {
    if (introStage === 2 && lenisRef.current) {
      lenisRef.current.start();
    }
  }, [introStage]);

  useEffect(() => {
    if (!isReady || images.length === 0) return;

    const glCanvas = canvasRef.current;
    const gl = glCanvas.getContext('webgl', {
      alpha: false,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      // WebGL unavailable: fall back to plain 2D path (no aberration).
      return;
    }

    // Offscreen 2D canvas: existing frame/mask draw logic targets this, and
    // the WebGL pass uses it as a texture source each frame.
    const offCanvas = document.createElement('canvas');
    const context = offCanvas.getContext('2d');

    const vsSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;
    // Radial chromatic aberration: R sampled inward, B outward, intensity
    // scales with scroll velocity and grows toward the edges. A faint
    // cool sheen tints highlights along the aberration direction.
    const fsSrc = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_tex;
      uniform float u_aberration;
      void main() {
        vec2 uv = v_uv;
        vec2 d = uv - 0.5;
        float r = length(d);
        vec2 dir = r > 0.0001 ? d / r : vec2(0.0);
        float a = u_aberration * (0.35 + r * 1.7);
        vec3 col;
        col.r = texture2D(u_tex, uv - dir * a * 0.012).r;
        col.g = texture2D(u_tex, uv).g;
        col.b = texture2D(u_tex, uv + dir * a * 0.012).b;
        float lum = max(max(col.r, col.g), col.b);
        float sheen = smoothstep(0.55, 1.0, lum) * a * 0.18;
        col += sheen * vec3(0.08, 0.14, 0.32);
        gl_FragColor = vec4(col, 1.0);
      }
    `;
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('shader compile', gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    const uAberration = gl.getUniformLocation(program, 'u_aberration');
    const uTex = gl.getUniformLocation(program, 'u_tex');

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,  1, 1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(uTex, 0);

    const setCanvasSize = () => {
      glCanvas.width = window.innerWidth;
      glCanvas.height = window.innerHeight;
      offCanvas.width = window.innerWidth;
      offCanvas.height = window.innerHeight;
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    };

    const renderImage = (index) => {
      const img = images[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const imgRatio = img.width / img.height;
      const canvasRatio = offCanvas.width / offCanvas.height;
      let rw, rh, x, y;
      const horizontalShift = 0.032;

      if (canvasRatio > imgRatio) {
        rw = offCanvas.width * 1.12;
        rh = rw / imgRatio;
        x = (offCanvas.width - rw) / 2 - (rw * horizontalShift);
        y = (offCanvas.height - rh) / 2;
      } else {
        rh = offCanvas.height;
        rw = offCanvas.height * imgRatio;
        x = (offCanvas.width - rw) / 2 - (rw * horizontalShift);
        y = 0;
      }

      context.clearRect(0, 0, offCanvas.width, offCanvas.height);
      context.drawImage(img, x, y, rw, rh);

      let maskAmt = 0;
      if (index < FRAME_COUNT * 0.15) {
        maskAmt = 1 - (index / (FRAME_COUNT * 0.15));
      } else if (index > FRAME_COUNT * 0.8) {
        maskAmt = (index - FRAME_COUNT * 0.8) / (FRAME_COUNT * 0.2);
      }
      if (maskAmt > 0) {
        const maskHeight = offCanvas.height * 0.12 * maskAmt;
        context.fillStyle = '#030303';
        context.fillRect(0, 0, offCanvas.width, maskHeight);
        const grad = context.createLinearGradient(0, maskHeight - 20, 0, maskHeight + 40);
        grad.addColorStop(0, '#030303');
        grad.addColorStop(1, 'transparent');
        context.fillStyle = grad;
        context.fillRect(0, maskHeight - 20, offCanvas.width, 60);
      }
    };

    const renderGL = (vel) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, offCanvas);
      // Base offset keeps a soft cinematic fringe even at rest; velocity
      // multiplier amplifies it sharply during scroll.
      const aberration = Math.min(1.4, 0.05 + Math.abs(vel) * 55);
      gl.uniform1f(uAberration, aberration);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let animId;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTargetRef.current = maxScroll > 0 ? scrollTop / maxScroll : 0;
    };

    const LERP = 0.14;

    const tick = () => {
      const prev = displayedFracRef.current;
      displayedFracRef.current += (scrollTargetRef.current - prev) * LERP;
      const frac = displayedFracRef.current;
      const vel = frac - prev;
      velocityRef.current = vel;

      const frameIndex = Math.floor(frac * (FRAME_COUNT - 1));
      renderImage(Math.min(FRAME_COUNT - 1, Math.max(0, frameIndex)));
      renderGL(vel);

      if (
        Math.abs(frac - renderedFracRef.current) > 0.0003 ||
        Math.abs(vel - renderedVelRef.current) > 0.0003
      ) {
        renderedFracRef.current = frac;
        renderedVelRef.current = vel;
        setScrollFraction(frac);
        setVelocity(vel);
      }

      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
      gl.deleteTexture(texture);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [isReady, images]);

  const getOpacity = useCallback(
    (start, end) => {
      const fadeIn = 0.04;
      const fadeOut = 0.04;
      if (end >= 0.99 && scrollFraction >= end) return 1;
      if (scrollFraction < start - fadeIn || scrollFraction > end + fadeOut) return 0;
      if (scrollFraction < start) return (scrollFraction - (start - fadeIn)) / fadeIn;
      if (scrollFraction > end) return 1 - (scrollFraction - end) / fadeOut;
      return 1;
    },
    [scrollFraction],
  );

  const getSectionProgress = useCallback(
    (start, end) => {
      if (scrollFraction < start) return 0;
      if (scrollFraction >= end) return 1;
      return (scrollFraction - start) / (end - start);
    },
    [scrollFraction],
  );

  const loadPercent = Math.round((loaded / FRAME_COUNT) * 100);

  const currentSectionIdx = (() => {
    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      if (scrollFraction >= SECTIONS[i].start - 0.04) return i;
    }
    return 0;
  })();
  const currentSection = SECTIONS[currentSectionIdx];
  const sectionLabels = {
    input: 'The Void',
    crystallization: 'The Filter',
    refraction: 'The Spectrum',
    extension: 'The Horizon',
    hook: 'The Threshold',
  };

  return (
    <>
      <div ref={cursorRingRef} className="cursor-ring" aria-hidden="true" />
      <div ref={cursorDotRef} className="cursor-dot" aria-hidden="true" />

      {introStage < 2 && (
        <div className={`intro-overlay intro-stage-${introStage}`}>
          <div className="intro-stack">
            <span className="intro-eyebrow">A Vendor Intelligence Engine</span>
            <h1 className="intro-wordmark">
              <span>S</span><span>c</span><span>a</span><span>l</span><span>e</span><span>s</span><span>t</span><span>o</span><span>n</span><span>e</span><span className="intro-period">.</span>
            </h1>
            <div className="intro-rule">
              <span className="intro-rule-fill" style={{ transform: `scaleX(${introStage === 0 ? loadPercent / 100 : 1})` }} />
            </div>
            <div className="intro-meta">
              <span className="intro-meter">
                {introStage === 0 ? (
                  <>
                    <span className="intro-meter-label">Loading Frames</span>
                    <span className="intro-meter-value">{String(loadPercent).padStart(3, '0')}<i>%</i></span>
                  </>
                ) : (
                  <span className="intro-enter">Entering experience</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="canvas-container">
        <canvas ref={canvasRef} />
        <div className="vignette" />
        <div className="grain" style={{ opacity: 0.03 + Math.abs(velocity) * 0.15 }} />
      </div>

      <div className="scroll-progress" style={{ transform: `scaleX(${scrollFraction})` }} />

      {isReady && (
        <div className="section-indicator" style={{ opacity: scrollFraction < 0.015 ? 0 : 1 }}>
          <span className="si-index">{String(currentSectionIdx + 1).padStart(2, '0')}</span>
          <span className="si-divider" />
          <span className="si-total">{String(SECTIONS.length).padStart(2, '0')}</span>
          <span className="si-name">{sectionLabels[currentSection.id] || ''}</span>
        </div>
      )}

      <div className="text-overlay">
        {SECTIONS.map((s) => {
          const opacity = getOpacity(s.start, s.end);
          if (opacity <= 0) return null;

          const progress = getSectionProgress(s.start, s.end);
          const headlineOpacity = Math.min(1, opacity * 2);
          const bodyOpacity = Math.min(1, Math.max(0, (progress - 0.1) * 3) * opacity);
          const clarityOpacity = Math.min(1, Math.max(0, (progress - 0.25) * 2.5) * opacity);
          
          const brandOpacity = Math.min(1, Math.max(0, (progress - 0.3) * 3)) * opacity;

          const slideDistance = 90;
          const slideMap = {
            'right':           { x:  slideDistance, y: 0,                  rot: -4, base: 'translate(0, -50%)' },
            'left':            { x: -slideDistance, y: 0,                  rot:  4, base: 'translate(0, 0)' },
            'top-left':        { x: -slideDistance, y: -slideDistance,     rot:  5, base: 'translate(0, 0)' },
            'bottom-left':     { x: -slideDistance, y:  slideDistance,     rot: -5, base: 'translate(0, 0)' },
            'top-center-hero': { x: 0,              y: -slideDistance / 2, rot:  0, base: 'translate(-50%, 0)' },
            'center':          { x: 0,              y:  slideDistance,     rot:  0, base: 'translate(-50%, -50%)' },
          };
          const posConfig = slideMap[s.position] || { x: 0, y: 0, rot: 0, base: 'translate(0,0)' };
          const inv = 1 - opacity;
          const px = posConfig.x * inv + mousePos.x;
          const py = posConfig.y * inv + mousePos.y;
          const rotZ = posConfig.rot * inv;
          const blockBlur = inv * 12;

          const brandInv = 1 - brandOpacity;
          const brandScale = 0.55 + brandOpacity * 0.55;
          const brandRotateX = brandInv * 38;
          const brandBlur = brandInv * 30;
          const brandLetterSpacing = 0.04 + brandInv * 0.28;

          return (
            <React.Fragment key={s.id}>
              {s.brandCenter && (
                <div
                  className="brand-center-focus"
                  style={{
                    opacity: brandOpacity * 0.9,
                    transform: `translateX(-50%) scale(${brandScale}) rotateX(${brandRotateX}deg)`,
                    filter: brandBlur > 0.3 ? `blur(${brandBlur}px)` : 'none',
                    letterSpacing: `${brandLetterSpacing}em`,
                  }}
                >
                  {s.brandCenter}
                </div>
              )}

              <div
                className={`section-block section-${s.position}`}
                style={{
                  opacity: headlineOpacity,
                  transform: `${posConfig.base} translate3d(${px}px, ${py}px, 0) rotate(${rotZ}deg)`,
                  filter: blockBlur > 0.3 ? `blur(${blockBlur}px)` : 'none',
                }}
              >
                {s.company && (
                  <div className="company-name">{s.company}</div>
                )}

                <div className="accent-line" style={{ transform: `scaleX(${Math.min(1, progress * 3)})` }} />

                <h1 className="section-headline">
                  {(() => {
                    let ci = 0;
                    return s.headline.split(' ').map((word, wi) => {
                      const node = (
                        <span className="word-reveal" key={wi}>
                          {[...word].map((ch, k) => {
                            const my = ci++;
                            const p = Math.min(1, Math.max(0, (progress - my * 0.012) * 7));
                            const iv = 1 - p;
                            return (
                              <span
                                key={k}
                                className="char-reveal"
                                style={{
                                  opacity: p,
                                  transform: `translate3d(0, ${iv * 60}px, 0) rotateX(${iv * -85}deg) scale(${0.6 + p * 0.4})`,
                                }}
                              >
                                {ch}
                              </span>
                            );
                          })}
                        </span>
                      );
                      ci++;
                      return (
                        <React.Fragment key={wi}>
                          {node}
                          <span>&nbsp;</span>
                        </React.Fragment>
                      );
                    });
                  })()}
                </h1>

                <p
                  className="section-body"
                  style={{
                    opacity: bodyOpacity,
                    transform: `translate3d(0, ${(1 - bodyOpacity) * 28}px, 0) skewX(${(1 - bodyOpacity) * -3}deg)`,
                    filter: bodyOpacity < 0.95 ? `blur(${(1 - bodyOpacity) * 9}px)` : 'none',
                  }}
                >
                  {s.body}
                </p>

                {s.clarity && (
                  <span
                    className="section-clarity"
                    style={{
                      opacity: clarityOpacity,
                      transform: `translate3d(0, ${(1 - clarityOpacity) * 14}px, 0)`,
                      letterSpacing: `${0.42 + (1 - clarityOpacity) * 0.9}em`,
                    }}
                  >
                    {s.clarity}
                  </span>
                )}

                {s.id === 'hook' && (
                  <a
                    href="mailto:tech@kevnit.com?subject=Scalestone%20%E2%80%94%20Begin%20a%20conversation"
                    className="cta-button"
                    data-cursor-hover
                    style={{
                      opacity: clarityOpacity,
                      transform: `translate3d(0, ${(1 - clarityOpacity) * 24}px, 0)`,
                      pointerEvents: clarityOpacity > 0.8 ? 'auto' : 'none',
                    }}
                  >
                    <span className="cta-label">Begin a conversation</span>
                    <span className="cta-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 12" fill="none">
                        <path d="M0 6 H22 M16 1 L22 6 L16 11" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </span>
                  </a>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="scroll-content" style={{ height: '1400vh' }}></div>
      
      {scrollFraction < 0.02 && isReady && (
        <div className="scroll-hint">
          <div className="mouse-icon">
            <div className="wheel" />
          </div>
          <span>Accelerate Scalestone</span>
        </div>
      )}
    </>
  );
}

export default App;

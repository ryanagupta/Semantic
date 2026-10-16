import { useEffect } from 'react';
import Lenis from 'lenis';
import GradientASCII from './GradientASCII';

export function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="min-h-[200vh] w-full bg-white">
      {/* Native GPU-Accelerated SVG Optical Filters for Progressive Glass Refraction & Dispersion */}
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          {/* Main Glass Body: Smooth long-wavelength lens refraction + RGB chromatic dispersion + vertical bloom */}
          <filter
            id="glass-body-refraction"
            x="-10%"
            y="-30%"
            width="120%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.002 0.014"
              numOctaves={1}
              seed={4}
              result="rawLens"
            />
            <feGaussianBlur in="rawLens" stdDeviation="14" result="smoothLens" />
            <feComponentTransfer in="smoothLens" result="lensField">
              <feFuncR type="linear" slope={2.2} intercept={-0.6} />
              <feFuncG type="linear" slope={2.8} intercept={-0.9} />
            </feComponentTransfer>

            {/* Displace Red, Green, Blue channels at slightly different refractive indices */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="lensField"
              scale={22}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispR"
            />
            <feColorMatrix
              in="dispR"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="rChan"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="lensField"
              scale={30}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispG"
            />
            <feColorMatrix
              in="dispG"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="gChan"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="lensField"
              scale={38}
              xChannelSelector="R"
              yChannelSelector="G"
              result="dispB"
            />
            <feColorMatrix
              in="dispB"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="bChan"
            />

            <feBlend in="rChan" in2="gChan" mode="screen" result="rgChan" />
            <feBlend in="rgChan" in2="bChan" mode="screen" result="refractedRGB" />

            {/* Anisotropic vertical/horizontal diffusion matching the TwelveLabs soft vertical glass stretch */}
            <feGaussianBlur in="refractedRGB" stdDeviation="6 14" result="diffusedGlass" />
          </filter>

          {/* Lower Meniscus Zone: Stretches and bends background elements as they cross into the bottom of the navbar */}
          <filter
            id="glass-edge-meniscus"
            x="-10%"
            y="-30%"
            width="120%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.0025 0.02"
              numOctaves={1}
              seed={9}
              result="edgeRaw"
            />
            <feGaussianBlur in="edgeRaw" stdDeviation="12" result="edgeSmooth" />
            <feComponentTransfer in="edgeSmooth" result="edgeField">
              <feFuncR type="linear" slope={1.8} intercept={-0.4} />
              <feFuncG type="linear" slope={3.2} intercept={-1.1} />
            </feComponentTransfer>

            <feDisplacementMap
              in="SourceGraphic"
              in2="edgeField"
              scale={28}
              xChannelSelector="R"
              yChannelSelector="G"
              result="edgeR"
            />
            <feColorMatrix
              in="edgeR"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="edgeRChan"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="edgeField"
              scale={36}
              xChannelSelector="R"
              yChannelSelector="G"
              result="edgeG"
            />
            <feColorMatrix
              in="edgeG"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="edgeGChan"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="edgeField"
              scale={44}
              xChannelSelector="R"
              yChannelSelector="G"
              result="edgeB"
            />
            <feColorMatrix
              in="edgeB"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="edgeBChan"
            />

            <feBlend in="edgeRChan" in2="edgeGChan" mode="screen" result="edgeRG" />
            <feBlend in="edgeRG" in2="edgeBChan" mode="screen" result="edgeRGB" />
            <feGaussianBlur in="edgeRGB" stdDeviation="3 10" />
          </filter>
        </defs>
      </svg>

      {/* Full-width seamless progressive glass navbar matching the TwelveLabs distortion */}
      <header className="real-glass-navbar">
        <div className="real-glass-layer-meniscus" />
        <div className="real-glass-layer-refract" />
        <div className="real-glass-layer-deep" />
      </header>

      <section
        style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#000000' }}
      >
        <GradientASCII
          key="hero-gradient-ascii"
          colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
        />
      </section>
    </main>
  );
}

export default App;

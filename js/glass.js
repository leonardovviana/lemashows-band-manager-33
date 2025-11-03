// glass.js

(function () {
    const STYLE_ID = 'lg-stylesheet-v1';
    const GOO_SVG_ID = 'lg-goo-filter-v1';

    function ensureStyles(opts = {}) {
        if (document.getElementById(STYLE_ID)) return;

        const noiseSvg =
            encodeURIComponent(
                "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch' /></filter><rect width='100%' height='100%' filter='url(#n)' /></svg>"
            );

        const css = `
:root {
    --lg-blur: 16px;
    --lg-radius: 16px;
    --lg-bg1: rgba(255,255,255,0.20);
    --lg-bg2: rgba(255,255,255,0.06);
    --lg-border: rgba(255,255,255,0.28);
    --lg-shadow-outer: rgba(0,0,0,0.28);
    --lg-shadow-inner: rgba(255,255,255,0.14);
    --lg-noise-opacity: 0.06;
}
.liquid-glass {
    position: relative;
    border-radius: var(--lg-radius);
    background: linear-gradient(135deg, var(--lg-bg1), var(--lg-bg2));
    backdrop-filter: blur(var(--lg-blur));
    -webkit-backdrop-filter: blur(var(--lg-blur));
    border: 1px solid var(--lg-border);
    overflow: hidden;
    box-shadow:
        inset 0 1px 0 var(--lg-shadow-inner),
        0 12px 30px var(--lg-shadow-outer);
    will-change: transform, filter;
    transform: translateZ(0);
}
.liquid-glass::before {
    content: "";
    position: absolute;
    inset: -1px;
    pointer-events: none;
    background:
        radial-gradient(120px 80px at 15% 10%, rgba(255,255,255,0.45), rgba(255,255,255,0) 60%),
        radial-gradient(200px 140px at 85% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 55%),
        radial-gradient(220px 180px at 50% 120%, rgba(255,255,255,0.06), rgba(255,255,255,0) 60%);
    mix-blend-mode: screen;
}
.liquid-glass::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: var(--lg-noise-opacity);
    background-image: url("data:image/svg+xml;utf8,${noiseSvg}");
    background-size: 140px 140px;
    mix-blend-mode: overlay;
}
.liquid-glass--hover {
    transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
}
.liquid-glass--hover:hover {
    transform: translateY(-1px);
    box-shadow:
        inset 0 1px 0 var(--lg-shadow-inner),
        0 16px 40px rgba(0,0,0,0.35);
}
.liquid-glass--animated::before {
    animation: lgFloat 8s ease-in-out infinite;
}
@keyframes lgFloat {
    0%   { transform: translate3d(0,0,0) scale(1);   opacity: 0.95; }
    50%  { transform: translate3d(0,-2px,0) scale(1.01); opacity: 1; }
    100% { transform: translate3d(0,0,0) scale(1);   opacity: 0.95; }
}
        `.trim();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Opcional: insere um filtro SVG "gooey" para experimentar fusão suave entre formas.
    // Observação: aplicar o filtro no container pode afetar textos/imagens. Use com moderação.
    function ensureGooFilter() {
        if (document.getElementById(GOO_SVG_ID)) return;
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';
        svg.style.left = '-9999px';
        svg.style.top = '-9999px';
        svg.id = GOO_SVG_ID;

        const filter = document.createElementNS(svgNS, 'filter');
        filter.setAttribute('id', 'lg-goo');
        filter.setAttribute('color-interpolation-filters', 'sRGB');

        const blur = document.createElementNS(svgNS, 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        blur.setAttribute('stdDeviation', '8');

        const matrix = document.createElementNS(svgNS, 'feColorMatrix');
        matrix.setAttribute('mode', 'matrix');
        // Threshold para "gooey" (valores > 1 deixam só áreas mais densas)
        matrix.setAttribute('values', `
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 20 -10
        `.trim().replace(/\s+/g, ' '));

        const comp = document.createElementNS(svgNS, 'feComposite');
        comp.setAttribute('operator', 'atop');
        comp.setAttribute('in2', 'SourceGraphic');

        filter.appendChild(blur);
        filter.appendChild(matrix);
        filter.appendChild(comp);
        svg.appendChild(filter);
        document.body.appendChild(svg);
    }

    function toArray(nodesOrSelector) {
        if (!nodesOrSelector) return [];
        if (typeof nodesOrSelector === 'string') {
            return Array.from(document.querySelectorAll(nodesOrSelector));
        }
        if (nodesOrSelector instanceof Element) return [nodesOrSelector];
        if ('length' in nodesOrSelector) return Array.from(nodesOrSelector);
        return [];
    }

    // Aplica estilo "liquid glass" a elementos.
    // options:
    //  - blur: número (px)
    //  - radius: número (px)
    //  - hover: boolean (efeito hover)
    //  - animated: boolean (animação sutil do brilho)
    //  - theme: 'light' | 'dark' | { bg1, bg2, border, noiseOpacity }
    function applyLiquidGlass(nodesOrSelector, options = {}) {
        ensureStyles();

        const {
            blur = 18,
            radius = 16,
            hover = true,
            animated = false,
            theme = 'light',
        } = options;

        const palette =
            theme === 'dark'
                ? {
                        bg1: 'rgba(255,255,255,0.10)',
                        bg2: 'rgba(255,255,255,0.03)',
                        border: 'rgba(255,255,255,0.16)',
                        noiseOpacity: 0.05,
                    }
                : theme === 'light'
                ? {
                        bg1: 'rgba(255,255,255,0.22)',
                        bg2: 'rgba(255,255,255,0.06)',
                        border: 'rgba(255,255,255,0.28)',
                        noiseOpacity: 0.06,
                    }
                : {
                        bg1: theme.bg1 ?? 'rgba(255,255,255,0.20)',
                        bg2: theme.bg2 ?? 'rgba(255,255,255,0.06)',
                        border: theme.border ?? 'rgba(255,255,255,0.28)',
                        noiseOpacity: theme.noiseOpacity ?? 0.06,
                    };

        const els = toArray(nodesOrSelector);
        els.forEach((el) => {
            el.classList.add('liquid-glass');
            if (hover) el.classList.add('liquid-glass--hover');
            if (animated) el.classList.add('liquid-glass--animated');

            el.style.setProperty('--lg-blur', `${Math.max(0, Number(blur) || 0)}px`);
            el.style.setProperty('--lg-radius', `${Math.max(0, Number(radius) || 0)}px`);
            el.style.setProperty('--lg-bg1', palette.bg1);
            el.style.setProperty('--lg-bg2', palette.bg2);
            el.style.setProperty('--lg-border', palette.border);
            el.style.setProperty('--lg-noise-opacity', String(palette.noiseOpacity));
        });

        return els;
    }

    // Aplica um filtro "gooey" no container (experimental).
    // Observação importante:
    //  - Isso borra e faz threshold em TODO o conteúdo do container.
    //  - Prefira usar em um sub-container contendo APENAS os blocos de vidro.
    function enableGooey(container) {
        ensureStyles();
        ensureGooFilter();
        const el = toArray(container)[0];
        if (!el) return null;
        el.style.filter = 'url(#lg-goo)';
        return el;
    }

    // Remove o efeito aplicado.
    function reset(nodesOrSelector) {
        const els = toArray(nodesOrSelector);
        els.forEach((el) => {
            el.classList.remove('liquid-glass', 'liquid-glass--hover', 'liquid-glass--animated');
            el.style.removeProperty('--lg-blur');
            el.style.removeProperty('--lg-radius');
            el.style.removeProperty('--lg-bg1');
            el.style.removeProperty('--lg-bg2');
            el.style.removeProperty('--lg-border');
            el.style.removeProperty('--lg-noise-opacity');
            // Mantém outras propriedades do elemento intocadas
        });
        return els;
    }

    // API pública
    const api = {
        apply: applyLiquidGlass,
        enableGooey,
        reset,
    };

    // Exporta para browser (window) e CommonJS/ESM quando possível
    if (typeof window !== 'undefined') {
        window.LiquidGlass = api;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else if (typeof define === 'function' && define.amd) {
        define(function () { return api; });
    }
})();
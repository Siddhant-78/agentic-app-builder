'use client';

import * as React from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

type HoleBackgroundProps = React.ComponentProps<'div'> & {
  strokeColor?: string;
  numberOfLines?: number;
  numberOfDiscs?: number;
  particleRGBColor?: [number, number, number];
};

function HoleBackground({
  strokeColor = '#737373',
  numberOfLines = 50,
  numberOfDiscs = 50,
  particleRGBColor = [255, 255, 255],
  className,
  children,
  ...props
}: HoleBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = React.useRef<number>(0);

  const stateRef = React.useRef<any>({
    discs: [],
    lines: [],
    particles: [],
    clip: {},
    startDisc: {},
    endDisc: {},
    rect: {
      width: 0,
      height: 0,
    },
    render: {
      width: 0,
      height: 0,
      dpi: 1,
    },
    particleArea: {},
    linesCanvas: null,
  });

  const linear = (p: number) => p;

  const easeInExpo = (p: number) =>
    p === 0 ? 0 : Math.pow(2, 10 * (p - 1));

  const tweenValue = React.useCallback(
    (
      start: number,
      end: number,
      p: number,
      ease: 'inExpo' | null = null
    ) => {
      const delta = end - start;
      const easeFn = ease === 'inExpo' ? easeInExpo : linear;

      return start + delta * easeFn(p);
    },
    []
  );

  const tweenDisc = React.useCallback(
    (disc: any) => {
      const { startDisc, endDisc } = stateRef.current;

      if (!startDisc || !endDisc) return;

      disc.x = tweenValue(startDisc.x, endDisc.x, disc.p);
      disc.y = tweenValue(
        startDisc.y,
        endDisc.y,
        disc.p,
        'inExpo'
      );
      disc.w = tweenValue(startDisc.w, endDisc.w, disc.p);
      disc.h = tweenValue(startDisc.h, endDisc.h, disc.p);
    },
    [tweenValue]
  );

  /**
   * Set canvas size.
   *
   * Returns false if the canvas doesn't have a valid size yet.
   * This prevents creating a 0x0 offscreen canvas.
   */
  const setSize = React.useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return false;
    }

    const rect = canvas.getBoundingClientRect();

    // Important:
    // During the first render the parent can temporarily have
    // width/height of 0. Don't initialize the animation yet.
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    const dpi = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    stateRef.current.rect = {
      width,
      height,
    };

    stateRef.current.render = {
      width,
      height,
      dpi,
    };

    canvas.width = Math.max(1, Math.floor(width * dpi));
    canvas.height = Math.max(1, Math.floor(height * dpi));

    return true;
  }, []);

  const setDiscs = React.useCallback(() => {
    const { width, height } = stateRef.current.rect;

    // Don't create discs if the canvas has no size.
    if (width <= 0 || height <= 0) {
      stateRef.current.discs = [];
      return;
    }

    stateRef.current.discs = [];

    stateRef.current.startDisc = {
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7,
    };

    stateRef.current.endDisc = {
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0,
    };

    let prevBottom = height;

    stateRef.current.clip = {};

    for (let i = 0; i < numberOfDiscs; i++) {
      const p = i / numberOfDiscs;

      const disc = {
        p,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };

      tweenDisc(disc);

      const bottom = disc.y + disc.h;

      if (bottom <= prevBottom) {
        stateRef.current.clip = {
          disc: {
            ...disc,
          },
          i,
        };
      }

      prevBottom = bottom;

      stateRef.current.discs.push(disc);
    }

    // Make sure we actually have a clipping disc.
    if (!stateRef.current.clip.disc) {
      stateRef.current.clip.disc = {
        x: width * 0.5,
        y: height * 0.45,
        w: width * 0.75,
        h: height * 0.7,
      };
    }

    const clipPath = new Path2D();

    const disc = stateRef.current.clip.disc;

    clipPath.ellipse(
      disc.x,
      disc.y,
      disc.w,
      disc.h,
      0,
      0,
      Math.PI * 2
    );

    clipPath.rect(
      disc.x - disc.w,
      0,
      disc.w * 2,
      disc.y
    );

    stateRef.current.clip.path = clipPath;
  }, [numberOfDiscs, tweenDisc]);

  const setLines = React.useCallback(() => {
    const { width, height } = stateRef.current.rect;

    /**
     * Critical fix:
     * Never create a 0x0 offscreen canvas.
     */
    if (width <= 0 || height <= 0) {
      stateRef.current.linesCanvas = null;
      stateRef.current.lines = [];
      return;
    }

    if (!stateRef.current.clip?.path) {
      stateRef.current.linesCanvas = null;
      return;
    }

    stateRef.current.lines = [];

    const linesAngle =
      (Math.PI * 2) / numberOfLines;

    for (let i = 0; i < numberOfLines; i++) {
      stateRef.current.lines.push([]);
    }

    stateRef.current.discs.forEach((disc: any) => {
      for (let i = 0; i < numberOfLines; i++) {
        const angle = i * linesAngle;

        const p = {
          x:
            disc.x +
            Math.cos(angle) * disc.w,

          y:
            disc.y +
            Math.sin(angle) * disc.h,
        };

        stateRef.current.lines[i].push(p);
      }
    });

    /**
     * Create offscreen canvas.
     *
     * Math.max(1, ...) guarantees that it can never be 0x0.
     */
    const offCanvas = document.createElement('canvas');

    offCanvas.width = Math.max(
      1,
      Math.floor(width)
    );

    offCanvas.height = Math.max(
      1,
      Math.floor(height)
    );

    const ctx = offCanvas.getContext('2d');

    if (!ctx) {
      stateRef.current.linesCanvas = null;
      return;
    }

    stateRef.current.lines.forEach(
      (line: any) => {
        ctx.save();

        let lineIsIn = false;

        line.forEach(
          (p1: any, j: number) => {
            if (j === 0) return;

            const p0 = line[j - 1];

            if (
              !lineIsIn &&
              (
                ctx.isPointInPath(
                  stateRef.current.clip.path,
                  p1.x,
                  p1.y
                ) ||
                ctx.isPointInStroke(
                  stateRef.current.clip.path,
                  p1.x,
                  p1.y
                )
              )
            ) {
              lineIsIn = true;
            } else if (lineIsIn) {
              ctx.clip(
                stateRef.current.clip.path
              );
            }

            ctx.beginPath();

            ctx.moveTo(
              p0.x,
              p0.y
            );

            ctx.lineTo(
              p1.x,
              p1.y
            );

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;

            ctx.stroke();
            ctx.closePath();
          }
        );

        ctx.restore();
      }
    );

    /**
     * Only store the canvas if it has a valid size.
     */
    if (
      offCanvas.width > 0 &&
      offCanvas.height > 0
    ) {
      stateRef.current.linesCanvas =
        offCanvas;
    } else {
      stateRef.current.linesCanvas = null;
    }
  }, [numberOfLines, strokeColor]);

  const initParticle = React.useCallback(
    (start: boolean = false) => {
      const particleArea =
        stateRef.current.particleArea;

      const sx =
        (particleArea.sx || 0) +
        (particleArea.sw || 0) *
          Math.random();

      const ex =
        (particleArea.ex || 0) +
        (particleArea.ew || 0) *
          Math.random();

      const dx = ex - sx;

      const y = start
        ? (particleArea.h || 0) *
          Math.random()
        : particleArea.h || 0;

      const r =
        0.5 + Math.random() * 4;

      const vy =
        0.5 + Math.random();

      return {
        x: sx,
        sx,
        dx,
        y,
        vy,
        p: 0,
        r,
        c: `rgba(
          ${particleRGBColor[0]},
          ${particleRGBColor[1]},
          ${particleRGBColor[2]},
          ${Math.random()}
        )`,
      };
    },
    [particleRGBColor]
  );

  const setParticles = React.useCallback(() => {
    const { width, height } =
      stateRef.current.rect;

    if (width <= 0 || height <= 0) {
      stateRef.current.particles = [];
      return;
    }

    const disc =
      stateRef.current.clip?.disc;

    if (!disc) {
      stateRef.current.particles = [];
      return;
    }

    stateRef.current.particles = [];

    stateRef.current.particleArea = {
      sw: disc.w * 0.5,
      ew: disc.w * 2,
      h: height * 0.85,
    };

    stateRef.current.particleArea.sx =
      (
        width -
        stateRef.current.particleArea.sw
      ) / 2;

    stateRef.current.particleArea.ex =
      (
        width -
        stateRef.current.particleArea.ew
      ) / 2;

    const totalParticles = 100;

    for (
      let i = 0;
      i < totalParticles;
      i++
    ) {
      stateRef.current.particles.push(
        initParticle(true)
      );
    }
  }, [initParticle]);

  const drawDiscs = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const clip =
        stateRef.current.clip;

      const outerDisc =
        stateRef.current.startDisc;

      if (!clip?.path || !outerDisc) {
        return;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.ellipse(
        outerDisc.x,
        outerDisc.y,
        outerDisc.w,
        outerDisc.h,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();
      ctx.closePath();

      stateRef.current.discs.forEach(
        (disc: any, i: number) => {
          if (i % 5 !== 0) return;

          if (
            disc.w <
            stateRef.current.clip.disc.w - 5
          ) {
            ctx.save();

            ctx.clip(
              stateRef.current.clip.path
            );
          }

          ctx.beginPath();

          ctx.ellipse(
            disc.x,
            disc.y,
            disc.w,
            disc.h,
            0,
            0,
            Math.PI * 2
          );

          ctx.stroke();
          ctx.closePath();

          if (
            disc.w <
            stateRef.current.clip.disc.w - 5
          ) {
            ctx.restore();
          }
        }
      );
    },
    [strokeColor]
  );

  /**
   * Draw the offscreen lines canvas.
   *
   * This is the second important protection against
   * the drawImage InvalidStateError.
   */
  const drawLines = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const linesCanvas =
        stateRef.current.linesCanvas;

      if (!linesCanvas) {
        return;
      }

      if (
        linesCanvas.width <= 0 ||
        linesCanvas.height <= 0
      ) {
        return;
      }

      ctx.drawImage(
        linesCanvas,
        0,
        0
      );
    },
    []
  );

  const drawParticles = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const clip =
        stateRef.current.clip;

      if (!clip?.path) {
        return;
      }

      ctx.save();

      ctx.clip(
        clip.path
      );

      stateRef.current.particles.forEach(
        (particle: any) => {
          ctx.fillStyle = particle.c;

          ctx.beginPath();

          ctx.rect(
            particle.x,
            particle.y,
            particle.r,
            particle.r
          );

          ctx.closePath();

          ctx.fill();
        }
      );

      ctx.restore();
    },
    []
  );

  const moveDiscs = React.useCallback(() => {
    stateRef.current.discs.forEach(
      (disc: any) => {
        disc.p =
          (disc.p + 0.001) % 1;

        tweenDisc(disc);
      }
    );
  }, [tweenDisc]);

  const moveParticles = React.useCallback(() => {
    const particleArea =
      stateRef.current.particleArea;

    if (!particleArea?.h) {
      return;
    }

    stateRef.current.particles.forEach(
      (particle: any, idx: number) => {
        particle.p =
          1 -
          particle.y /
            particleArea.h;

        particle.x =
          particle.sx +
          particle.dx *
            particle.p;

        particle.y -= particle.vy;

        if (particle.y < 0) {
          stateRef.current.particles[
            idx
          ] = initParticle();
        }
      }
    );
  }, [initParticle]);

  const tick = React.useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    // Don't animate an invalid canvas.
    if (
      canvas.width <= 0 ||
      canvas.height <= 0
    ) {
      return;
    }

    const ctx =
      canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.save();

    const dpi =
      stateRef.current.render.dpi ||
      1;

    ctx.scale(
      dpi,
      dpi
    );

    moveDiscs();
    moveParticles();

    drawDiscs(ctx);
    drawLines(ctx);
    drawParticles(ctx);

    ctx.restore();

    animationFrameIdRef.current =
      requestAnimationFrame(tick);
  }, [
    moveDiscs,
    moveParticles,
    drawDiscs,
    drawLines,
    drawParticles,
  ]);

  const init = React.useCallback(() => {
    /**
     * setSize returns false when the component
     * doesn't have dimensions yet.
     */
    const hasSize = setSize();

    if (!hasSize) {
      return false;
    }

    setDiscs();
    setLines();
    setParticles();

    return true;
  }, [
    setSize,
    setDiscs,
    setLines,
    setParticles,
  ]);

  React.useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    /**
     * Try initialization.
     */
    const initialized = init();

    if (initialized) {
      tick();
    }

    /**
     * Resize handler.
     */
    const handleResize = () => {
      const hasSize =
        setSize();

      if (!hasSize) {
        return;
      }

      setDiscs();
      setLines();
      setParticles();
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );

      cancelAnimationFrame(
        animationFrameIdRef.current
      );
    };
  }, [
    init,
    tick,
    setSize,
    setDiscs,
    setLines,
    setParticles,
  ]);

  return (
    <div
      data-slot="hole-background"
      className={cn(
        'relative size-full overflow-hidden',

        'before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:block before:size-[140%] dark:before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,black_50%)] before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,white_50%)] before:[transform:translate3d(-50%,-50%,0)]',

        'after:content-[""] after:absolute after:z-[5] after:top-1/2 after:left-1/2 after:block after:size-full after:[background:radial-gradient(ellipse_at_50%_75%,#a900ff_20%,transparent_75%)] after:[transform:translate3d(-50%,-50%,0)] after:mix-blend-overlay',

        className
      )}
      {...props}
    >
      {children}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 block size-full dark:opacity-20 opacity-10"
      />

      <motion.div
        className={cn(
          'absolute top-[-71.5%] left-1/2 z-[3] w-[30%] h-[140%] rounded-b-full blur-3xl opacity-75 dark:mix-blend-plus-lighter mix-blend-plus-darker [transform:translate3d(-50%,0,0)] [background-position:0%_100%] [background-size:100%_200%]',

          'dark:[background:linear-gradient(20deg,#00f8f1,#ffbd1e20_16.5%,#fe848f_33%,#fe848f20_49.5%,#00f8f1_66%,#00f8f160_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%] [background:linear-gradient(20deg,#00f8f1,#ffbd1e40_16.5%,#fe848f_33%,#fe848f40_49.5%,#00f8f1_66%,#00f8f180_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%]'
        )}
        animate={{
          backgroundPosition: '0% 300%',
        }}
        transition={{
          duration: 5,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </div>
  );
}

export {
  HoleBackground,
  type HoleBackgroundProps,
};
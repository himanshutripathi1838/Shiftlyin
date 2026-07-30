'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function TestimonialCarousel({
  items,
  variant = 'card',
  loop = true,
  autoplay = false,
  autoplayMs = 5000,
  showArrows = true,
  showDots = true,
  allowKeyboard = true,
  initialIndex = 0,
  onIndexChange,
  className,
  contentClassName,
  cardClassName,
  avatarClassName,
  nameClassName,
  roleClassName,
  quoteClassName,
  ariaLabel = 'Testimonials',
}) {
  const count = items.length;
  const [index, setIndex] = React.useState(
    Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0))
  );
  const active = ((i) => ((i % count) + count) % count)(index); // safe modulo

  const go = React.useCallback(
    (delta) => {
      setIndex((i) => {
        const next = i + delta;
        if (!loop) {
          const clamped = Math.min(Math.max(next, 0), count - 1);
          onIndexChange?.(clamped);
          return clamped;
        }
        const wrapped = ((next % count) + count) % count;
        onIndexChange?.(wrapped);
        return wrapped;
      });
    },
    [count, loop, onIndexChange]
  );

  // autoplay
  React.useEffect(() => {
    if (!autoplay || count <= 1) return;
    const id = setInterval(() => go(1), autoplayMs);
    return () => clearInterval(id);
  }, [autoplay, autoplayMs, count, go]);

  // keyboard
  React.useEffect(() => {
    if (!allowKeyboard) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [allowKeyboard, go]);

  return (
    <section
      aria-roledescription='carousel'
      aria-label={ariaLabel}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/60 dark:ring-zinc-800',
        className
      )}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
        borderRadius: "16px",
        padding: "24px"
      }}
    >
      {/* arrows */}
      {showArrows && count > 1 && (
        <>
          <button
            type='button'
            onClick={() => go(-1)}
            aria-label='Previous testimonial'
            className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800'
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              padding: "6px",
              cursor: "pointer",
              zIndex: 10,
              display: "grid",
              placeItems: "center"
            }}
          >
            <ChevronLeft className='h-5 w-5' style={{ color: "var(--text)" }} />
          </button>
          <button
            type='button'
            onClick={() => go(1)}
            aria-label='Next testimonial'
            className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 ring-1 ring-zinc-200 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800'
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              padding: "6px",
              cursor: "pointer",
              zIndex: 10,
              display: "grid",
              placeItems: "center"
            }}
          >
            <ChevronRight className='h-5 w-5' style={{ color: "var(--text)" }} />
          </button>
        </>
      )}

      {/* slide */}
      <div className={cn('relative mx-auto max-w-3xl', contentClassName)}>
        <AnimatePresence mode='popLayout' initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className='grid place-items-center'
            role='group'
            aria-roledescription='slide'
            aria-label={`${active + 1} of ${count}`}
          >
            {/* custom renderer? */}
            {typeof items[active]?.render === 'function' ? (
              items[active].render({ active: true, index: active })
            ) : (
              <DefaultCard
                item={items[active]}
                variant={variant}
                className={cardClassName}
                avatarClassName={avatarClassName}
                nameClassName={nameClassName}
                roleClassName={roleClassName}
                quoteClassName={quoteClassName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dots */}
      {showDots && count > 1 && (
        <div className='mt-6 flex items-center justify-center gap-2' style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "8px" }}>
          {items.map((_, i) => {
            const is = i === active;
            return (
              <button
                key={i}
                type='button'
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full ring-1 ring-zinc-300 transition dark:ring-zinc-700',
                  is
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-zinc-300/70 dark:bg-zinc-700/70'
                )}
                style={{
                  width: is ? "24px" : "10px",
                  height: "10px",
                  borderRadius: "5px",
                  border: "none",
                  background: is ? "var(--primary)" : "var(--border)",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------- default card renderer ---------- */

function DefaultCard({
  item,
  variant,
  className,
  avatarClassName,
  nameClassName,
  roleClassName,
  quoteClassName,
}) {
  const accent = item.accent ?? '#3b82f6';
  const ring = { boxShadow: `0 0 0 3px ${accent}33` };

  return (
    <article
      className={cn(
        'grid place-items-center text-center',
        variant === 'card' && 'px-4 py-3',
        className
      )}
      style={{ display: "grid", placeItems: "center", textAlign: "center", width: "100%" }}
    >
      {/* avatar */}
      {(item.avatar || item.name) && (
        <div className='relative mb-3' style={{ position: "relative", marginBottom: "12px" }}>
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name ?? 'avatar'}
              className={cn(
                'h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900',
                avatarClassName
              )}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                ...ring
              }}
              loading='lazy'
            />
          ) : (
            <div
              className={cn(
                'grid h-16 w-16 place-items-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                avatarClassName
              )}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--surface-soft)",
                color: "var(--text)",
                ...ring
              }}
            >
              <span className='text-lg font-semibold' style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {item.name?.[0] ?? '?'}
              </span>
            </div>
          )}
          {/* decorative quote badge */}
          <span
            className='absolute -left-2 -top-2 grid h-7 w-7 place-items-center rounded-full text-white shadow-sm'
            style={{
              position: "absolute",
              top: "-6px",
              left: "-6px",
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: accent,
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontSize: "16px",
              fontWeight: 900
            }}
            aria-hidden
          >
            &quot;
          </span>
        </div>
      )}

      {/* name / role */}
      {item.name && (
        <h3
          className={cn('text-xl font-semibold tracking-tight', nameClassName)}
          style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", margin: "4px 0" }}
        >
          {item.name}
        </h3>
      )}
      {item.role && (
        <p
          className={cn(
            'mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--role-color,#4f46e5)]',
            roleClassName
          )}
          style={{
            marginBottom: "12px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accent
          }}
        >
          {item.role}
        </p>
      )}

      {/* quote */}
      {item.quote && (
        <p
          className={cn(
            'text-balance max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300',
            quoteClassName
          )}
          style={{
            maxWidth: "500px",
            fontSize: "14px",
            lineHeight: "1.65",
            color: "var(--muted)",
            margin: "0 auto"
          }}
        >
          &quot;{item.quote}&quot;
        </p>
      )}
    </article>
  );
}

export default TestimonialCarousel;

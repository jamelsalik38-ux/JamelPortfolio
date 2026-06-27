"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}

/**
 * Generic modal shell. Animates in/out with a GSAP timeline (scale + fade)
 * rather than Framer Motion, per the brief's GSAP-for-modals requirement.
 */
export default function Modal({ open, onClose, children, labelledBy }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setMounted(true);
    } else if (mounted) {
      closingRef.current = true;
      const tl = gsap.timeline({
        onComplete: () => setMounted(false),
      });
      tl.to(panelRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      }).to(
        overlayRef.current,
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        "<"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (mounted && !closingRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(panelRef.current, { scale: 0.92, opacity: 0 });
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" }).to(
        panelRef.current,
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" },
        "<0.05"
      );
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="glass-strong neon-border max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 shadow-glow-red sm:p-8"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

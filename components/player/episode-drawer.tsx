"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { EpisodeItem } from "@/types/api";

interface EpisodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: EpisodeItem[];
  currentSlug?: string;
  movieSlug: string;
  onSelectEpisode: (slug: string) => void;
}

export const EpisodeDrawer = ({
  isOpen,
  onClose,
  episodes,
  currentSlug,
  onSelectEpisode,
}: EpisodeDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Scroll current episode into view
  useEffect(() => {
    if (isOpen && drawerRef.current && currentSlug) {
      const active = drawerRef.current.querySelector(
        `[data-slug="${currentSlug}"]`,
      );
      if (active) {
        active.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [isOpen, currentSlug]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#141414] border-l border-white/10 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg">Danh sách tập</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Episode list */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-3">
          <div className="flex flex-col gap-1.5">
            {episodes.map((ep, idx) => {
              const isActive = ep.slug === currentSlug;
              return (
                <button
                  key={ep.slug}
                  data-slug={ep.slug}
                  onClick={() => {
                    onSelectEpisode(ep.slug);
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-primary/20 border border-primary/40 text-white"
                      : "bg-white/5 border border-transparent text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {ep.name || `Tập ${idx + 1}`}
                    </p>
                    {ep.filename && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {ep.filename}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <span className="shrink-0 ml-auto text-[10px] text-primary font-bold uppercase">
                      Đang xem
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

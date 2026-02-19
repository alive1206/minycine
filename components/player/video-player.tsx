"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  MonitorPlay,
  List,
  RotateCcw,
  RotateCw,
  Sun,
  Volume1,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title?: string;
  onOpenEpisodeList?: () => void;
  hasEpisodes?: boolean;
  episodeDrawerSlot?: React.ReactNode;
  onProgressSave?: (progress: {
    currentTime: number;
    duration: number;
  }) => void;
  initialTime?: number;
}

const formatTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const DOUBLE_TAP_DELAY = 300;
const SEEK_SECONDS = 5;
const SWIPE_THRESHOLD = 10;

export const VideoPlayer = ({
  src,
  title,
  onOpenEpisodeList,
  hasEpisodes,
  episodeDrawerSlot,
  onProgressSave,
  initialTime,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lastSaveRef = useRef(0);
  const progressSaveRef = useRef(onProgressSave);
  useEffect(() => {
    progressSaveRef.current = onProgressSave;
  }, [onProgressSave]);
  const initialTimeApplied = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [qualities, setQualities] = useState<
    { label: string; level: number }[]
  >([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [isPiP, setIsPiP] = useState(false);

  // ─── Seek preview state ───────────────────────────────────
  const [seekPreview, setSeekPreview] = useState<{
    time: number;
    percent: number;
  } | null>(null);
  const isSeeking = useRef(false);

  // ─── Gesture states ───────────────────────────────────────
  const [seekIndicator, setSeekIndicator] = useState<{
    side: "left" | "right";
    seconds: number;
  } | null>(null);
  const [gestureIndicator, setGestureIndicator] = useState<{
    type: "volume" | "brightness";
    value: number;
  } | null>(null);
  const [brightness, setBrightness] = useState(1);

  // Refs for gesture tracking
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef(0);
  const lastTapXRef = useRef(0);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    side: "left" | "right";
  } | null>(null);
  const isSwipingRef = useRef(false);
  const swipeStartVolumeRef = useRef(1);
  const swipeStartBrightnessRef = useRef(1);
  const seekIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const gestureIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ─── HLS setup ────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isM3u8 = src.includes(".m3u8");

    const tryPlayUnmuted = (v: HTMLVideoElement) => {
      v.muted = false;
      v.play().catch(() => {
        // Autoplay blocked without mute — fall back to muted
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    };

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const q = data.levels.map((level, idx) => ({
          label: level.height ? `${level.height}p` : `Level ${idx}`,
          level: idx,
        }));
        q.unshift({ label: "Tự động", level: -1 });
        setQualities(q);
        setCurrentQuality(-1);
        setLoading(false);
        tryPlayUnmuted(video);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (isM3u8 && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = src;
      tryPlayUnmuted(video);
      queueMicrotask(() => setLoading(false));
    } else {
      // Direct MP4 or embed fallback
      video.src = src;
      queueMicrotask(() => setLoading(false));
    }
  }, [src]);

  // ─── Video events ─────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      // Save progress on pause
      if (progressSaveRef.current && video.duration) {
        progressSaveRef.current({
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Throttled progress save every 5 seconds
      if (progressSaveRef.current && video.duration) {
        const now = Date.now();
        if (now - lastSaveRef.current > 5000) {
          lastSaveRef.current = now;
          progressSaveRef.current({
            currentTime: video.currentTime,
            duration: video.duration,
          });
        }
      }
    };
    const onDurationChange = () => setDuration(video.duration || 0);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => {
      setLoading(false);
      // Seek to initial time on first canplay
      if (initialTime && !initialTimeApplied.current) {
        initialTimeApplied.current = true;
        video.currentTime = initialTime;
      }
    };
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("progress", onProgress);

    return () => {
      // Save progress on cleanup
      if (progressSaveRef.current && video.duration) {
        progressSaveRef.current({
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("progress", onProgress);
    };
  }, [initialTime]);

  // ─── Controls auto-hide ───────────────────────────────────
  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    startHideTimer();
  }, [startHideTimer]);

  useEffect(() => {
    if (!playing) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      // Schedule showing controls outside of synchronous effect body
      const id = requestAnimationFrame(() => setShowControls(true));
      return () => cancelAnimationFrame(id);
    }
    startHideTimer();
  }, [playing, startHideTimer]);

  // ─── Fullscreen ───────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        // On iOS Safari, use the video element's native fullscreen
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((video as any)?.webkitEnterFullscreen) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (video as any).webkitEnterFullscreen();
        } else {
          await container.requestFullscreen();
        }
        // Lock to landscape on mobile
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (screen.orientation as any)?.lock?.("landscape");
        } catch {
          // Orientation lock not supported or not allowed
        }
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        // Unlock orientation
        try {
          screen.orientation?.unlock?.();
        } catch {
          // Orientation unlock not supported
        }
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      // Unlock orientation when exiting fullscreen
      if (!inFs) {
        try {
          screen.orientation?.unlock?.();
        } catch {
          // ignore
        }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ─── PiP ─────────────────────────────────────────────────
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      // PiP not supported
    }
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
          resetHideTimer();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          resetHideTimer();
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          resetHideTimer();
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          resetHideTimer();
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          resetHideTimer();
          break;
        case "m":
          e.preventDefault();
          video.muted = !video.muted;
          setMuted(video.muted);
          resetHideTimer();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [duration, resetHideTimer, toggleFullscreen]);

  // ─── Seek helpers ─────────────────────────────────────────
  const getRatioFromX = useCallback((clientX: number) => {
    const bar = seekBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const ratio = getRatioFromX(e.clientX);
      video.currentTime = ratio * duration;
      resetHideTimer();
    },
    [duration, resetHideTimer, getRatioFromX],
  );

  // ─── Seek bar hover preview (desktop) ─────────────────────
  const handleSeekHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const ratio = getRatioFromX(e.clientX);
      setSeekPreview({ time: ratio * duration, percent: ratio * 100 });
    },
    [duration, getRatioFromX],
  );

  const handleSeekLeave = useCallback(() => {
    if (!isSeeking.current) setSeekPreview(null);
  }, []);

  // ─── Seek bar touch drag (mobile) ─────────────────────────
  const handleSeekTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!duration) return;
      isSeeking.current = true;
      const ratio = getRatioFromX(e.touches[0].clientX);
      setSeekPreview({ time: ratio * duration, percent: ratio * 100 });
    },
    [duration, getRatioFromX],
  );

  const handleSeekTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!duration || !isSeeking.current) return;
      const ratio = getRatioFromX(e.touches[0].clientX);
      setSeekPreview({ time: ratio * duration, percent: ratio * 100 });
    },
    [duration, getRatioFromX],
  );

  const handleSeekTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!duration || !isSeeking.current) return;
      const video = videoRef.current;
      if (video && seekPreview) {
        video.currentTime = seekPreview.time;
      }
      isSeeking.current = false;
      setSeekPreview(null);
      resetHideTimer();
    },
    [duration, seekPreview, resetHideTimer],
  );

  // ─── Quality change ──────────────────────────────────────
  const changeQuality = useCallback((level: number) => {
    const hls = hlsRef.current;
    if (hls) {
      hls.currentLevel = level;
      setCurrentQuality(level);
    }
    setShowSettings(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  // ─── Show seek indicator ─────────────────────────────────
  const showSeekFeedback = useCallback(
    (side: "left" | "right", seconds: number) => {
      if (seekIndicatorTimerRef.current)
        clearTimeout(seekIndicatorTimerRef.current);
      setSeekIndicator({ side, seconds });
      seekIndicatorTimerRef.current = setTimeout(() => {
        setSeekIndicator(null);
      }, 600);
    },
    [],
  );

  // ─── Show gesture indicator ──────────────────────────────
  const showGestureFeedback = useCallback(
    (type: "volume" | "brightness", value: number) => {
      if (gestureIndicatorTimerRef.current)
        clearTimeout(gestureIndicatorTimerRef.current);
      setGestureIndicator({ type, value });
      gestureIndicatorTimerRef.current = setTimeout(() => {
        setGestureIndicator(null);
      }, 800);
    },
    [],
  );

  // ─── Touch gestures (mobile) ──────────────────────────────
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Don't intercept touches on control buttons
      const target = e.target as HTMLElement;
      if (target.closest(".player-controls-area") || target.closest("button"))
        return;

      const touch = e.touches[0];
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      const side: "left" | "right" =
        relativeX < rect.width / 2 ? "left" : "right";

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        side,
      };
      isSwipingRef.current = false;
      swipeStartVolumeRef.current = volume;
      swipeStartBrightnessRef.current = brightness;
    },
    [volume, brightness],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest(".player-controls-area") || target.closest("button"))
        return;

      const start = touchStartRef.current;
      if (!start) return;

      const touch = e.touches[0];
      const deltaY = start.y - touch.clientY; // positive = up
      const deltaX = Math.abs(touch.clientX - start.x);

      // Only activate vertical swipe if vertical movement exceeds threshold and is greater than horizontal
      if (Math.abs(deltaY) < SWIPE_THRESHOLD || deltaX > Math.abs(deltaY))
        return;

      isSwipingRef.current = true;
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;
      const containerHeight = container.getBoundingClientRect().height;
      // Sensitivity: full swipe across container height = 1.0 range change
      const delta = deltaY / containerHeight;

      if (start.side === "right") {
        // Volume: swipe up = louder
        const video = videoRef.current;
        if (!video) return;
        const newVol = Math.max(
          0,
          Math.min(1, swipeStartVolumeRef.current + delta),
        );
        video.volume = newVol;
        video.muted = newVol === 0;
        setVolume(newVol);
        setMuted(newVol === 0);
        showGestureFeedback("volume", newVol);
      } else {
        // Brightness: swipe up = brighter
        const newBrightness = Math.max(
          0.2,
          Math.min(2, swipeStartBrightnessRef.current + delta),
        );
        setBrightness(newBrightness);
        if (videoRef.current) {
          videoRef.current.style.filter = `brightness(${newBrightness})`;
        }
        showGestureFeedback("brightness", newBrightness);
      }
    },
    [showGestureFeedback],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest(".player-controls-area") || target.closest("button"))
        return;

      // If it was a swipe gesture, don't process as tap
      if (isSwipingRef.current) {
        touchStartRef.current = null;
        isSwipingRef.current = false;
        return;
      }

      touchStartRef.current = null;

      // Double-tap detection
      const now = Date.now();
      const touch = e.changedTouches[0];
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      const side: "left" | "right" =
        relativeX < rect.width / 2 ? "left" : "right";

      if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
        // Double tap detected — cancel pending single-tap
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }

        const video = videoRef.current;
        if (!video) return;

        if (side === "right") {
          video.currentTime = Math.min(
            duration,
            video.currentTime + SEEK_SECONDS,
          );
          showSeekFeedback("right", SEEK_SECONDS);
        } else {
          video.currentTime = Math.max(0, video.currentTime - SEEK_SECONDS);
          showSeekFeedback("left", -SEEK_SECONDS);
        }
        resetHideTimer();
        lastTapTimeRef.current = 0;
      } else {
        // Single tap — delay to check for double-tap
        lastTapTimeRef.current = now;
        lastTapXRef.current = relativeX;
        tapTimerRef.current = setTimeout(() => {
          togglePlayPause();
          tapTimerRef.current = null;
        }, DOUBLE_TAP_DELAY);
      }
    },
    [duration, resetHideTimer, togglePlayPause, showSeekFeedback],
  );

  // ─── Desktop click handler ────────────────────────────────
  const handleVideoClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      // Don't toggle on control area clicks
      if (target.closest(".player-controls-area") || target.closest("button"))
        return;
      // On touch devices the touch handler manages this
      if ("ontouchstart" in window) return;
      togglePlayPause();
    },
    [togglePlayPause],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none"
      onMouseMove={resetHideTimer}
      onClick={handleVideoClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        autoPlay
        style={{ filter: `brightness(${brightness})` }}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* ─── Seek indicator (double-tap feedback) ─── */}
      {seekIndicator && (
        <div
          className={`absolute top-0 bottom-0 flex items-center justify-center pointer-events-none z-30 animate-seek-fade ${
            seekIndicator.side === "left" ? "left-0 w-1/3" : "right-0 w-1/3"
          }`}
        >
          <div className="flex flex-col items-center gap-1 bg-black/40 rounded-full px-5 py-3 backdrop-blur-sm">
            {seekIndicator.side === "left" ? (
              <RotateCcw className="w-7 h-7 text-white" />
            ) : (
              <RotateCw className="w-7 h-7 text-white" />
            )}
            <span className="text-white text-sm font-semibold">
              {seekIndicator.seconds > 0 ? "+" : ""}
              {seekIndicator.seconds}s
            </span>
          </div>
        </div>
      )}

      {/* ─── Volume / Brightness gesture indicator ─── */}
      {gestureIndicator && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none z-30 ${
            gestureIndicator.type === "volume" ? "right-8" : "left-8"
          }`}
        >
          <div className="flex flex-col items-center gap-2 bg-black/50 rounded-xl px-3 py-4 backdrop-blur-sm">
            {gestureIndicator.type === "volume" ? (
              gestureIndicator.value === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume1 className="w-5 h-5 text-white" />
              )
            ) : (
              <Sun className="w-5 h-5 text-white" />
            )}
            {/* Vertical bar */}
            <div className="relative w-1 h-24 bg-white/20 rounded-full overflow-hidden">
              <div
                className="absolute bottom-0 left-0 w-full bg-white rounded-full transition-all duration-100"
                style={{
                  height: `${
                    gestureIndicator.type === "volume"
                      ? gestureIndicator.value * 100
                      : ((gestureIndicator.value - 0.2) / 1.8) * 100
                  }%`,
                }}
              />
            </div>
            <span className="text-white text-xs font-medium">
              {gestureIndicator.type === "volume"
                ? `${Math.round(gestureIndicator.value * 100)}%`
                : `${Math.round(gestureIndicator.value * 100)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Controls overlay — pointer-events-none so taps pass through to video */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-20 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top gradient + title */}
        <div className="player-controls-area absolute top-0 left-0 right-0 bg-linear-to-b from-black/70 to-transparent p-4 flex items-start justify-between pointer-events-auto">
          {title ? (
            <h3 className="text-white text-sm font-medium truncate pr-2">
              {title}
            </h3>
          ) : (
            <div />
          )}
          {/* Episode list button — top right */}
          {hasEpisodes && onOpenEpisodeList && (
            <button
              onClick={onOpenEpisodeList}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm transition-colors border border-white/10"
              title="Danh sách tập"
            >
              <List className="w-4 h-4" />
              <span className="hidden">DS Tập</span>
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="player-controls-area bg-linear-to-t from-black/80 to-transparent pt-12 pb-3 px-4 pointer-events-auto">
          {/* Seek bar */}
          <div
            ref={seekBarRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/seek hover:h-2.5 transition-all"
            onClick={handleSeek}
            onMouseMove={handleSeekHover}
            onMouseLeave={handleSeekLeave}
            onTouchStart={handleSeekTouchStart}
            onTouchMove={handleSeekTouchMove}
            onTouchEnd={handleSeekTouchEnd}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{
                width: `${seekPreview ? seekPreview.percent : progress}%`,
              }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{
                left: `${seekPreview ? seekPreview.percent : progress}%`,
                transform: `translate(-50%, -50%)`,
              }}
            />
            {/* Preview tooltip */}
            {seekPreview && (
              <div
                className="absolute -top-9 pointer-events-none"
                style={{
                  left: `${seekPreview.percent}%`,
                  transform: `translateX(-50%)`,
                }}
              >
                <div className="bg-black/85 text-white text-xs font-mono px-2 py-1 rounded shadow-lg backdrop-blur-sm whitespace-nowrap">
                  {formatTime(seekPreview.time)}
                </div>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title={playing ? "Tạm dừng" : "Phát"}
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Skip backward 5s */}
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = Math.max(0, video.currentTime - 5);
                  resetHideTimer();
                }
              }}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title="Tua lùi 5 giây"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>

            {/* Skip forward 5s */}
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.currentTime = Math.min(duration, video.currentTime + 5);
                  resetHideTimer();
                }
              }}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title="Tua tới 5 giây"
            >
              <RotateCw className="w-4.5 h-4.5" />
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title={muted ? "Bật âm" : "Tắt âm"}
            >
              {muted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Volume slider — hidden on mobile */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.volume = v;
                  videoRef.current.muted = v === 0;
                }
                setVolume(v);
                setMuted(v === 0);
              }}
              className="hidden md:block w-16 h-1 accent-primary cursor-pointer"
            />

            {/* Time */}
            <span className="text-white text-xs ml-2 font-mono select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Quality settings */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 text-white hover:text-primary transition-colors"
                  title="Chất lượng"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 py-1 min-w-30 shadow-xl">
                    {qualities.map((q) => (
                      <button
                        key={q.level}
                        onClick={() => changeQuality(q.level)}
                        className={`block w-full text-left px-3 py-1.5 text-sm transition-colors ${
                          currentQuality === q.level
                            ? "text-primary font-medium"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title="Picture-in-Picture"
            >
              <MonitorPlay
                className={`w-5 h-5 ${isPiP ? "text-primary" : ""}`}
              />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-white hover:text-primary transition-colors"
              title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Episode drawer — rendered inside fullscreen container */}
      {episodeDrawerSlot}
    </div>
  );
};

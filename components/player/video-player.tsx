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
  const [muted, setMuted] = useState(true);
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

  // ─── HLS setup ────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isM3u8 = src.includes(".m3u8");

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
        video.muted = true;
        video.play().catch(() => {});
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
      video.muted = true;
      video.play().catch(() => {});
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
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
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

  // ─── Seek ─────────────────────────────────────────────────
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const bar = seekBarRef.current;
      if (!video || !bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      video.currentTime = ratio * duration;
      resetHideTimer();
    },
    [duration, resetHideTimer],
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={resetHideTimer}
      onClick={(e) => {
        // Toggle play/pause on video area click (not on controls)
        if (
          e.target === videoRef.current ||
          (e.target as HTMLElement).closest(".video-click-area")
        ) {
          togglePlayPause();
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        autoPlay
        muted
        onClick={togglePlayPause}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top gradient + title */}
        <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black/70 to-transparent p-4">
          {title && (
            <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          )}
        </div>

        {/* Bottom controls */}
        <div className="bg-linear-to-t from-black/80 to-transparent pt-12 pb-3 px-4">
          {/* Seek bar */}
          <div
            ref={seekBarRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/seek hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{
                left: `${progress}%`,
                transform: `translate(-50%, -50%)`,
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
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

            {/* Volume slider */}
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
              className="w-16 h-1 accent-primary cursor-pointer"
            />

            {/* Time */}
            <span className="text-white text-xs ml-2 font-mono select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Episode list button */}
            {hasEpisodes && onOpenEpisodeList && (
              <button
                onClick={onOpenEpisodeList}
                className="p-1.5 text-white hover:text-primary transition-colors"
                title="Danh sách tập"
              >
                <List className="w-5 h-5" />
              </button>
            )}

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

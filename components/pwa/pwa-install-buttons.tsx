"use client";

import { useEffect, useState, useCallback } from "react";
import { Smartphone, TabletSmartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButtons() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  });
  const [isInstalled, setIsInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches,
  );
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInstalled]);

  const handleAndroidInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleIosInstall = useCallback(() => {
    setShowIosGuide((prev) => !prev);
  }, []);

  if (isInstalled) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-white font-bold mb-1">Tải Ứng Dụng</h3>

      {/* Android / Chrome button */}
      <button
        onClick={deferredPrompt ? handleAndroidInstall : undefined}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
          ${
            deferredPrompt
              ? "bg-green-600 hover:bg-green-500 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/5 text-gray-400 cursor-default"
          }`}
      >
        <Smartphone size={20} />
        <div className="text-left">
          <div className={deferredPrompt ? "text-white" : "text-gray-300"}>
            Android
          </div>
          <div className="text-[11px] opacity-70">
            {deferredPrompt ? "Nhấn để cài đặt" : "Mở bằng Chrome"}
          </div>
        </div>
      </button>

      {/* iOS button */}
      <button
        onClick={handleIosInstall}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
          ${
            isIos
              ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/5 text-gray-400 cursor-default"
          }`}
      >
        <TabletSmartphone size={20} />
        <div className="text-left">
          <div className={isIos ? "text-white" : "text-gray-300"}>iOS</div>
          <div className="text-[11px] opacity-70">
            {isIos ? "Nhấn để xem hướng dẫn" : "Mở bằng Safari"}
          </div>
        </div>
      </button>

      {/* iOS installation guide */}
      {showIosGuide && isIos && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-sm text-gray-300 space-y-2 border border-white/10">
          <p className="font-semibold text-white">Hướng dẫn cài trên iOS:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed">
            <li>
              Nhấn nút{" "}
              <span className="inline-flex items-center bg-white/10 px-1.5 py-0.5 rounded text-white">
                Chia sẻ ↑
              </span>{" "}
              ở thanh dưới Safari
            </li>
            <li>
              Kéo xuống chọn{" "}
              <span className="font-medium text-white">
                &quot;Thêm vào Màn hình chính&quot;
              </span>
            </li>
            <li>
              Nhấn{" "}
              <span className="font-medium text-white">&quot;Thêm&quot;</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

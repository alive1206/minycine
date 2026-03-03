// ─── Avatar Frames: Voice Live Room / Luxury Style ──────

export type FrameDecoration =
  | "platinum-ring"
  | "gold-ring"
  | "emerald-gem"
  | "amethyst-wings"
  | "sapphire-wings"
  | "rose-wings"
  | "dragon-crown"
  | "imperial-violet";

export interface AvatarFrame {
  id: string;
  nameVi: string;
  cssClass: string;
  decoration: FrameDecoration;
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: "platinum-ring",
    nameVi: "Bạch Kim",
    cssClass: "frame-platinum-ring",
    decoration: "platinum-ring",
  },
  {
    id: "gold-ring",
    nameVi: "Kim Quang",
    cssClass: "frame-gold-ring",
    decoration: "gold-ring",
  },
  {
    id: "emerald-gem",
    nameVi: "Lục Bảo",
    cssClass: "frame-emerald-gem",
    decoration: "emerald-gem",
  },
  {
    id: "amethyst-wings",
    nameVi: "Tử Ngọc",
    cssClass: "frame-amethyst-wings",
    decoration: "amethyst-wings",
  },
  {
    id: "sapphire-wings",
    nameVi: "Thanh Ngọc",
    cssClass: "frame-sapphire-wings",
    decoration: "sapphire-wings",
  },
  {
    id: "rose-wings",
    nameVi: "Hồng Ngọc",
    cssClass: "frame-rose-wings",
    decoration: "rose-wings",
  },
  {
    id: "dragon-crown",
    nameVi: "Long Viêm",
    cssClass: "frame-dragon-crown",
    decoration: "dragon-crown",
  },
  {
    id: "imperial-violet",
    nameVi: "Đế Vương",
    cssClass: "frame-imperial-violet",
    decoration: "imperial-violet",
  },
];

export function getFrameById(id: string | null): AvatarFrame | undefined {
  if (!id) return undefined;
  return AVATAR_FRAMES.find((f) => f.id === id);
}

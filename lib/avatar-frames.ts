// ─── Avatar Frames: Kiếm Hiệp / Wuxia Martial Arts theme ──────

export type FrameDecoration =
  | "blood-sword"
  | "azure-dragon"
  | "white-tiger"
  | "phoenix-dance"
  | "dark-moon"
  | "diamond-vajra"
  | "ink-wash"
  | "heavenly-mandate";

export interface AvatarFrame {
  id: string;
  nameVi: string;
  cssClass: string;
  decoration: FrameDecoration;
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: "huyet-kiem",
    nameVi: "Huyết Kiếm",
    cssClass: "frame-huyet-kiem",
    decoration: "blood-sword",
  },
  {
    id: "thanh-long",
    nameVi: "Thanh Long",
    cssClass: "frame-thanh-long",
    decoration: "azure-dragon",
  },
  {
    id: "bach-ho",
    nameVi: "Bạch Hổ",
    cssClass: "frame-bach-ho",
    decoration: "white-tiger",
  },
  {
    id: "phuong-vu",
    nameVi: "Phượng Vũ",
    cssClass: "frame-phuong-vu",
    decoration: "phoenix-dance",
  },
  {
    id: "hac-nguyet",
    nameVi: "Hắc Nguyệt",
    cssClass: "frame-hac-nguyet",
    decoration: "dark-moon",
  },
  {
    id: "kim-cuong",
    nameVi: "Kim Cương",
    cssClass: "frame-kim-cuong",
    decoration: "diamond-vajra",
  },
  {
    id: "thuy-mac",
    nameVi: "Thủy Mặc",
    cssClass: "frame-thuy-mac",
    decoration: "ink-wash",
  },
  {
    id: "thien-menh",
    nameVi: "Thiên Mệnh",
    cssClass: "frame-thien-menh",
    decoration: "heavenly-mandate",
  },
];

export function getFrameById(id: string | null): AvatarFrame | undefined {
  if (!id) return undefined;
  return AVATAR_FRAMES.find((f) => f.id === id);
}

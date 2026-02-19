// ─── System avatars: famous actresses by region ────────────────
// Images from TMDb CDN (The Movie Database) — real actress portraits

export interface SystemAvatar {
  id: string;
  name: string;
  url: string;
}

export interface AvatarCategory {
  label: string;
  avatars: SystemAvatar[];
}

// TMDb image CDN base URL
const TMDB = `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p"}/w185`;

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    label: "Hàn Quốc",
    avatars: [
      {
        id: "kr-1",
        name: "Song Hye-kyo",
        url: `${TMDB}/tlAX3f82Mf5h0rznpVBVK7nD2om.jpg`,
      },
      {
        id: "kr-2",
        name: "Jun Ji-hyun",
        url: `${TMDB}/pM5U2KH8RmuV1F7RsoE7Pn6AyhP.jpg`,
      },
      {
        id: "kr-3",
        name: "Park Shin-hye",
        url: `${TMDB}/wyTVX7GIfxCIHqWzTrOJ3AgO6bM.jpg`,
      },
      {
        id: "kr-4",
        name: "Suzy",
        url: `${TMDB}/67YkqSOk6LSAoM6WzSeXgerM7nD.jpg`,
      },
      {
        id: "kr-5",
        name: "Kim Tae-ri",
        url: `${TMDB}/gFofVUeVlIvBJMUv7maHQwWdfsk.jpg`,
      },
      {
        id: "kr-6",
        name: "IU",
        url: `${TMDB}/uNhKOO9lIAFXF11LM6gjCrX2CJz.jpg`,
      },
      {
        id: "kr-7",
        name: "Han So-hee",
        url: `${TMDB}/8IvEOnqMjqJWcci3z44haH38Ee8.jpg`,
      },
      {
        id: "kr-8",
        name: "Kim Ji-won",
        url: `${TMDB}/1IkKPBM75ZZf9OU2AcK5yBOA4iS.jpg`,
      },
    ],
  },
  {
    label: "Hollywood",
    avatars: [
      {
        id: "hw-1",
        name: "Scarlett Johansson",
        url: `${TMDB}/mjReG6rR7NPMEIWb1T4YWtV11ty.jpg`,
      },
      {
        id: "hw-2",
        name: "Margot Robbie",
        url: `${TMDB}/8LqG2N6j98lFGMpuYsRUAhOunSd.jpg`,
      },
      {
        id: "hw-3",
        name: "Gal Gadot",
        url: `${TMDB}/g55dgcZQkLMolkKqgP7OD2yfGXu.jpg`,
      },
      {
        id: "hw-4",
        name: "Zendaya",
        url: `${TMDB}/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg`,
      },
      {
        id: "hw-5",
        name: "Ana de Armas",
        url: `${TMDB}/tkBWBvcLTihUcVf6iwbMQTFqEEv.jpg`,
      },
      {
        id: "hw-6",
        name: "Florence Pugh",
        url: `${TMDB}/1Uvfh7xL4U2evkhs0M3C7BbBYFf.jpg`,
      },
      {
        id: "hw-7",
        name: "Emma Stone",
        url: `${TMDB}/6K21G4V1KTXQ0DtS0NkMmIanYaE.jpg`,
      },
      {
        id: "hw-8",
        name: "Sydney Sweeney",
        url: `${TMDB}/qYiaSl0Eb7G3VaxOg8PxExCFwon.jpg`,
      },
    ],
  },
  {
    label: "Trung Quốc",
    avatars: [
      {
        id: "cn-1",
        name: "Triệu Lệ Dĩnh",
        url: `${TMDB}/lDkliS0cwOFO0QA7epHYZJWNttG.jpg`,
      },
      {
        id: "cn-2",
        name: "Dương Mịch",
        url: `${TMDB}/lPQ9RgOj5hY5AYRJ8G1CedjdCGz.jpg`,
      },
      {
        id: "cn-3",
        name: "Lưu Diệc Phi",
        url: `${TMDB}/lucEre1rrypvclDkO4nFDKY1O9A.jpg`,
      },
      {
        id: "cn-4",
        name: "Phạm Băng Băng",
        url: `${TMDB}/pV2wYJiiPd6cgHK580PKD0GM4Dc.jpg`,
      },
      {
        id: "cn-5",
        name: "Địch Lệ Nhiệt Ba",
        url: `${TMDB}/bLa0rBHdZ4Su1l5Xh0cY4mTB70Z.jpg`,
      },
      {
        id: "cn-6",
        name: "Dương Tử",
        url: `${TMDB}/20Nc1xnRFC5XGsb896ZxVNUOzFU.jpg`,
      },
      {
        id: "cn-7",
        name: "Triệu Lộ Tư",
        url: `${TMDB}/y82wmaDqTdXqvtasb4kxAIuT44U.jpg`,
      },
      {
        id: "cn-8",
        name: "Bạch Lộc",
        url: `${TMDB}/aRcUVDRO2wewQe0NXJ0RfzSgvUa.jpg`,
      },
    ],
  },
  {
    label: "Hoạt Hình",
    avatars: [
      {
        id: "art-1",
        name: "Nala",
        url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Nala",
      },
      {
        id: "art-2",
        name: "Luna",
        url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna",
      },
      {
        id: "art-3",
        name: "Cleo",
        url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Cleo",
      },
      {
        id: "art-4",
        name: "Willow",
        url: "https://api.dicebear.com/9.x/adventurer/svg?seed=Willow",
      },
      {
        id: "art-5",
        name: "Pepper",
        url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Pepper",
      },
      {
        id: "art-6",
        name: "Milo",
        url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Milo",
      },
      {
        id: "art-7",
        name: "Felix",
        url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Felix",
      },
      {
        id: "art-8",
        name: "Jasper",
        url: "https://api.dicebear.com/9.x/lorelei/svg?seed=Jasper",
      },
    ],
  },
];

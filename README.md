# 🎬 MinyCine — Xem Phim Online Chất Lượng Cao

> Nền tảng xem phim trực tuyến hiện đại, xây dựng bằng **Next.js 16** & **React 19** với trải nghiệm mượt mà, giao diện tối sang trọng và tìm kiếm thông minh bằng AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-Private-red)

---

## ✨ Tính năng nổi bật

- 🎥 **Kho phim khổng lồ** — Phim lẻ, phim bộ, anime, phim chiếu rạp… từ API [OPhim](https://ophim1.com)
- 🔍 **Tìm kiếm AI (RAG)** — Tìm phim bằng mô tả tự nhiên, powered by **Gemini AI**
- 📺 **Trình phát HLS** — Xem phim chất lượng cao với thư viện `hls.js`
- 🔐 **Xác thực JWT** — Đăng ký, đăng nhập an toàn với Access + Refresh Token
- ❤️ **Yêu thích & Lịch sử xem** — Lưu phim yêu thích, theo dõi lịch sử xem
- 👤 **Hồ sơ người dùng** — Quản lý tài khoản với hệ thống avatar
- 🎭 **Chi tiết diễn viên** — Ảnh thật từ TMDb, thông tin phim liên quan
- 🏷️ **Bộ lọc nâng cao** — Lọc theo thể loại, quốc gia, năm, danh mục
- 🌙 **Dark Mode** — Giao diện tối mặc định, thiết kế sang trọng
- 📱 **Responsive** — Tương thích mọi thiết bị

---

## 🛠️ Công nghệ sử dụng

| Layer         | Công nghệ                                                                      |
| ------------- | ------------------------------------------------------------------------------ |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router)                                  |
| **UI**        | [React 19](https://react.dev) + [HeroUI](https://heroui.com)                   |
| **Styling**   | [Tailwind CSS v4](https://tailwindcss.com)                                     |
| **State**     | [Jotai](https://jotai.org)                                                     |
| **Data**      | [TanStack Query](https://tanstack.com/query) + [Axios](https://axios-http.com) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/)                                |
| **Database**  | [Neon PostgreSQL](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team) |
| **Auth**      | JWT (Access + Refresh) với [jose](https://github.com/panva/jose)               |
| **AI**        | [Gemini API](https://ai.google.dev) (RAG Search)                               |
| **Video**     | [hls.js](https://github.com/video-dev/hls.js)                                  |
| **Icons**     | [Lucide React](https://lucide.dev)                                             |
| **Font**      | [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro)             |

---

## 📁 Cấu trúc dự án

```
minycine/
├── app/                    # Next.js App Router
│   ├── (home)/             # Trang chủ
│   ├── api/                # API Routes
│   │   ├── ai/             #   ├── RAG Search (Gemini)
│   │   ├── auth/           #   ├── Login / Register / Refresh / Me
│   │   └── embed/          #   └── Embed endpoint
│   ├── dang-ky/            # Trang đăng ký
│   ├── dang-nhap/          # Trang đăng nhập
│   ├── danh-sach/          # Danh sách phim theo danh mục
│   ├── dien-vien/          # Chi tiết diễn viên
│   ├── ho-so/              # Hồ sơ người dùng
│   ├── lich-su-xem/        # Lịch sử xem
│   ├── nam/[year]          # Phim theo năm
│   ├── phim/[slug]         # Chi tiết phim
│   ├── phim-moi/           # Phim mới cập nhật
│   ├── quoc-gia/[slug]     # Phim theo quốc gia
│   ├── the-loai/[slug]     # Phim theo thể loại
│   ├── tim-kiem/           # Tìm kiếm
│   ├── xem/[slug]          # Xem phim (Player)
│   └── yeu-thich/          # Phim yêu thích
├── components/             # Shared components
│   ├── layout/             #   ├── Navbar, Footer, MainLayout
│   ├── movie/              #   ├── MovieCard, MovieGrid, Filter…
│   ├── player/             #   ├── HLS Video Player
│   └── ui/                 #   └── UI primitives
├── containers/             # Page-level containers (logic + UI)
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts         #   ├── Authentication hook
│   ├── use-favorites.ts    #   ├── Quản lý yêu thích
│   ├── use-movies.ts       #   ├── Fetch & filter phim
│   ├── use-rag-search.ts   #   ├── AI search hook
│   └── use-watch-history.ts#   └── Lịch sử xem
├── jotais/                 # Jotai atoms (global state)
├── lib/                    # Utilities & configs
│   ├── db/                 #   ├── Drizzle schema & connection
│   ├── auth.ts             #   ├── JWT helpers
│   └── api.ts              #   └── Axios instance
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── docs/                   # API documentation
```

---

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js** ≥ 18
- **Bun** (khuyến nghị) hoặc npm / yarn / pnpm
- Tài khoản [Neon](https://neon.tech) (PostgreSQL serverless)
- [Gemini API Key](https://aistudio.google.com/apikey) (cho tìm kiếm AI)

### 1. Clone & Cài đặt

```bash
git clone https://github.com/<your-username>/minycine.git
cd minycine
bun install
```

### 2. Cấu hình biến môi trường

Tạo file `.env` tại thư mục gốc:

```env
# API phim
NEXT_PUBLIC_API_URL='https://ophim1.com/v1/api'
NEXT_PUBLIC_IMG_URL='https://img.ophim.live/uploads/movies'
NEXT_PUBLIC_TMDB_IMAGE_URL='https://image.tmdb.org/t/p'

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# Auth — Đổi secret trước khi deploy!
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Khởi tạo Database

```bash
bunx drizzle-kit push
```

### 4. Chạy Development Server

```bash
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

---

## 📜 Scripts

| Lệnh                      | Mô tả                          |
| ------------------------- | ------------------------------ |
| `bun dev`                 | Chạy development server        |
| `bun run build`           | Build production               |
| `bun start`               | Chạy production server         |
| `bun run lint`            | Kiểm tra linting với ESLint    |
| `bun run check-types`     | Kiểm tra TypeScript types      |
| `bunx drizzle-kit push`   | Đồng bộ schema lên database    |
| `bunx drizzle-kit studio` | Mở Drizzle Studio (quản lý DB) |

---

## 🔗 API

MinyCine sử dụng API phim từ [OPhim](https://ophim1.com) với các endpoint chính:

- `GET /v1/api/danh-sach/{type}` — Danh sách phim theo loại
- `GET /v1/api/phim/{slug}` — Chi tiết phim
- `GET /v1/api/tim-kiem?keyword=` — Tìm kiếm phim
- `GET /v1/api/the-loai/{slug}` — Phim theo thể loại
- `GET /v1/api/quoc-gia/{slug}` — Phim theo quốc gia
- `GET /v1/api/nam/{year}` — Phim theo năm

Chi tiết đầy đủ tại thư mục `docs/api/`.

---

## 🤖 Tìm kiếm AI (RAG Search)

MinyCine tích hợp **Retrieval-Augmented Generation** sử dụng Gemini AI, cho phép người dùng tìm phim bằng mô tả tự nhiên:

> _"Phim Hàn Quốc về cặp đôi yêu nhau từ thời sinh viên"_
> → Trả về danh sách phim phù hợp nhất

---

## 📄 License

Dự án này là **private** và không được phân phối công khai.

---

<p align="center">
  Được xây dựng với ❤️ bởi <strong>ThangLB</strong>
</p>

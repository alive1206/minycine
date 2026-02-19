# OPhim API Document

> Nguồn chính thức: [https://ophim18.cc/api-document](https://ophim18.cc/api-document)

- **Base URL:** `https://ophim1.com`
- **Protocol:** REST, JSON, UTF-8
- **HTTP Method:** `GET`
- **Cập nhật mẫu JSON trong repo:** `2026-02-19` (UTC)

---

## 1. Bộ file JSON mẫu trong repo

| Endpoint | File mẫu |
|---|---|
| `GET /v1/api/home` | `docs/api/home.json` |
| `GET /v1/api/danh-sach/[slug]` | `docs/api/danh-sach-film.json` |
| `GET /v1/api/tim-kiem` | `docs/api/tim-kiem.json` |
| `GET /v1/api/the-loai` | `docs/api/the-loai.json` |
| `GET /v1/api/the-loai/[slug]` | `docs/api/the-loai-theo-slug.json` |
| `GET /v1/api/quoc-gia` | `docs/api/quoc-gia.json` |
| `GET /v1/api/quoc-gia/[slug]` | `docs/api/quoc-gia-theo-slug.json` |
| `GET /v1/api/nam-phat-hanh` | `docs/api/nam-phat-hanh.json` |
| `GET /v1/api/nam-phat-hanh/[year]` | `docs/api/nam-phat-hanh-theo-nam.json` |
| `GET /v1/api/phim/[slug]` | `docs/api/phim.json` |
| `GET /v1/api/phim/[slug]/images` | `docs/api/phim-images.json` |
| `GET /v1/api/phim/[slug]/keywords` | `docs/api/phim-keywords.json` |
| `GET /v1/api/phim/[slug]/peoples` | `docs/api/phim-peoples.json` |

File tổng hợp tương thích cũ:

- `docs/api/theloai-quocgia-nam.json`: gom payload mẫu cho nhóm endpoint `the-loai`, `quoc-gia`, `nam-phat-hanh`.

---

## 2. Endpoints chi tiết

### 2.1 Trang chủ

### `GET /v1/api/home`
Lấy dữ liệu phim hiển thị trang chủ.

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/home"
```

---

### 2.2 Danh sách phim theo bộ lọc

### `GET /v1/api/danh-sach/[slug]`
Lấy danh sách phim theo loại danh sách và các điều kiện lọc.

Params:

- `slug` (required): `phim-moi`, `phim-bo`, `phim-le`, `tv-shows`, `hoat-hinh`, ...
- `page` (optional, default `1`)
- `limit` (optional, default `24`)
- `sort_field` (optional): `modified.time`, `year`, `_id`
- `sort_type` (optional): `desc`, `asc`
- `category` (optional): nhiều slug, ngăn cách `,`
- `country` (optional): nhiều slug, ngăn cách `,`
- `year` (optional): năm phát hành

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/danh-sach/phim-moi?page=1&limit=24"
```

---

### 2.3 Tìm kiếm

### `GET /v1/api/tim-kiem?keyword=[keyword]`
Tìm kiếm phim theo từ khóa.

Params:

- `keyword` (required, tối thiểu 2 ký tự)
- `page` (optional, default `1`)
- `limit` (optional, default `24`)

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/tim-kiem?keyword=avengers&page=1&limit=24"
```

---

### 2.4 Thể loại

### `GET /v1/api/the-loai`
Lấy danh sách toàn bộ thể loại.

### `GET /v1/api/the-loai/[slug]`
Lấy danh sách phim theo thể loại.

Params endpoint `/the-loai/[slug]`:

- `slug` (required)
- `page` (optional)
- `limit` (optional)
- `sort_field` (optional)
- `sort_type` (optional)
- `country` (optional)
- `year` (optional)

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/the-loai"
curl -s "https://ophim1.com/v1/api/the-loai/hanh-dong?page=1&limit=24"
```

---

### 2.5 Quốc gia

### `GET /v1/api/quoc-gia`
Lấy danh sách toàn bộ quốc gia.

### `GET /v1/api/quoc-gia/[slug]`
Lấy danh sách phim theo quốc gia.

Params endpoint `/quoc-gia/[slug]`:

- `slug` (required)
- `page` (optional)
- `limit` (optional)
- `sort_field` (optional)
- `sort_type` (optional)
- `year` (optional)

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/quoc-gia"
curl -s "https://ophim1.com/v1/api/quoc-gia/trung-quoc?page=1&limit=24"
```

---

### 2.6 Năm phát hành

### `GET /v1/api/nam-phat-hanh`
Lấy danh sách các năm phát hành.

### `GET /v1/api/nam-phat-hanh/[year]`
Lấy danh sách phim theo năm phát hành.

Params endpoint `/nam-phat-hanh/[year]`:

- `year` (required)
- `page` (optional)
- `limit` (optional)
- `sort_field` (optional)
- `sort_type` (optional)
- `category` (optional)
- `country` (optional)

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/nam-phat-hanh"
curl -s "https://ophim1.com/v1/api/nam-phat-hanh/2026?page=1&limit=24"
```

---

### 2.7 Phim

### `GET /v1/api/phim/[slug]`
Lấy chi tiết phim, kèm danh sách tập/servers.

### `GET /v1/api/phim/[slug]/images`
Lấy danh sách ảnh (poster/backdrop) từ TMDB.

### `GET /v1/api/phim/[slug]/keywords`
Lấy từ khóa phim từ TMDB.

### `GET /v1/api/phim/[slug]/peoples`
Lấy thông tin diễn viên/đạo diễn từ TMDB.

Params cho toàn bộ endpoint nhóm phim:

- `slug` (required)

Ví dụ:

```bash
curl -s "https://ophim1.com/v1/api/phim/cross-phan-2"
curl -s "https://ophim1.com/v1/api/phim/cross-phan-2/images"
curl -s "https://ophim1.com/v1/api/phim/cross-phan-2/keywords"
curl -s "https://ophim1.com/v1/api/phim/cross-phan-2/peoples"
```

---

## 3. Response format (thực tế)

### 3.1 Nhóm list/search/detail chuẩn

Các endpoint:

- `/v1/api/home`
- `/v1/api/danh-sach/[slug]`
- `/v1/api/tim-kiem`
- `/v1/api/the-loai`
- `/v1/api/the-loai/[slug]`
- `/v1/api/quoc-gia`
- `/v1/api/quoc-gia/[slug]`
- `/v1/api/nam-phat-hanh`
- `/v1/api/nam-phat-hanh/[year]`
- `/v1/api/phim/[slug]`

Có dạng chung:

```json
{
  "status": "success",
  "message": "...",
  "data": { ... }
}
```

### 3.2 Nhóm metadata TMDB (images/keywords/peoples)

Các endpoint:

- `/v1/api/phim/[slug]/images`
- `/v1/api/phim/[slug]/keywords`
- `/v1/api/phim/[slug]/peoples`

Có dạng chung:

```json
{
  "success": true,
  "status_code": 200,
  "message": "...",
  "data": { ... }
}
```

---

## 4. Ghi chú

- Đây là tài liệu nội bộ đã đồng bộ theo endpoint và schema từ `ophim18.cc/api-document`.
- Payload thực tế có thể thay đổi theo thời gian (số lượng phim, slug, metadata TMDB), nên các file JSON trong `docs/api/` là snapshot tại thời điểm cập nhật.

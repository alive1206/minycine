"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardBody } from "@heroui/react";
import {
  Bell,
  ArrowLeft,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Eye,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

const ITEMS_PER_PAGE = 20;

const getImageUrl = (url: string): string => {
  if (!url) return "/placeholder-poster.jpg";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMG_URL}/${url}`;
};

function timeAgo(ts: number): string {
  if (!ts || isNaN(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 0) return "Vừa xong";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

export const NotificationsPage = () => {
  const { items, unreadCount, markRead, markAllRead, dismiss, clearAll } =
    useNotifications();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paged = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          as={Link}
          href="/ho-so"
          isIconOnly
          variant="light"
          className="text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-white">
          Thông Báo ({items.length})
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<CheckCheck className="w-3.5 h-3.5" />}
              onPress={markAllRead}
            >
              Đọc tất cả
            </Button>
          )}
          {items.length > 0 && (
            <Button
              size="sm"
              variant="flat"
              color="danger"
              startContent={<Trash2 className="w-3.5 h-3.5" />}
              onPress={clearAll}
            >
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border border-white/10 bg-content1/80 backdrop-blur-xl">
          <CardBody className="flex flex-col items-center justify-center py-20 gap-4">
            <Bell className="w-16 h-16 text-gray-600" />
            <p className="text-gray-400 text-center">
              Không có thông báo nào.
            </p>
            <Button as={Link} href="/" color="primary" variant="flat">
              Khám phá phim
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {paged.map((notif) => (
              <Link
                key={notif.id}
                href={`/xem/${notif.slug}?tap=${notif.episodeSlug}`}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-white/5 ${
                  notif.read
                    ? "border-white/5 opacity-60"
                    : "border-l-primary border-l-2 border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 relative bg-[#1A1A1A]">
                  <Image
                    src={getImageUrl(notif.posterUrl)}
                    alt={notif.movieName}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                    {notif.movieName}
                  </p>
                  <p className="text-xs text-primary mt-0.5">
                    {notif.latestEpisode} đã cập nhật
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timeAgo(notif.updatedTime)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markRead(notif.id);
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                      title="Đánh dấu đã đọc"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dismiss(notif.id);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                className="border-white/10"
                isDisabled={page <= 1}
                onPress={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "solid" : "bordered"}
                  color={p === page ? "primary" : "default"}
                  className={p !== page ? "border-white/10" : ""}
                  onPress={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                isIconOnly
                size="sm"
                variant="bordered"
                className="border-white/10"
                isDisabled={page >= totalPages}
                onPress={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

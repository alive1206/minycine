"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Input,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Calendar,
  LogOut,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Check,
  Heart,
  Clock,
  Trash2,
  Play,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchHistory } from "@/hooks/use-watch-history";
import { useEffect, useState } from "react";
import { AVATAR_CATEGORIES } from "@/lib/system-avatars";

const inputClassNames = {
  inputWrapper: "border-white/10 hover:border-white/20",
  input: "placeholder:text-white/20",
  label: "text-default-500",
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const FavoritesSection = () => {
  const { items, removeItem } = useFavorites();

  if (!items.length) return null;

  return (
    <Card className="mt-4 border border-white/10 bg-content1/80 backdrop-blur-xl">
      <CardHeader className="px-8 pt-6 pb-0">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold">Yêu thích ({items.length})</h2>
        </div>
      </CardHeader>
      <CardBody className="px-8 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map((fav) => (
            <div key={fav.slug} className="group relative">
              <Link href={`/phim/${fav.slug}`}>
                <div className="aspect-2/3 rounded-lg overflow-hidden bg-[#1A1A1A] relative">
                  <Image
                    src={fav.posterUrl || fav.thumbUrl}
                    alt={fav.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white font-medium truncate">
                      {fav.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{fav.year}</p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => removeItem(fav.slug)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const WatchHistorySection = () => {
  const { items, removeItem, clearAll } = useWatchHistory();

  if (!items.length) return null;

  return (
    <Card className="mt-4 border border-white/10 bg-content1/80 backdrop-blur-xl">
      <CardHeader className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Lịch sử xem ({items.length})
            </h2>
          </div>
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={clearAll}
            startContent={<Trash2 className="w-3 h-3" />}
          >
            Xóa tất cả
          </Button>
        </div>
      </CardHeader>
      <CardBody className="px-8 py-6">
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const progress =
              item.duration > 0
                ? Math.min((item.currentTime / item.duration) * 100, 100)
                : 0;
            const remaining = Math.max(
              0,
              Math.floor(item.duration - item.currentTime),
            );

            return (
              <div
                key={`${item.movieSlug}-${item.episodeSlug}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                {/* Poster */}
                <Link
                  href={`/xem/${item.movieSlug}?tap=${item.episodeSlug}`}
                  className="shrink-0 w-24 aspect-video rounded-md overflow-hidden relative bg-[#1A1A1A]"
                >
                  {item.posterUrl && (
                    <Image
                      src={item.posterUrl}
                      alt={item.movieName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/xem/${item.movieSlug}?tap=${item.episodeSlug}`}>
                    <p className="text-sm font-medium text-white truncate hover:text-primary transition-colors">
                      {item.movieName}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {item.episodeName} • Còn {formatTime(remaining)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.movieSlug)}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export const ProfilePage = () => {
  const router = useRouter();
  const { user, isLoading, logout, accessToken } = useAuth();

  // Profile editing
  const [name, setName] = useState(user?.name ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar ?? "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/dang-nhap");
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = async () => {
    if (!accessToken) return;
    setProfileSaving(true);
    setProfileMsg("");

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, avatar: selectedAvatar || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfileMsg("Cập nhật hồ sơ thành công!");
      setIsEditingProfile(false);
      window.location.reload();
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setPwError("");
    setPwMsg("");

    if (!currentPassword) {
      setPwError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!newPassword) {
      setPwError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (!confirmPassword) {
      setPwError("Vui lòng xác nhận mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Mật khẩu xác nhận không khớp");
      return;
    }

    setPwSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPwMsg("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* ─── Header Card ─────────────────────────────── */}
      <Card className="border border-white/10 bg-content1/80 backdrop-blur-xl">
        <CardBody className="p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <Avatar
              name={user.name.charAt(0).toUpperCase()}
              src={selectedAvatar || user.avatar || undefined}
              classNames={{
                base: `${selectedAvatar || user.avatar ? "bg-transparent" : "bg-primary"} w-20 h-20 ring-4 ring-primary/20`,
                name: "text-white font-bold text-2xl",
              }}
            />

            <div className="flex flex-1 flex-col items-center gap-1 sm:items-start">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-default-500">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-default-400">
                <Calendar className="h-3 w-3" />
                <span>Tham gia {joinDate}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─── Profile Edit Card ────────────────────────── */}
      <Card className="mt-4 border border-white/10 bg-content1/80 backdrop-blur-xl">
        <CardHeader className="px-8 pt-6 pb-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Thông tin tài khoản</h2>
          </div>
        </CardHeader>

        <CardBody className="px-8 py-6">
          <div className="flex flex-col gap-5">
            <Input
              label="Tên hiển thị"
              value={name}
              onValueChange={setName}
              variant="bordered"
              labelPlacement="outside"
              isReadOnly={!isEditingProfile}
              classNames={{
                ...inputClassNames,
                inputWrapper: isEditingProfile
                  ? "border-primary/50 hover:border-primary"
                  : inputClassNames.inputWrapper,
              }}
            />

            {/* Avatar Picker with Tabs */}
            {isEditingProfile && (
              <div>
                <p className="mb-3 text-sm text-default-500">Chọn avatar</p>
                <Tabs
                  variant="underlined"
                  color="primary"
                  classNames={{
                    tabList: "border-b border-white/10",
                    cursor: "bg-primary",
                    tab: "text-default-400 data-[selected=true]:text-white",
                  }}
                >
                  {AVATAR_CATEGORIES.map((cat) => (
                    <Tab key={cat.label} title={cat.label}>
                      <div className="grid grid-cols-4 gap-3 pt-4">
                        {cat.avatars.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.url)}
                            className={`group relative overflow-hidden rounded-full ring-2 transition-all ${
                              selectedAvatar === av.url
                                ? "ring-primary scale-105"
                                : "ring-white/10 hover:ring-white/30"
                            }`}
                          >
                            <Avatar
                              src={av.url}
                              name={av.name}
                              classNames={{
                                base: "w-full h-full aspect-square",
                              }}
                            />
                            {selectedAvatar === av.url && (
                              <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {av.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </div>
            )}

            {profileMsg && (
              <p
                className={`text-sm ${profileMsg.includes("thành công") ? "text-success" : "text-danger"}`}
              >
                {profileMsg}
              </p>
            )}

            {isEditingProfile ? (
              <div className="flex gap-3">
                <Button
                  color="primary"
                  className="font-semibold"
                  isLoading={profileSaving}
                  onPress={handleSaveProfile}
                >
                  Lưu thay đổi
                </Button>
                <Button
                  variant="bordered"
                  className="border-white/10 font-semibold text-default-400"
                  onPress={() => {
                    setName(user.name);
                    setSelectedAvatar(user.avatar ?? "");
                    setIsEditingProfile(false);
                    setProfileMsg("");
                  }}
                >
                  Hủy
                </Button>
              </div>
            ) : (
              <Button
                variant="bordered"
                className="w-fit border-white/10 font-semibold text-white hover:border-white/30"
                onPress={() => setIsEditingProfile(true)}
              >
                Chỉnh sửa hồ sơ
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ─── Change Password Card ─────────────────────── */}
      <Card className="mt-4 border border-white/10 bg-content1/80 backdrop-blur-xl">
        <CardHeader className="px-8 pt-6 pb-0">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
          </div>
        </CardHeader>

        <CardBody className="px-8 py-6">
          <form
            onSubmit={handleChangePassword}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Mật khẩu hiện tại"
              type={showCurrentPw ? "text" : "password"}
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onValueChange={setCurrentPassword}
              isRequired
              variant="bordered"
              labelPlacement="outside"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="text-default-400 hover:text-default-600"
                >
                  {showCurrentPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              classNames={inputClassNames}
            />

            <Input
              label="Mật khẩu mới"
              type={showNewPw ? "text" : "password"}
              placeholder="Ít nhất 6 ký tự"
              value={newPassword}
              onValueChange={setNewPassword}
              isRequired
              variant="bordered"
              labelPlacement="outside"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="text-default-400 hover:text-default-600"
                >
                  {showNewPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              classNames={inputClassNames}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type={showNewPw ? "text" : "password"}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              isRequired
              variant="bordered"
              labelPlacement="outside"
              classNames={inputClassNames}
            />

            {pwError && <p className="text-sm text-danger">{pwError}</p>}
            {pwMsg && <p className="text-sm text-success">{pwMsg}</p>}

            <Button
              type="submit"
              color="primary"
              variant="bordered"
              className="w-fit font-semibold"
              isLoading={pwSaving}
            >
              Đổi mật khẩu
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* ─── Favorites Card ─────────────────────────────── */}
      <FavoritesSection />

      {/* ─── Watch History Card ─────────────────────────── */}
      <WatchHistorySection />

      {/* ─── Logout Card ──────────────────────────────── */}
      <Card className="mt-4 border border-primary/20 bg-content1/80 backdrop-blur-xl">
        <CardBody className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Đăng xuất</h3>
              <p className="text-xs text-default-400">
                Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng
              </p>
            </div>
            <Button
              color="primary"
              variant="bordered"
              startContent={<LogOut className="h-4 w-4" />}
              className="font-semibold"
              onPress={handleLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

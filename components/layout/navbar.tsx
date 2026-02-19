"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Avatar,
} from "@heroui/react";
import {
  Search,
  ChevronDown,
  User,
  Loader2,
  LogOut,
  Heart,
  Clock,
  XIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useGenreList, useCountryList, useYearList } from "@/hooks/use-movies";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { name: "Trang Chủ", href: "/" },
  { name: "Phim Lẻ", href: "/danh-sach/phim-le" },
  { name: "Phim Bộ", href: "/danh-sach/phim-bo" },
  { name: "Phim Mới", href: "/phim-moi" },
  { name: "TV Shows", href: "/danh-sach/tv-shows" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  // Fetch taxonomy data from API
  const { data: genreData, isLoading: loadingGenres } = useGenreList();
  const { data: countryData, isLoading: loadingCountries } = useCountryList();
  const { data: yearData, isLoading: loadingYears } = useYearList();

  const genres = genreData?.data?.items || [];
  const countries = countryData?.data?.items || [];
  const years = (yearData?.data?.items || []).map((item) => ({
    name: `${item.year}`,
    slug: `${item.year}`,
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(
        `/tim-kiem?keyword=${encodeURIComponent(searchValue.trim())}`,
      );
      setSearchValue("");
      setShowMobileSearch(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <HeroNavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      isBordered
      classNames={{
        base: "bg-black/80 backdrop-blur-xl border-b border-white/10",
        wrapper: "px-4 md:px-10",
        item: "data-[active=true]:text-primary",
      }}
    >
      {/* Mobile toggle */}
      <NavbarContent className="lg:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      {/* Brand */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <Logo size="lg" />
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop nav links */}
      <NavbarContent className="hidden lg:flex gap-6" justify="center">
        {navLinks.map((link) => (
          <NavbarItem key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          </NavbarItem>
        ))}

        {/* Genre dropdown */}
        <Dropdown
          classNames={{
            content:
              "bg-[#1A1A1A] border border-white/10 max-h-80 overflow-y-auto custom-scrollbar",
          }}
        >
          <NavbarItem>
            <DropdownTrigger>
              <Button
                variant="light"
                className="text-sm font-medium text-gray-300 hover:text-white data-[hover=true]:bg-transparent p-0 min-w-0 h-auto"
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                Thể Loại
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Thể loại"
            className="max-h-72 overflow-y-auto custom-scrollbar"
            itemClasses={{
              base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
            }}
          >
            {loadingGenres
              ? [
                  <DropdownItem key="loading" isReadOnly>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </DropdownItem>,
                ]
              : genres.map((genre) => (
                  <DropdownItem
                    key={genre.slug}
                    href={`/the-loai/${genre.slug}`}
                  >
                    {genre.name}
                  </DropdownItem>
                ))}
          </DropdownMenu>
        </Dropdown>

        {/* Country dropdown */}
        <Dropdown
          classNames={{
            content:
              "bg-[#1A1A1A] border border-white/10 max-h-80 overflow-y-auto custom-scrollbar",
          }}
        >
          <NavbarItem>
            <DropdownTrigger>
              <Button
                variant="light"
                className="text-sm font-medium text-gray-300 hover:text-white data-[hover=true]:bg-transparent p-0 min-w-0 h-auto"
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                Quốc Gia
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Quốc gia"
            className="max-h-72 overflow-y-auto custom-scrollbar"
            itemClasses={{
              base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
            }}
          >
            {loadingCountries
              ? [
                  <DropdownItem key="loading" isReadOnly>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </DropdownItem>,
                ]
              : countries.map((country) => (
                  <DropdownItem
                    key={country.slug}
                    href={`/quoc-gia/${country.slug}`}
                  >
                    {country.name}
                  </DropdownItem>
                ))}
          </DropdownMenu>
        </Dropdown>

        {/* Year dropdown */}
        <Dropdown
          classNames={{
            content:
              "bg-[#1A1A1A] border border-white/10 max-h-80 overflow-y-auto custom-scrollbar",
          }}
        >
          <NavbarItem>
            <DropdownTrigger>
              <Button
                variant="light"
                className="text-sm font-medium text-gray-300 hover:text-white data-[hover=true]:bg-transparent p-0 min-w-0 h-auto"
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                Năm
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Năm phát hành"
            className="max-h-72 overflow-y-auto custom-scrollbar"
            itemClasses={{
              base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
            }}
          >
            {loadingYears
              ? [
                  <DropdownItem key="loading" isReadOnly>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </DropdownItem>,
                ]
              : years.map((year) => (
                  <DropdownItem key={year.slug} href={`/nam/${year.slug}`}>
                    {year.name}
                  </DropdownItem>
                ))}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* Right side: search + auth */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden md:flex">
          <form onSubmit={handleSearch}>
            <Input
              classNames={{
                base: "w-64",
                inputWrapper:
                  "bg-black/40 border border-white/20 group-data-[focus=true]:border-white/60 rounded-full h-10",
                input: "text-sm text-white placeholder:text-gray-500",
              }}
              placeholder="Tìm tên phim, diễn viên..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              type="search"
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </form>
        </NavbarItem>
        <NavbarItem className="md:hidden">
          <Button
            isIconOnly
            variant="light"
            className="text-white"
            onPress={() => setShowMobileSearch((v) => !v)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </NavbarItem>

        {/* Auth section */}
        <NavbarItem>
          {authLoading ? (
            <Skeleton className="rounded-full">
              <div className="h-9 w-9" />
            </Skeleton>
          ) : user ? (
            <Dropdown
              classNames={{
                content: "bg-[#1A1A1A] border border-white/10",
              }}
            >
              <DropdownTrigger>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar
                    name={user.name.charAt(0).toUpperCase()}
                    size="sm"
                    classNames={{
                      base: `${user.avatar ? "bg-transparent" : "bg-primary"} cursor-pointer ring-2 ring-primary/30 hover:ring-primary/60 transition-all`,
                      name: "text-white font-bold text-sm",
                    }}
                    src={user.avatar || undefined}
                  />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                itemClasses={{
                  base: "text-gray-300 data-[hover=true]:text-white data-[hover=true]:bg-white/5",
                }}
              >
                <DropdownItem key="info" isReadOnly className="opacity-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  startContent={<User className="w-4 h-4" />}
                  href="/ho-so"
                >
                  Hồ sơ
                </DropdownItem>
                <DropdownItem
                  key="favorites"
                  startContent={<Heart className="w-4 h-4" />}
                  href="/yeu-thich"
                >
                  Yêu thích
                </DropdownItem>
                <DropdownItem
                  key="history"
                  startContent={<Clock className="w-4 h-4" />}
                  href="/lich-su-xem"
                >
                  Xem tiếp
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-primary"
                  color="primary"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleLogout}
                >
                  Đăng xuất
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              as={Link}
              href="/dang-nhap"
              color="primary"
              className="font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              startContent={<User className="w-4 h-4" />}
            >
              Đăng Nhập
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="absolute top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl z-50 flex items-center px-3 gap-2 md:hidden">
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              autoFocus
              classNames={{
                inputWrapper:
                  "bg-white/10 border border-white/20 rounded-full h-10",
                input: "text-sm text-white placeholder:text-gray-500",
              }}
              placeholder="Tìm tên phim, diễn viên..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              type="search"
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </form>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="text-white shrink-0"
            onPress={() => {
              setShowMobileSearch(false);
              setSearchValue("");
            }}
          >
            <span className="text-sm font-medium">
              <XIcon />
            </span>
          </Button>
        </div>
      )}

      {/* Mobile menu */}
      <NavbarMenu className="bg-[#0D0D0D]/95 backdrop-blur-xl pt-6 overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => (
          <NavbarMenuItem key={link.href}>
            <Link
              href={link.href}
              className="w-full text-lg text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {/* Mobile: Genres */}
        <NavbarMenuItem>
          <span className="text-lg text-gray-300 font-bold mt-4 block">
            Thể Loại
          </span>
          <div className="flex flex-wrap gap-2 mt-2 max-w-full overflow-hidden">
            {loadingGenres
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="rounded-full">
                    <div className="h-7 w-20" />
                  </Skeleton>
                ))
              : genres.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/the-loai/${genre.slug}`}
                    className="text-sm text-gray-400 hover:text-primary px-3 py-1 bg-white/5 rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {genre.name}
                  </Link>
                ))}
          </div>
        </NavbarMenuItem>

        {/* Mobile: Countries */}
        <NavbarMenuItem>
          <span className="text-lg text-gray-300 font-bold mt-4 block">
            Quốc Gia
          </span>
          <div className="flex flex-wrap gap-2 mt-2 max-w-full overflow-hidden">
            {loadingCountries
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="rounded-full">
                    <div className="h-7 w-20" />
                  </Skeleton>
                ))
              : countries.map((country) => (
                  <Link
                    key={country.slug}
                    href={`/quoc-gia/${country.slug}`}
                    className="text-sm text-gray-400 hover:text-primary px-3 py-1 bg-white/5 rounded-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {country.name}
                  </Link>
                ))}
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
};

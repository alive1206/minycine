"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const LoginPage = () => {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (!isLoading && user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassNames = {
    inputWrapper: "border-white/10 hover:border-white/20",
    input: "placeholder:text-white/20",
    label: "text-default-500",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border border-white/10 bg-content1/80 backdrop-blur-xl">
        <CardHeader className="flex flex-col items-center gap-2 pb-0 pt-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Đăng Nhập</h1>
          <p className="text-sm text-default-500">Chào mừng trở lại MinyCine</p>
        </CardHeader>

        <CardBody className="px-8 py-6">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {error && (
              <div className="rounded-xl bg-danger-50/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              variant="bordered"
              labelPlacement="outside"
              classNames={inputClassNames}
            />

            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-default-400 hover:text-default-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              isRequired
              variant="bordered"
              labelPlacement="outside"
              classNames={inputClassNames}
            />

            <Button
              type="submit"
              className="mt-2 font-semibold shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
              color="primary"
              size="lg"
              isLoading={isSubmitting}
              fullWidth
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-default-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/dang-ky"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

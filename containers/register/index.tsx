"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const RegisterPage = () => {
  const router = useRouter();
  const { register, user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!name.trim()) {
      setError("Vui lòng nhập tên hiển thị");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    if (!confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, name, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
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
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Đăng Ký</h1>
          <p className="text-sm text-default-500">
            Tạo tài khoản MinyCine miễn phí
          </p>
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
              label="Tên hiển thị"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onValueChange={setName}
              isRequired
              variant="bordered"
              labelPlacement="outside"
              classNames={inputClassNames}
            />

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
              placeholder="Ít nhất 6 ký tự"
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

            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
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
              {isSubmitting ? "Đang tạo tài khoản..." : "Đăng Ký"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-default-500">
            Đã có tài khoản?{" "}
            <Link
              href="/dang-nhap"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Đăng nhập
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

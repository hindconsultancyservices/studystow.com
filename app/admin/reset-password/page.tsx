import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

function ResetPasswordLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-sm text-gray-500">
        Loading password reset...
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

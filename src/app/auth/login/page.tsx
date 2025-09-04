import { LoginForm } from "@/components/login-form";
import { BackButton } from "@/components/back-button";

interface SearchParams {
  redirectTo?: string;
  from?: string;
}

export default function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const redirectTo = searchParams?.redirectTo || "/";

  return (
    <div className="flex min-h-svh w-full flex-col p-6 md:p-10">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <BackButton fallbackHref="/" />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}

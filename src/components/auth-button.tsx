import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

interface AuthButtonProps {
  redirectTo?: string;
}

export async function AuthButton({ redirectTo }: AuthButtonProps = {}) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const loginUrl = redirectTo 
    ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
    : '/auth/login';
    
  const signUpUrl = redirectTo 
    ? `/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`
    : '/auth/sign-up';

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href={loginUrl}>Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href={signUpUrl}>Sign up</Link>
      </Button>
    </div>
  );
}
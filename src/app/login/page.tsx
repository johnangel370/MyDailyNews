import { LoginBackground } from "@/components/login/login-background";
import { ModeToggle } from "@/components/common/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginSearchParams = { next?: string; error?: string };

export default function LoginPage({
  searchParams,
}: {
  searchParams?: LoginSearchParams;
}) {
  const next = searchParams?.next || "/";
  const hasError = searchParams?.error === "1";

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <LoginBackground />
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <Card variant="glass" className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-newspaper text-2xl font-black">Daily AI Briefing</CardTitle>
          <CardDescription>Enter the password to view the archive.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/login" method="POST" className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              className="bg-background/60"
            />
            {hasError && (
              <p className="text-sm text-destructive">Incorrect password.</p>
            )}
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

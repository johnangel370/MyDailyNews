import { LoginBackground } from "@/components/login/login-background";
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
      <Card className="w-full max-w-sm border-border/60 bg-card/80 shadow-xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="font-display text-xl">Daily AI Briefing</CardTitle>
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

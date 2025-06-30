import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatabaseTest from "@/components/DatabaseTest";
import AuthSection from "@/components/AuthSection";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Road.io</h1>
          <p className="text-xl text-muted-foreground">
            Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Neon PostgreSQL + Clerk Auth
          </p>
        </div>

        <AuthSection />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Demo Form</CardTitle>
              <CardDescription>
                A sample form using shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                What&apos;s included in this setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  ✅ Next.js 15 with App Router
                </li>
                <li className="flex items-center gap-2">
                  ✅ React 19 with TypeScript
                </li>
                <li className="flex items-center gap-2">
                  ✅ Tailwind CSS v4
                </li>
                <li className="flex items-center gap-2">
                  ✅ shadcn/ui components
                </li>
                <li className="flex items-center gap-2">
                  ✅ Clerk Authentication
                </li>
                <li className="flex items-center gap-2">
                  ✅ Neon PostgreSQL Database
                </li>
                <li className="flex items-center gap-2">
                  ✅ Drizzle ORM
                </li>
                <li className="flex items-center gap-2">
                  ✅ ESLint configuration
                </li>
                <li className="flex items-center gap-2">
                  ✅ Turbopack for fast development
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DatabaseTest />

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Get Started</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="default">Start Building</Button>
            <Button variant="outline">View Components</Button>
            <Button variant="secondary">Documentation</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

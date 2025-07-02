"use client";
import { useState, useTransition } from "react";
import { verifyTenantIsolationAction } from "@/lib/actions/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TenantIsolationCheck() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const verify = () => {
    start(async () => {
      const res = await verifyTenantIsolationAction();
      if (res.crossOrgLoadAssignments > 0) {
        setResult(
          `Found ${res.crossOrgLoadAssignments} cross-organization load assignments`,
        );
      } else {
        setResult("No cross-organization data found");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Isolation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" onClick={verify} disabled={pending}>
          {pending ? "Checking..." : "Verify Isolation"}
        </Button>
        {result && <p className="text-sm text-muted-foreground">{result}</p>}
      </CardContent>
    </Card>
  );
}

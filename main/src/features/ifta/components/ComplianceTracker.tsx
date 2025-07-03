import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listIftaAuditResponses } from "@/lib/fetchers/ifta";

interface Props {
  orgId: number;
}

export default async function ComplianceTracker({ orgId }: Props) {
  const responses = await listIftaAuditResponses(orgId);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Responses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {responses.length === 0 ? (
          <p className="text-muted-foreground">No responses</p>
        ) : (
          responses.map((r) => (
            <div key={r.id}>
              {r.question} - {r.response || "Pending"}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

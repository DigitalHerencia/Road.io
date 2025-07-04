import { calculateSmsScore } from '@/lib/actions/compliance';

interface Props {
  orgId: number;
}

export default async function SmsSummary({ orgId }: Props) {
  const summary = await calculateSmsScore(orgId);
  return (
    <div className="text-sm space-y-1">
      <p>Accidents: {summary.accidents}</p>
      <p>HOS Violations: {summary.violations}</p>
      <p className="font-medium">SMS Score: {summary.score}</p>
    </div>
  );
}

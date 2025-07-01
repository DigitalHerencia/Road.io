import LoadForm from '@/features/dispatch/components/LoadForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewLoadPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Load</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadForm />
        </CardContent>
      </Card>
    </div>
  );
}

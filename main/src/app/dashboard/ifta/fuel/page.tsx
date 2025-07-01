import { requirePermission } from "@/lib/rbac";
import { getFuelPurchasesByOrg } from "@/lib/fetchers/ifta";
import FuelPurchaseForm from "@/features/ifta/FuelPurchaseForm";
import FuelCardImportForm from "@/features/ifta/FuelCardImportForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function FuelPage() {
  const user = await requirePermission("org:driver:log_fuel_purchase");
  const purchases = await getFuelPurchasesByOrg(user.orgId);
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Fuel Purchase</CardTitle>
            <CardDescription>Manual fuel entry</CardDescription>
          </CardHeader>
          <CardContent>
            <FuelPurchaseForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Import Fuel Card</CardTitle>
            <CardDescription>Upload CSV from card provider</CardDescription>
          </CardHeader>
          <CardContent>
            <FuelCardImportForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No purchases logged
              </p>
            ) : (
              purchases.map((p) => (
                <div key={p.id} className="text-sm">
                  {p.purchaseDate.toISOString().slice(0, 10)} -{" "}
                  {p.quantity ?? 0} gal @ {(p.pricePerUnit ?? 0) / 100}c -{" "}
                  {p.state}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

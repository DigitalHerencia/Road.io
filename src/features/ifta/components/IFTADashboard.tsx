import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TripLogger from "./TripLogger";
import FuelPurchaseForm from "../FuelPurchaseForm";
import ReportGenerator from "./ReportGenerator";
import JurisdictionManager from "./JurisdictionManager";
import ReceiptProcessor from "./ReceiptProcessor";
import TaxCalculator from "./TaxCalculator";
import ComplianceTracker from "./ComplianceTracker";
import { getIftaOverview } from "@/lib/fetchers/ifta";
import { requirePermission } from "@/lib/rbac";

export default async function IFTADashboard() {
  const user = await requirePermission("org:driver:record_trip");
  const metrics = await getIftaOverview(user.orgId);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Trips</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{metrics.totalTrips}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Gallons</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{metrics.totalFuel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">${(metrics.totalCost / 100).toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{metrics.reports}</CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <TripLogger driverId={parseInt(user.id)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Log Fuel Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <FuelPurchaseForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportGenerator />
          </CardContent>
        </Card>
        <JurisdictionManager />
        <Card>
          <CardHeader>
            <CardTitle>Process Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptProcessor />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <TaxCalculator />
          </CardContent>
        </Card>
        <ComplianceTracker orgId={user.orgId} />
      </div>
    </div>
  );
}

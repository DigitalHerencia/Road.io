import { getCompanyProfile } from '@/lib/fetchers/settings';
import { updateCompanyProfileAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default async function CompanyProfileForm() {
  const profile = await getCompanyProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>Manage basic company information</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateCompanyProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" defaultValue={profile?.companyName ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalEntity">Legal Entity</Label>
            <Input id="legalEntity" name="legalEntity" defaultValue={profile?.legalEntity ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dotNumber">DOT Number</Label>
            <Input id="dotNumber" name="dotNumber" defaultValue={profile?.dotNumber ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usdotStatus">USDOT Status</Label>
            <Input id="usdotStatus" name="usdotStatus" defaultValue={profile?.usdotStatus ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ein">Federal Tax ID (EIN)</Label>
            <Input id="ein" name="ein" defaultValue={profile?.ein ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessHoursOpen">Business Hours Open</Label>
            <Input id="businessHoursOpen" name="businessHoursOpen" defaultValue={profile?.businessHours?.default?.open ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessHoursClose">Business Hours Close</Label>
            <Input id="businessHoursClose" name="businessHoursClose" defaultValue={profile?.businessHours?.default?.close ?? ''} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
        <CardDescription>Manage organization information</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateCompanyProfileAction} className="space-y-4" encType="multipart/form-data">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" defaultValue={profile?.companyName ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalEntity">Legal Entity</Label>
            <Input id="legalEntity" name="legalEntity" defaultValue={profile?.legalEntity ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={profile?.address ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dotNumber">DOT Number</Label>
            <Input id="dotNumber" name="dotNumber" defaultValue={profile?.dotNumber ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mcNumber">MC Number</Label>
            <Input id="mcNumber" name="mcNumber" defaultValue={profile?.mcNumber ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="operatingAuthority">Operating Authority</Label>
            <Input id="operatingAuthority" name="operatingAuthority" defaultValue={profile?.operatingAuthority ?? ''} />
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
          {profile?.logoUrl && (
            <div className="space-y-2">
              <Label>Current Logo</Label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.logoUrl} alt="Company logo" className="h-12" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" name="logo" type="file" />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}

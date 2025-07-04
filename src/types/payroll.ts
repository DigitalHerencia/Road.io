export interface PayStatement {
  id: number
  orgId: number
  driverId: number
  periodStart: Date
  periodEnd: Date
  miles: number
  ratePerMile: number
  perDiem: number
  benefitsDeduction: number
  grossPay: number
  netPay: number
  createdAt: Date
}

export interface DriverBenefit {
  id: number
  orgId: number
  driverId: number
  type: string
  amount: number
  createdAt: Date
}

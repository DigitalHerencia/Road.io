export interface TrainingProgram {
  id: number
  orgId: number
  title: string
  description: string | null
  startDate: Date | null
  endDate: Date | null
  createdById: number | null
  createdAt: Date
}

export interface DriverTrainingRecord {
  id: number
  orgId: number
  driverId: number
  programId: number
  status: 'ASSIGNED' | 'COMPLETED'
  scheduledAt: Date | null
  completedAt: Date | null
  createdAt: Date
}

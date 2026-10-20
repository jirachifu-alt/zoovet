export interface DatabaseOperationResponse {
  success: boolean;
  message: string;
  scriptName: string;
  timestamp: string;
  totalUsers: number;
  totalPets: number;
  totalAppointments: number;
  totalMedicalRecords: number;
  totalVaccines: number;
}

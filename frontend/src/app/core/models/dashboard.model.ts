import { Appointment } from './appointment.model';
import { Pet } from './pet.model';

export interface DashboardStats {
  totalPets: number;
  totalClients: number;
  totalVeterinarians: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  totalMedicalRecords: number;
  totalVaccines: number;
  upcomingAppointments: Appointment[];
  recentPets: Pet[];
}

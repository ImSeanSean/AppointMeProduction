export interface Appointment {
    AppointmentID: number;
    ConsultantID: number;
    Status: number;
    Completed: number;
    AppointmentDate: string;
    AppointmentInfo: string;
    CreatedAt: string | null;
    UpdatedAt: string | null;
    user_id: number;
    appointment_title: string;
    UserName: string;
    UserLastName: string;
    ConsultantFirstName: string;
    ConsultantLastName: string;
    mode: string;
    urgency: string;
    remarks: string;
    rating: number;
  }
  
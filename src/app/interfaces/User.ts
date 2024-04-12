export interface User {
    UserID: number;
    Password: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Course: string;
    CreatedAt: string;
    UpdatedAt: string;
    AlternateEmail: string;
    ContactNumber: string | null;
    block: string | null;
    year: number | null;
    bday: string | null;
    gender: string | null;
  }
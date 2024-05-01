export interface Teacher {
  ConsultantID: number;
  Email: string;
  Password: string;
  first_name: string;
  last_name: string;
  bday: string;
  gender: string;
  creation_time: Date;
  approved: boolean;
  headteacher: boolean;
}
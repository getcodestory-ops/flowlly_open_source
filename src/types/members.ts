export interface MemberEntity {
  id: string;
  creation_time?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  responsibilities?: string;
  project_id?: string;
  user_id?: string;
  skills?: string;
  active?: boolean;
  phone_registration?: { phone_number: string }[];
  enable_sms?: boolean;
}

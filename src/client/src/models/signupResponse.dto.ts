export interface SignUpResponseDto {
  email: string;
  name: string;
  phoneNumber?: string;
  families: string[];
  role: string;
  isAdmin: boolean;
}

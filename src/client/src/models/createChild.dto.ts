export interface CreateChildDto {
  name: string;

  birthDate: string;

  color?: string;

  family: string;

  guardians?: string[];

  avatar?: string;

  isActive?: boolean;
}

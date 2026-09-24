export class RefreshResponseDto {
  access_token: string;
  refresh_token: string;
}

export class LoginResponseDto extends RefreshResponseDto {
  user: {
    id: string;
    email: string;
    document_number: string;
    companyId: string;
    roleId: string;
    roleCode: string;
    isPrincipal: boolean;
  };
}

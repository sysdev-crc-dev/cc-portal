export type Tokens = {
  token: string | null | undefined;
  refreshToken: RefreshToken | null | undefined;
  tokenExpires: Date | null | undefined;
};

type RefreshToken = {
  refreshToken: string;
  expiry_date: Date;
  token: string;
};

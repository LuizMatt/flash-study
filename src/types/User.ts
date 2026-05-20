export type User = {
  name: string;
  email: string;
}

export type UserData = User & {
  password: string;
}
export interface SignupFormHookValue {
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

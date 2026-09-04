import { SignupEmailBottomFields } from "./SignupEmailBottomFields";
import { SignupEmailTopFields } from "./SignupEmailTopFields";

export interface SignupEmailFormFieldsProps {
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  isLoading: boolean;
}

export function SignupEmailFormFields(props: SignupEmailFormFieldsProps): React.ReactElement {
  const {
    termsAccepted,
    setTermsAccepted,
    isLoading,
    ...top
  } = props;
  return (
    <>
      <SignupEmailTopFields {...top} isLoading={isLoading} />
      <SignupEmailBottomFields
        termsAccepted={termsAccepted}
        setTermsAccepted={setTermsAccepted}
        isLoading={isLoading}
      />
    </>
  );
}

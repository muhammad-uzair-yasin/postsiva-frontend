import dynamic from "next/dynamic";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

const VerifyOtpScreen = dynamic(
  () =>
    import("./_components/VerifyOtpScreen").then((m) => ({
      default: m.VerifyOtpScreen,
    })),
  { loading: () => <AuthFormSkeleton /> },
);

export default function VerifyOtpPage(): React.ReactElement {
  return <VerifyOtpScreen />;
}

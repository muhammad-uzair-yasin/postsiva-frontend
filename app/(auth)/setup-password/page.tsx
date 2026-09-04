import dynamic from "next/dynamic";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

const SetupPasswordScreen = dynamic(
  () =>
    import("./_components/SetupPasswordScreen").then((m) => ({
      default: m.SetupPasswordScreen,
    })),
  { loading: () => <AuthFormSkeleton /> },
);

export default function SetupPasswordPage(): React.ReactElement {
  return <SetupPasswordScreen />;
}

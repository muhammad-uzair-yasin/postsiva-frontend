import { Suspense } from "react";

import { AdminLoginScreen } from "../_components/AdminLoginScreen";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginScreen />
    </Suspense>
  );
}

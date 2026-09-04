import { PublicJsonLd } from "@/components/marketing/PublicJsonLd";

import { HelpCenterFrameClient } from "./HelpCenterFrameClient";

interface HelpCenterFrameProps {
  readonly children: React.ReactNode;
}

export function HelpCenterFrame({
  children,
}: HelpCenterFrameProps): React.ReactElement {
  return (
    <>
      <PublicJsonLd />
      <HelpCenterFrameClient>{children}</HelpCenterFrameClient>
    </>
  );
}

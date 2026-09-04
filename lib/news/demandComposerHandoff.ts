/** In-memory handoff: Demand item → open composer and generate caption. */

import type { DemandCreateSourceType } from "@/lib/news/demandApi";

export interface DemandComposerHandoff {
  readonly id: string;
  readonly source_type: DemandCreateSourceType;
  readonly topic: string;
  readonly source_url: string | null;
  readonly image_url: string | null;
  readonly traffic: string | null;
  readonly image_source: string | null;
  readonly country: string | null;
  readonly seed_q: string | null;
  readonly prefix: string | null;
  readonly article: string | null;
  readonly views: number | null;
  readonly rank: number | null;
  readonly accountId: string;
  readonly platform: string;
  readonly account_name: string | null;
}

let pending: DemandComposerHandoff | null = null;

export function setDemandComposerHandoff(handoff: DemandComposerHandoff): void {
  pending = handoff;
}

export function takeDemandComposerHandoff(): DemandComposerHandoff | null {
  const h = pending;
  pending = null;
  return h;
}

"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, RefreshCw, Search, X } from "lucide-react";

import { PAID_USER_FILTERS } from "@/lib/admin/paidUsersApi";

import { usePaidUserEmail } from "../_hooks/usePaidUserEmail";
import { usePaidUsers } from "../_hooks/usePaidUsers";
import { PaidUserDetailPanel } from "./PaidUserDetailPanel";
import { PaidUserEmailModal } from "./PaidUserEmailModal";
import { PaidUsersTable } from "./PaidUsersTable";

/** Paid subscribers — Paddle vs admin, renewal dates, payment history, billing emails. */
export function PaidUsersScreen() {
  const {
    rows,
    total,
    loading,
    error,
    filter,
    search,
    selected,
    detail,
    detailLoading,
    detailError,
    setFilter,
    setSearch,
    reload,
    loadMore,
    hasMore,
    loadingMore,
    selectUser,
  } = usePaidUsers();
  const email = usePaidUserEmail();
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleEmailSend = async (template: Parameters<typeof email.send>[0], note: string) => {
    const ok = await email.send(template, note);
    if (ok) selectUser(selected);
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-on-surface">Paid users</h1>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Active Starter/Pro — admin grants vs Paddle payments, renewals, and billing emails.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/25 px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {email.lastResult ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{email.lastResult}</span>
          <button type="button" onClick={email.dismissResult} className="rounded p-1 hover:bg-emerald-500/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {PAID_USER_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === f.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email, name…"
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface"
        >
          Search
        </button>
      </form>

      {loading && rows.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading paid users…
        </div>
      ) : error ? (
        <p className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
      ) : (
        <>
          <p className="text-xs text-on-surface-variant">
            {total} paid user{total === 1 ? "" : "s"}
            {filter !== "all" ? ` (${PAID_USER_FILTERS.find((f) => f.id === filter)?.label})` : ""}
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <PaidUsersTable
                rows={rows}
                selectedId={selected?.user_id ?? null}
                onSelect={(row) => selectUser(row)}
                onEmail={(row) => email.openSingle(row)}
              />
              {hasMore ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/25 px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Load more
                  </button>
                </div>
              ) : null}
            </div>
            {selected ? (
              <PaidUserDetailPanel
                row={selected}
                detail={detail}
                loading={detailLoading}
                detailError={detailError}
                onClose={() => selectUser(null)}
                onEmail={() => email.openSingle(selected)}
              />
            ) : null}
          </div>
        </>
      )}

      {email.target ? (
        <PaidUserEmailModal
          target={email.target}
          sending={email.sending}
          error={email.error}
          onCancel={email.close}
          onSend={handleEmailSend}
        />
      ) : null}
    </div>
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-admin-users-"));
const require = createRequire(import.meta.url);

execFileSync(
  join(process.cwd(), "node_modules/.bin/tsc"),
  [
    "lib/admin/usersApi.ts",
    "lib/admin/overviewApi.ts",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--esModuleInterop",
    "--skipLibCheck",
  ],
  { stdio: "inherit" },
);

const {
  buildUsersPath,
  buildUserPath,
  buildImpersonatePath,
  filterUsers,
  mergeUsersPage,
  hasMoreUsers,
  replaceUser,
  removeUser,
  userDisplayName,
  formatUserDate,
  extractImpersonateCode,
  buildImpersonateUrl,
  resolveImpersonateRedirect,
  computeActivityScore,
  mergeUserActivity,
  filterUsersBySignupPeriod,
  sortUsersWithActivity,
  userRoleLabel,
} = require(join(outDir, "usersApi.js"));

const { formatStatValue, percentOfTotal, buildOverviewTiles } = require(
  join(outDir, "overviewApi.js"),
);

const user = (overrides = {}) => ({
  id: "u1",
  email: "a@example.com",
  username: "alice",
  full_name: "Alice A",
  is_active: true,
  is_admin: false,
  email_verified: true,
  created_at: "2026-01-05T10:00:00Z",
  ...overrides,
});

test("buildUsersPath includes limit/offset and trimmed search", () => {
  assert.equal(buildUsersPath("", 50, 0), "/admin/api/users?limit=50&offset=0");
  assert.equal(
    buildUsersPath("  bob ", 50, 100),
    "/admin/api/users?search=bob&limit=50&offset=100",
  );
});

test("buildUserPath and buildImpersonatePath encode ids", () => {
  assert.equal(buildUserPath("abc/def"), "/admin/api/users/abc%2Fdef");
  assert.equal(buildImpersonatePath("u1"), "/admin/api/users/u1/impersonate");
});

test("filterUsers matches email, username, and full name (legacy parity)", () => {
  const users = [
    user({ id: "1", email: "alpha@x.com", username: "alp", full_name: "Al Pha" }),
    user({ id: "2", email: "beta@x.com", username: "bee", full_name: "Be Ta" }),
  ];
  assert.deepEqual(filterUsers(users, "ALPHA").map((u) => u.id), ["1"]);
  assert.deepEqual(filterUsers(users, "bee").map((u) => u.id), ["2"]);
  assert.deepEqual(filterUsers(users, "  Ta ").map((u) => u.id), ["2"]);
  assert.equal(filterUsers(users, "  ").length, 2);
  assert.equal(filterUsers(users, "nomatch").length, 0);
});

test("mergeUsersPage appends and de-duplicates by id", () => {
  const merged = mergeUsersPage(
    [user({ id: "1" }), user({ id: "2" })],
    [user({ id: "2" }), user({ id: "3" })],
  );
  assert.deepEqual(merged.map((u) => u.id), ["1", "2", "3"]);
});

test("hasMoreUsers is true only for a full page", () => {
  assert.equal(hasMoreUsers(50, 50), true);
  assert.equal(hasMoreUsers(12, 50), false);
  assert.equal(hasMoreUsers(0, 50), false);
});

test("replaceUser and removeUser operate by id", () => {
  const users = [user({ id: "1" }), user({ id: "2", full_name: "Old" })];
  const replaced = replaceUser(users, user({ id: "2", full_name: "New" }));
  assert.equal(replaced[1].full_name, "New");
  assert.equal(replaced[0], users[0]);
  assert.deepEqual(removeUser(users, "1").map((u) => u.id), ["2"]);
});

test("userDisplayName falls back full_name -> username -> email", () => {
  assert.equal(userDisplayName(user()), "Alice A");
  assert.equal(userDisplayName(user({ full_name: "" })), "alice");
  assert.equal(userDisplayName(user({ full_name: "", username: "" })), "a@example.com");
});

test("formatUserDate formats ISO dates and guards invalid input", () => {
  assert.equal(formatUserDate("2026-01-05T10:00:00Z"), "Jan 5, 2026");
  assert.equal(formatUserDate("not-a-date"), "—");
  assert.equal(formatUserDate(null), "—");
});

test("extractImpersonateCode reads code field or redirect_url", () => {
  assert.equal(extractImpersonateCode({ code: " abc123 " }), "abc123");
  assert.equal(
    extractImpersonateCode({
      redirect_url: "https://app.postsiva.com/impersonate?code=xyz",
    }),
    "xyz",
  );
  assert.equal(extractImpersonateCode({ redirect_url: "/impersonate?code=rel" }), "rel");
  assert.equal(extractImpersonateCode({}), null);
  assert.equal(extractImpersonateCode(null), null);
});

test("buildImpersonateUrl encodes the code against the origin", () => {
  assert.equal(
    buildImpersonateUrl("https://app.postsiva.com/", "a b/c"),
    "https://app.postsiva.com/impersonate?code=a%20b%2Fc",
  );
});

test("resolveImpersonateRedirect keeps same-origin redirect_url as-is", () => {
  const url = "https://app.postsiva.com/impersonate?code=one-time";
  assert.equal(
    resolveImpersonateRedirect("https://app.postsiva.com", { redirect_url: url }),
    url,
  );
});

test("resolveImpersonateRedirect rebuilds cross-origin redirects locally", () => {
  assert.equal(
    resolveImpersonateRedirect("https://admin.postsiva.com", {
      redirect_url: "http://localhost:3000/impersonate?code=xyz",
    }),
    "https://admin.postsiva.com/impersonate?code=xyz",
  );
});

test("resolveImpersonateRedirect supports the draft { code } shape and failure", () => {
  assert.equal(
    resolveImpersonateRedirect("https://a.com", { code: "k" }),
    "https://a.com/impersonate?code=k",
  );
  assert.equal(resolveImpersonateRedirect("https://a.com", {}), null);
});

test("formatStatValue compacts large values and guards non-numbers", () => {
  assert.equal(formatStatValue(0), "0");
  assert.equal(formatStatValue(1284), "1,284");
  assert.equal(formatStatValue(12900), "12.9K");
  assert.equal(formatStatValue(10000), "10K");
  assert.equal(formatStatValue(4200000), "4.2M");
  assert.equal(formatStatValue(undefined), "—");
  assert.equal(formatStatValue(NaN), "—");
});

test("percentOfTotal rounds and guards zero totals", () => {
  assert.equal(percentOfTotal(82, 100), 82);
  assert.equal(percentOfTotal(1, 3), 33);
  assert.equal(percentOfTotal(5, 0), null);
});

test("buildOverviewTiles maps the overview payload to five labeled tiles", () => {
  const tiles = buildOverviewTiles({
    total_users: 200,
    active_users: 150,
    admins: 3,
    verified_users: 100,
    recent_signups_7d: 12,
  });
  assert.deepEqual(
    tiles.map((t) => [t.key, t.label, t.value]),
    [
      ["total_users", "Total users", "200"],
      ["active_users", "Active users", "150"],
      ["admins", "Admins", "3"],
      ["verified_users", "Verified users", "100"],
      ["recent_signups_7d", "Signups (7 days)", "12"],
    ],
  );
  assert.equal(tiles[1].hint, "75% of total");
  assert.equal(tiles[3].hint, "50% of total");
  assert.equal(tiles[0].hint, undefined);
});

test("computeActivityScore weights API hits and publishes", () => {
  const score = computeActivityScore({
    post_generation_count: 1,
    image_generation_count: 0,
    message_count: 0,
    tool_call_count: 0,
    post_published_count: 2,
    comments_posted_count: 0,
    api_route_hits_total: 100,
  });
  assert.equal(score, 100 + 2 * 12 + 1 * 6);
});

test("mergeUserActivity joins tracking rows by user id", () => {
  const merged = mergeUserActivity(
    [user({ id: "u1" }), user({ id: "u2" })],
    [{ user_id: "u1", api_route_hits_total: 50, post_published_count: 3 }],
  );
  assert.equal(merged[0].activity.api_route_hits_total, 50);
  assert.equal(merged[0].activity.post_published_count, 3);
  assert.equal(merged[1].activity.api_route_hits_total, 0);
});

test("filterUsersBySignupPeriod filters recent signups", () => {
  const now = Date.now();
  const rows = mergeUserActivity(
    [
      user({ id: "old", created_at: new Date(now - 40 * 86400000).toISOString() }),
      user({ id: "new", created_at: new Date(now - 2 * 86400000).toISOString() }),
    ],
    [],
  );
  assert.equal(filterUsersBySignupPeriod(rows, "month").length, 1);
  assert.equal(filterUsersBySignupPeriod(rows, "week").length, 1);
  assert.equal(filterUsersBySignupPeriod(rows, "all").length, 2);
});

test("filterUsersBySignupPeriod latest sorts newest to oldest without dropping users", () => {
  const now = Date.now();
  const rows = mergeUserActivity(
    [
      user({ id: "old", created_at: new Date(now - 40 * 86400000).toISOString() }),
      user({ id: "mid", created_at: new Date(now - 10 * 86400000).toISOString() }),
      user({ id: "new", created_at: new Date(now - 1 * 86400000).toISOString() }),
    ],
    [],
  );
  const latest = filterUsersBySignupPeriod(rows, "latest");
  assert.deepEqual(latest.map((r) => r.id), ["new", "mid", "old"]);
});

test("sortUsersWithActivity sorts by activity score desc", () => {
  const rows = mergeUserActivity(
    [user({ id: "a" }), user({ id: "b" })],
    [
      { user_id: "a", api_route_hits_total: 1 },
      { user_id: "b", api_route_hits_total: 99 },
    ],
  );
  const sorted = sortUsersWithActivity(rows, "activity_score", "desc");
  assert.deepEqual(sorted.map((r) => r.id), ["b", "a"]);
});

test("userRoleLabel reflects admin and developer flags", () => {
  assert.equal(userRoleLabel(user({ is_admin: true })), "Admin");
  assert.equal(userRoleLabel(user({ is_developer: true })), "Developer");
  assert.equal(userRoleLabel(user()), "User");
});

test.after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

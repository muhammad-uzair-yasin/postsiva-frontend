const path = require("path");

const slot = process.env.POSTSIVA_SLOT;
const releaseDir = process.env.POSTSIVA_RELEASE_DIR;
const port = process.env.POSTSIVA_FRONTEND_PORT;

if (!["blue", "green"].includes(slot) || !releaseDir || !port) {
  throw new Error("Missing or invalid frontend Blue/Green environment");
}

module.exports = {
  apps: [
    {
      name: `unified-postsiva-ui-${slot}`,
      script: "/usr/bin/npm",
      args: "start",
      cwd: releaseDir,
      interpreter: "/usr/bin/node",
      autorestart: true,
      kill_timeout: 30000,
      listen_timeout: 30000,
      env: {
        PORT: port,
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production",
        POSTSIVA_RELEASE: process.env.POSTSIVA_RELEASE,
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:
          process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
      },
      error_file: path.join(releaseDir, "logs", "frontend-error.log"),
      out_file: path.join(releaseDir, "logs", "frontend-out.log"),
    },
  ],
};

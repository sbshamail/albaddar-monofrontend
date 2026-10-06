// PM2 supervises `next start` for both apps directly — no wrapper script
// needed here since, unlike the backend's uvicorn supervisor, `next start`
// is already the long-running server process. Each instance gets its own
// PORT (Next's CLI reads process.env.PORT) so all four can run side by side
// on the same box; point your reverse proxy (nginx/etc.) at these ports.
//
// Each instance pins its own BACKEND_API_URL (overriding the shared root
// .env.local/.env — see AGENTS.md), mirroring the backend's own prod/test
// split: prod talks to shopapi.buyagain.pk, test talks to
// testshopapi.buyagain.pk.
const path = require("path");

module.exports = {
  apps: [
    {
      name: "albaddar-admin-prod",
      script: "pnpm",
      args: "start",
      interpreter: "none",
      // __dirname always resolves to wherever this file itself lives, so
      // this stays correct whether it's your self-hosted runner's checkout
      // path (under actions-runner/_work/..., not fixed) or a manual clone
      // anywhere else — no hardcoded path needed (mirrors backend's
      // ecosystem.config.js comment on the same point).
      cwd: path.join(__dirname, "admin"),

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        PORT: "3001",
        NODE_ENV: "production",
        BACKEND_API_URL: "https://albaddarapi.buyagain.pk/api",
      },

      out_file: "./logs/admin-prod-out.log",
      error_file: "./logs/admin-prod-error.log",
      merge_logs: true,
      time: true,
    },

    {
      name: "albaddar-frontend-prod",
      script: "pnpm",
      args: "start",
      interpreter: "none",
      cwd: path.join(__dirname, "frontend"),

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        PORT: "3000",
        NODE_ENV: "production",
        BACKEND_API_URL: "https://albaddarapi.buyagain.pk/api",
      },

      out_file: "./logs/albaddar-frontend-prod-out.log",
      error_file: "./logs/albaddar-frontend-prod-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};

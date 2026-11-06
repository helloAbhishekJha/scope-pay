#!/usr/bin/env bash
# Optional: connect this repo to Render via Blueprint (render.yaml) or paste these in the dashboard.
set -euo pipefail
echo "ScopePay Render Web Service"
echo "  Build:  npm install && npm run build"
echo "  Start:  npm run start   (uses PORT from Render; local fallback 4419)"
echo "  Env:    see README Environment variables + render.yaml"
echo ""
echo "Dashboard: https://dashboard.render.com/ → New → Blueprint → point at helloAbhishekJha/scope-pay"

#!/usr/bin/env bash
# Courteous family-B batch: capture each baseline ONCE (3s spacing on live fetches,
# exponential backoff on resets), then extract. Pages whose baseline already exists
# extract OFFLINE (no site hit). Resumable: re-running only live-fetches the gaps.
set -u
cd "$(dirname "$0")/../.." || exit 1
TSX="npx tsx scripts/visual-diff/extract-family-b.ts"

# Family-B = legacy-pages.json type in {service, resource, other}
PATHS=$(node -e '
const lp=require("./lib/legacy/legacy-pages.json");
const fam=new Set(["service","resource","other"]);
const out=Object.keys(lp).filter(k=>fam.has(lp[k].type)).sort();
process.stdout.write(out.join("\n"));
')

TOTAL=$(printf '%s\n' "$PATHS" | grep -c .)
echo "family-B paths: $TOTAL"
i=0; ok=0; fail=0; live=0
FAILED=""
while IFS= read -r path; do
  [ -z "$path" ] && continue
  i=$((i+1))
  slug=$(printf '%s' "$path" | sed 's#^/##; s#/#__#g')
  cap="docs/reference/capture/${slug}/desktop/original.html"
  had_baseline=0; [ -f "$cap" ] && had_baseline=1
  done_ok=0
  for attempt in 1 2 3; do
    if $TSX "$path" >/dev/null 2>&1; then done_ok=1; break; fi
    sleep $((attempt*5))
  done
  if [ "$done_ok" = 1 ]; then
    ok=$((ok+1))
    [ "$had_baseline" = 0 ] && { live=$((live+1)); printf '[%d/%d] LIVE  %s\n' "$i" "$TOTAL" "$path"; } || printf '[%d/%d] off   %s\n' "$i" "$TOTAL" "$path"
  else
    fail=$((fail+1)); FAILED="$FAILED $path"; printf '[%d/%d] FAIL  %s\n' "$i" "$TOTAL" "$path"
  fi
  # courtesy: only pause after a fresh live fetch
  [ "$had_baseline" = 0 ] && sleep 3
done <<< "$PATHS"

echo ""
echo "DONE: ok=$ok fail=$fail (live fetches=$live) of $TOTAL"
[ -n "$FAILED" ] && echo "FAILED:$FAILED"
echo "pages.json now has: $(node -e 'console.log(Object.keys(require("./lib/legacy/family-b/pages.json")).length)')"

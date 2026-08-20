#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Browser test suite for darrenwongsj.dev
#
#   ./test/run.sh            test at 1440, 800 and 500 px
#   ./test/run.sh 1440       test at one width
#
# Starts its own server on port 8799, injects test/suite.js into a temporary
# copy of index.html, drives it in headless Chrome, and prints the results.
# Nothing it creates is left behind.
#
# Checks: every anchor and asset resolves, no duplicate ids, theme toggle,
# mobile menu (including aria-expanded and Escape), copy button, scroll state,
# horizontal overflow, dead CSS, heading order, accessible names, and WCAG AA
# contrast on the small-text colours.
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Google Chrome not found at $CHROME"; exit 1; }

PORT=8799
python3 serve.py $PORT >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true; rm -f _suite.html' EXIT
until curl -s -o /dev/null "http://127.0.0.1:$PORT/"; do sleep 0.3; done

python3 - <<'PY'
import pathlib
page  = pathlib.Path('index.html').read_text(encoding='utf-8')
suite = pathlib.Path('test/suite.js').read_text(encoding='utf-8')
pathlib.Path('_suite.html').write_text(
    page.replace('</body>', '<script>\n%s\n</script>\n</body>' % suite), encoding='utf-8')
PY

fail_total=0
WIDTHS=("$@"); [ ${#WIDTHS[@]} -eq 0 ] && WIDTHS=(1440 800 500)
for W in "${WIDTHS[@]}"; do
  OUT=$("$CHROME" --headless --disable-gpu --window-size=$W,900 \
        --virtual-time-budget=25000 --dump-dom "http://127.0.0.1:$PORT/_suite.html" 2>/dev/null \
        | python3 -c "import sys,re,html;t=sys.stdin.read();m=re.search(r'<pre id=\"out\">(.*?)</pre>',t,re.S);print(html.unescape(m.group(1)) if m else 'NO OUTPUT — the suite crashed')")
  p=$(printf '%s' "$OUT" | grep -c '^PASS' || true)
  f=$(printf '%s' "$OUT" | grep -c '^FAIL' || true)
  fail_total=$((fail_total + f))
  echo "─── ${W}px ─── $p passed, $f failed"
  printf '%s\n' "$OUT" | grep -E '^(FAIL|INFO)' || true
  echo
done

if [ "$fail_total" -gt 0 ]; then
  echo "$fail_total failing assertion(s)."
  echo "NOTE: 'scroll spy marks the current section' is flaky in headless Chrome —"
  echo "      IntersectionObserver does not reliably re-evaluate after a programmatic"
  echo "      scroll without a compositor. Confirm that one in a real browser."
  exit 1
fi
echo "All checks passed."

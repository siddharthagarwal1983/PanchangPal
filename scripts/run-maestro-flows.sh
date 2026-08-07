#!/usr/bin/env bash
#
# Run the Maestro FLOW_* suite under a wall-clock budget, capture logcat, and preserve the
# suite's exit status. Invoked as ONE line from e2e.yml's emulator `script:` block.
#
# ---------------------------------------------------------------------------------------
# WHY THIS IS A FILE AND NOT INLINE YAML — READ BEFORE MOVING IT BACK.
#
# `reactivecircus/android-emulator-runner`'s `script:` input executes the block ONE LINE AT
# A TIME, each in its own `sh -c`. The job log shows it literally:
#
#     [command]/usr/bin/sh -c set -e
#     [command]/usr/bin/sh -c if [ "$flows_status" = "124" ] || [ "$flows_status" = "137" ]; then
#     /usr/bin/sh: 1: Syntax error: end of file unexpected (expecting "fi")
#
# Two consequences, both of which bit on run 31145793824 (2026-08-07):
#
#   1. A multi-line shell construct (if/then/fi, loops, heredocs) is a SYNTAX ERROR, because
#      the shell reading `if` never sees its `fi`. The step then fails with exit 2 EVEN WHEN
#      EVERY FLOW PASSED — that run was "6/6 Flows Passed in 2m 23s" and still went red.
#   2. Variables do not survive between lines, so `flows_status=$?` on its own line is
#      written into a shell that exits immediately afterwards. `set +e` / `set -e` are
#      likewise per-line no-ops.
#
# The second point means the previous inline version's exit-status plumbing never did
# anything: failures propagated only because a non-zero line fails the action directly. And
# because the action stops at that failing line, `adb logcat -d > maestro-logcat.txt` never
# ran on a red run — the artifact was missing the device log precisely when it was needed.
# Verified: the failed run's artifact contains the per-flow commands.json and NO
# maestro-logcat.txt; the green run's contains it.
#
# Keeping the logic in a file makes the whole class of bug unreachable: the workflow calls
# one line, and this script is parsed by one shell as one program.
# ---------------------------------------------------------------------------------------
#
# A HUNG FLOW MUST FAIL RED, NOT GO DARK.
#
# `Build APK` has carried `timeout --kill-after=2m 40m` since 2026-07-25, added after a stuck
# Gradle sat until `timeout-minutes: 90` killed the job and it reported `cancelled` — a red
# build wearing a timeout's costume. That guard was applied to the build step and never to
# the flows step, which collected the identical defect on 2026-08-06 (E2E 31120798108):
# FLOW_SESSION_PERSISTENCE hung on `Launch app "com.panchangpal.app"` — the command itself
# never returning — 0.5s after its own `clearState`, which followed FLOW_OFFLINE_SYNC's
# `onFlowComplete` teardown doing `stopApp` + `clearState`. Two clear-states ~0.5s apart,
# with `Destroy timeout of remove-task ... com.panchangpal.app` in logcat 11s earlier. It was
# caught only because a human noticed and cancelled by hand; otherwise it would have burned
# all 90 minutes and reported `cancelled`, WHICH NOBODY READS AS RED.
#
# The budget is deliberately generous: the six flows run in single-digit minutes (6/6 in
# 2m 23s on 31145793824), so it cannot clip a healthy suite. It exists purely to convert an
# indefinite hang into an exit code.

# NOT `set -e`: a non-zero exit from the suite is an expected outcome that this script has to
# observe, annotate and re-raise. `set -u` still catches typo'd variables.
set -u

FLOWS_DIR="${1:-tests/flows/}"
BUDGET="${MAESTRO_BUDGET:-25m}"
KILL_AFTER="${MAESTRO_KILL_AFTER:-1m}"
LOGCAT_OUT="${MAESTRO_LOGCAT_OUT:-maestro-logcat.txt}"

timeout --kill-after="$KILL_AFTER" "$BUDGET" maestro test "$FLOWS_DIR"
flows_status=$?

# `timeout` reports 124 when it sends TERM, and the shell reports 137 (128+SIGKILL) when the
# --kill-after KILL was needed. Either way the suite did not finish on its own.
if [ "$flows_status" = "124" ] || [ "$flows_status" = "137" ]; then
  echo "::error::Maestro exceeded its ${BUDGET} budget and was killed (exit ${flows_status}). This is a HANG, not a flow assertion failure. Read the per-flow commands.json in the maestro-debug artifact to see which flow stopped and how far the suite got."
fi

# Unconditional, and deliberately tolerant of its own failure: losing the device log must not
# convert a flow result into an adb error. `Upload Maestro debug output` is `if: always()`, so
# a timed-out or failed run still keeps the artifact — the only place the per-flow
# commands.json statuses exist, and the only way to tell a late hang from a change that broke
# the suite.
adb logcat -d > "$LOGCAT_OUT" || echo "::warning::adb logcat -d failed; ${LOGCAT_OUT} may be missing or truncated."

exit "$flows_status"

/**
 * en-US localization keys (TDD Part 4 §9.2). Every user-facing string in the Application
 * Shell is a key here — no literals in components/screens. v1 is en-US; keys are
 * RTL/ICU-ready. Regional tradition/festival naming is content-driven (server), not here.
 */
export const enUS = {
  app: { name: 'PanchangPal', tagline: 'A calm daily companion' },
  actions: {
    retry: 'Try again',
    continue: 'Continue',
    skip: 'Skip for now',
    signOut: 'Sign out',
    back: 'Back',
    verify: 'Verify',
    sendCode: 'Send code',
  },
  tabs: { today: 'Today', calendar: 'Calendar', guru: 'Ask Guru', you: 'You' },
  splash: { loading: 'Preparing your day…' },
  auth: {
    title: 'Sign in',
    subtitle: 'Sign in to sync across devices and your household. You can keep using the app without an account.',
    continueApple: 'Continue with Apple',
    continueGoogle: 'Continue with Google',
    continueEmail: 'Continue with email',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    otpTitle: 'Enter your code',
    otpSubtitle: 'We sent a 6-digit code to {{email}}.',
    otpLabel: 'Verification code',
    otpError: "That code didn't work. Please try again.",
    genericError: "We couldn't sign you in. Please try again.",
  },
  offline: { banner: "You're offline — showing saved content." },
  empty: { generic: 'Nothing here yet' },
  errors: {
    unknown: 'Something went wrong. Please try again.',
    offline: 'Connect to the internet to use this.',
    session: 'Your session expired. Please sign in again.',
  },
  today: {
    panchangLabel: "Today's panchang",
    panchangUnavailable: 'Panchang is temporarily unavailable.',
    panchangOpen: "Today's panchang, open details",
    reflection: "Today's reflection",
    checklistTitle: 'Today',
    checklistAllDone: 'All done for today.',
    savedOffline: 'Saved from your last connection',
  },
  ritual: {
    title: "Today's ritual",
    begin: 'Begin',
    continue: 'Continue',
    done: 'Done for today',
    stateNotStarted: "Today's ritual, not started",
    stateInProgress: "Today's ritual, continue",
    stateCompleted: "Today's ritual, completed",
    duration: 'About {{minutes}} min',
  },
  streak: {
    label: '{{count}} day streak',
    graceCopy: 'A grace day kept your streak — no worries.',
  },
} as const;

export type Translations = typeof enUS;

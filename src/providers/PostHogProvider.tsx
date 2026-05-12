import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

// Check that PostHog is loaded
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // These should ideally be in your .env file
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder_key_replace_me';
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.debug(false); // Enable for debugging locally
        }
      }
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

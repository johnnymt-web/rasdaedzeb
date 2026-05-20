import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

    if (!posthogKey || posthogKey.includes('placeholder')) {
      console.info('PostHog disabled: missing valid VITE_POSTHOG_KEY')
      return
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.debug(false)
        }
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

import posthog from 'posthog-js'
import type { PostHog } from 'posthog-js'

// 只在客户端初始化 PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_f3C6nywy46DXxFxuyOGnnrsmpqLNLCvTUNPfWyROfOJ', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    // 禁用在开发环境中发送事件
    loaded: (posthog: PostHog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
    }
  })
}

export default posthog
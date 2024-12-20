const CONFIG = {
  // profile setting (required)
  profile: {
    name: "Jiake Li (Pama Lee)",
    image: "/头像.jpeg", // If you want to create your own notion avatar, check out https://notion-avatar.vercel.app
    role: "Full Stack developer",
    bio: "I develop everything using node.",
    email: "pama@pamalee.cn",
    linkedin: "pama-lee",
    github: "Pama-Lee",
    instagram: "",
  },
  projects: [
    {
      name: `XMUM Xplorer`,
      href: "https://www.xmum.app",
      icon: "https://www.xmum.app/images/logo.png"
    },
  ],
  // blog setting (required)
  blog: {
    title: "Jiake Li's Blog",
    description: "Of course, I still love you!",
    scheme: "system", // 'light' | 'dark' | 'system'
  },

  // CONFIG configration (required)
  link: "https://www.jiake.li",
  since: 2022, // If leave this empty, current year will be used.
  lang: "zh-CN", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: "321e98d5fdd44a20883cd33df4890e2b"
    //pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: true,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: true,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  naverSearchAdvisor: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || "",
      "issue-term": "og:title",
      label: "💬 Comments"
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 1, // revalidate time for [slug], index
}

module.exports = { CONFIG }

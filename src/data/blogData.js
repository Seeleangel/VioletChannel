export const BLOG_POSTS = [
    {
        id: 1,
        title: '我的 2024 年终总结',
        excerpt: '回顾这一年，从技术的精进到生活的感悟，无论是代码行的积累还是旅途中的风景...',
        content: `
      ## 回顾 2024

      2024年对我来说是充满变化和挑战的一年。从年初决定深入学习 React 生态，到年末能够独立完成复杂的 Web 应用，每一步都算数。

      ### 技术成长
      
      这一年我主要专注于前端领域的深耕：
      - 熟练掌握了 React Hooks 的使用
      - 学习了 Next.js 服务端渲染
      - 探索了 WebGL 和 Three.js 的 3D 世界

      ### 生活感悟

      除了代码，我也开始更多地关注生活本身。去了海边，看了日出，也认识了很多有趣的朋友。
      
      > "生活不仅是眼前的苟且，还有诗和远方。"

      希望 2025 年能继续保持这份热情，去探索更广阔的世界。
    `,
        date: '2024-12-31',
        category: '生活感悟',
        image: 'https://images.unsplash.com/photo-1499750310159-5254f4127278?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        title: 'Modern Web Design Trends',
        excerpt: '探讨 Glassmorphism、Neumorphism 以及极简主义在现代网页设计中的应用与未来趋势。',
        content: `
      ## 现代网页设计趋势解析

      随着 CSS3 特性的普及和浏览器性能的提升，网页设计呈现出越来越丰富多彩的趋势。

      ### 1. Glassmorphism (毛玻璃效果)
      
      Glassmorphism 依然是今年的设计热点。通过背景模糊 (Background Blur) 和半透明层叠，创造出富有层次感和现代感的界面。关键点在于：
      - 多层级堆叠
      - 鲜艳的背景色块
      - 精细的边框处理

      ### 2. 极简主义 (Minimalism)
      
      "Less is More" 永不过时。留白 (Whitespace) 的运用让内容更加突出，提升了用户的阅读体验。

      ### 总结
      
      好的设计不仅要好看，更要好用。在追求视觉效果的同时，不要忽视了可用性和无障碍性 (Accessibility)。
    `,
        date: '2024-11-15',
        category: '技术分享',
        image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        title: 'React Hooks 最佳实践',
        excerpt: '深入理解 useEffect 的依赖数组，以及如何优雅地封装自定义 Hooks 来提升代码复用性。',
        content: `
      ## React Hooks 深度指南

      Hooks 彻底改变了我们编写 React 组件的方式。

      ### useEffect 的陷阱
      
      很多初学者容易在 \`useEffect\` 的依赖数组上犯错。
      
      \`\`\`javascript
      // 错误示范
      useEffect(() => {
        doSomething(data);
      }, []); // 缺少依赖 data
      \`\`\`

      务必保证 effect 内部使用到的所有外部变量都包含在依赖数组中，或者使用 \`useCallback\` / \`useMemo\` 进行优化。

      ### 自定义 Hooks
      
      封装自定义 Hooks 是复用逻辑的最佳方式。比如封装一个 \`useWindowSize\` 来监听窗口大小变化。
    `,
        date: '2024-10-22',
        category: '编程笔记',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 4,
        title: '一次说走就走的旅行',
        excerpt: '在这个周末，决定放下所有工作，去海边看一次日出，感受久违的自由与宁静。',
        content: `
      ## 逃离城市计划

      工作久了，总觉得被困在钢筋水泥的森林里。于是这个周末，我买了一张去海边的车票。

      ### 日出
      
      凌晨四点起床，在海边等待第一缕阳光。当太阳从海平面缓缓升起的那一刻，所有的疲惫似乎都烟消云散了。

      ![海边日出](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)

      ### 回归
      
      虽然只是短短两天的旅行，但却让我充满了能量。有时候，停下来是为了更好地出发。
    `,
        date: '2024-09-08',
        category: '旅行日记',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
];

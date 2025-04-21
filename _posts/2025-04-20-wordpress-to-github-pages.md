---
layout: post
title: "WordPress to GitHub Pages: A Sunday Migration Journey"
date: 2025-04-20
tags: [blog, technical, github, wordpress, migration]
---

# WordPress to GitHub Pages: A Sunday Migration Journey

I've been running my blog on WordPress for years now. It's been reliable, but I've always felt a bit disconnected from the technical side of things. As a software engineer, I wanted more control, more flexibility, and honestly, a workflow that felt more natural to me. So today, I decided to take the plunge and migrate my entire site from WordPress to GitHub Pages.

## Why GitHub Pages?

Before I dive into the migration process, let me explain why I chose GitHub Pages:

```mermaid
graph TD
    A[Why GitHub Pages?] --> B[Version Control]
    A --> C[Markdown Support]
    A --> D[Free Hosting]
    A --> E[Developer Workflow]
    A --> F[Performance]
    
    B --> B1[Git-based history]
    B --> B2[Branching for drafts]
    
    C --> C1[Write in plain text]
    C --> C2[Focus on content]
    
    D --> D1[No monthly fees]
    D --> D2[Custom domain support]
    
    E --> E1[Local development]
    E --> E2[Familiar tools]
    
    F --> F1[Static site speed]
    F --> F2[No database queries]
```

As you can see, there were plenty of reasons to make the switch. But the biggest one? I wanted my blog to feel like *my* space again, where I could tinker and experiment without worrying about breaking plugins or themes.

## The Migration Plan

I woke up this Sunday morning with a cup of coffee and a plan. I knew I wanted to preserve my site's visual identity - the purple background, the DM Mono font, and that distinctive frame design I've grown to love. But I also wanted to leverage Jekyll's static site generation capabilities.

Here was my initial plan:

```mermaid
flowchart LR
    A[Analyze WordPress Site] --> B[Set Up Jekyll Structure]
    B --> C[Create Layouts and Includes]
    C --> D[Style with CSS]
    D --> E[Migrate Content]
    E --> F[Implement Dynamic Features]
    F --> G[Test and Deploy]
    
    style A fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style F fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style G fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
```

Seemed straightforward enough, right? Well, as with any technical project, things got a bit more complex once I dug in.

## Enter Cline: My AI Pair Programmer

I've been experimenting with AI tools for a while now, and for this migration, I decided to bring in Cline as my pair programmer. If you're not familiar, Cline is an AI assistant that can help with coding tasks, and it turned out to be incredibly helpful for this project.

I started by explaining my vision to Cline - I wanted to preserve the visual style of my WordPress site while moving to a Jekyll-based GitHub Pages implementation. Cline helped me analyze my existing WordPress theme, identify the key components, and create a plan for recreating them in Jekyll.

The collaboration looked something like this:

```mermaid
sequenceDiagram
    participant Me
    participant Cline
    participant Jekyll
    participant GitHub
    
    Me->>Cline: Help me migrate from WordPress to GitHub Pages
    Cline->>Me: Let's analyze your WordPress theme first
    Me->>Cline: Here's my theme structure and CSS
    Cline->>Me: I'll help create Jekyll templates
    
    loop Iterative Development
        Cline->>Me: Here's a template/component
        Me->>Jekyll: Test locally
        Me->>Cline: Feedback and adjustments
    end
    
    Me->>GitHub: Push changes
    GitHub->>Me: Deploy site
```

Working with Cline made the process much more efficient. Instead of spending hours researching Jekyll's structure or debugging CSS issues, I could focus on making decisions about the design and content while Cline handled much of the implementation details.

## The Frame Design Challenge

One of the most distinctive elements of my WordPress site was the frame design - that white border with connecting lines that gave my site its unique look. Recreating this in CSS was one of our biggest challenges.

In WordPress, this was implemented using images, but for better performance and maintainability, we decided to recreate it using CSS pseudo-elements:

```mermaid
graph TD
    A[Frame Design Challenge] --> B[Original WordPress Implementation]
    A --> C[GitHub Pages Solution]
    
    B --> B1[Image-based borders]
    B --> B2[Limited flexibility]
    
    C --> C1[CSS pseudo-elements]
    C --> C2[Pure CSS implementation]
    
    C1 --> D1[::before for horizontal lines]
    C1 --> D2[::after for vertical lines]
    
    style A fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
```

The CSS implementation was tricky, but with Cline's help, we got it working perfectly:

```css
/* Post card container */
.post-card {
    position: relative;
    background-color: rgba(122, 1, 119, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 30px;
    margin-bottom: 50px;
    border-radius: 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Create a second border box underneath */
.post-card::after {
    content: '';
    position: absolute;
    top: 10px;
    bottom: -12px;
    right: -10px;
    width: 2px;
    background-color: #ffffff;
}

/* Create bottom horizontal line */
.post-card::before {
    content: '';
    position: absolute;
    left: 10px;
    right: -10px;
    bottom: -12px;
    height: 2px;
    background-color: #ffffff;
}
```

This pure CSS approach not only looked identical to the original design but also loaded faster and was easier to maintain.

## Blog Post Structure

Another important aspect was ensuring my blog posts maintained their structure and styling. In WordPress, this was handled by the theme, but in Jekyll, we needed to create a custom layout:

```mermaid
graph TD
    A[Blog Post Structure] --> B[YAML Front Matter]
    A --> C[Markdown Content]
    A --> D[Layout Template]
    
    B --> B1[title]
    B --> B2[date]
    B --> B3[tags]
    
    C --> C1[Headings]
    C --> C2[Paragraphs]
    C --> C3[Images]
    
    D --> D1[Post Header]
    D --> D2[Content Area]
    D --> D3[Tags Display]
    
    style A fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
```

The Jekyll post structure was actually simpler and more intuitive than WordPress. Each post is a Markdown file with YAML front matter:

```markdown
---
layout: post
title: "Post Title"
date: 2025-04-20
tags: [tag1, tag2, tag3]
---

# Post Title

Content goes here...
```

This approach felt much more natural to me as a developer. No more fighting with the WordPress editor or worrying about formatting issues!

## The Sunday Marathon

What I thought might take a few hours ended up consuming my entire Sunday. Here's roughly how the day broke down:

```mermaid
gantt
    title Sunday Migration Timeline
    dateFormat  HH:mm
    axisFormat %H:%M
    
    section Morning
    Coffee & Planning           :a1, 08:00, 1h
    Setting Up Jekyll           :a2, 09:00, 1h
    Creating Basic Templates    :a3, 10:00, 2h
    
    section Afternoon
    CSS Styling                 :b1, 12:00, 2h
    Lunch Break                 :b2, 14:00, 30m
    Content Migration           :b3, 14:30, 2h
    
    section Evening
    Debugging Issues            :c1, 16:30, 2h
    Final Touches               :c2, 18:30, 1h
    Testing & Deployment        :c3, 19:30, 1h
    Celebration Drink           :c4, 20:30, 30m
```

By the end of the day, I was exhausted but satisfied. The site was up and running on GitHub Pages, looking almost identical to my WordPress site but with all the benefits of a static site generator.

## Lessons Learned

This migration taught me several valuable lessons:

1. **Start with a clear plan**: Having a detailed migration plan made the process much smoother.
2. **Leverage AI assistance**: Cline saved me hours of research and debugging.
3. **Focus on the core elements**: Identifying the key visual elements helped prioritize the work.
4. **Test continuously**: Regular testing throughout the day caught issues early.
5. **Document everything**: I created detailed documentation of the migration process for future reference.

## The Result

The final result was worth every minute spent. My blog now loads faster, is easier to maintain, and gives me complete control over the content and design. Plus, I can write posts in Markdown, which feels much more natural than the WordPress editor.

```mermaid
graph LR
    A[WordPress Blog] --> B[GitHub Pages Blog]
    
    A --> A1[Pros]
    A --> A2[Cons]
    
    B --> B1[Pros]
    B --> B2[Cons]
    
    A1 --> A1a[Familiar interface]
    A1 --> A1b[Plugin ecosystem]
    
    A2 --> A2a[Slow loading]
    A2 --> A2b[Monthly costs]
    A2 --> A2c[Complex updates]
    
    B1 --> B1a[Fast loading]
    B1 --> B1b[Free hosting]
    B1 --> B1c[Version control]
    B1 --> B1d[Markdown writing]
    
    B2 --> B2a[Learning curve]
    B2 --> B2b[Limited dynamic features]
    
    style A fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style A1 fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style A2 fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B1 fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
    style B2 fill:#6d105a,stroke:#fff,stroke-width:2px,color:#fff
```

If you're considering a similar migration, I highly recommend giving it a try. Yes, it might take your entire Sunday (and maybe a bit of your sanity), but the result is a blog that truly feels like your own again.

And if you do decide to take the plunge, consider bringing Cline along for the journey. Having an AI pair programmer made the process not just more efficient, but also more enjoyable. It's like having a knowledgeable friend who never gets tired of your questions or debugging requests.

Off to enjoy the last hour of my day.

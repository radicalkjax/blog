# Timeline Blog Post Tagging Guide

This guide explains how to tag your blog posts so they appear on the Personal Journey timeline.

## How It Works

Blog posts automatically appear on timeline markers through **tag matching**. When you click a timeline marker, the system finds all blog posts that share tags with that marker.

## Two Ways to Link Posts to Timeline

### Method 1: Tag Matching (Recommended)

Simply use the same tags in your blog post that exist in the timeline markers. The system will automatically find and display posts with matching tags.

**Example:**

Timeline marker (`_timeline/bottom-surgery/decision.md`):
```yaml
---
marker_id: bottom-surgery-decision
date: 2024-10-30
title: "Made the Decision"
timeline: bottom-surgery
tags:
  - transgender
  - bottom-surgery
---
```

Blog post (`_posts/2024-10-30-bottom-surgery-hurdles-prep-and-joy.md`):
```yaml
---
layout: post
title: "Bottom Surgery - Hurdles, Prep, and Joy"
date: 2024-10-30
tags:
  - transgender
  - bottom-surgery
---
```

This post will automatically appear under the "Made the Decision" marker because they share the `transgender` and `bottom-surgery` tags.

### Method 2: Explicit Marker Reference

You can also explicitly link a post to a specific marker using the `timeline_marker` field:

```yaml
---
layout: post
title: "My Coming Out Story"
date: 2024-06-15
tags:
  - personal
  - transgender
timeline_marker: coming-out-publicly
---
```

This links the post directly to the marker with ID `coming-out-publicly`, even if tags don't match perfectly.

### Method 3: Custom Timeline Date

If you want to place a post at a specific point on the timeline that differs from its publication date, use the `timeline_date` field:

```yaml
---
layout: post
title: "Reflections on Coming Out"
date: 2024-12-15
timeline_date: 2021-08-15
tags:
  - transgender
  - coming-out
---
```

In this example:
- The post was **published** on December 15, 2024 (blog date)
- But it will appear on the timeline at **August 15, 2021** (timeline date)
- This is useful for retrospective posts about past events
- If `timeline_date` is not specified, the post's `date` field is used

## Timeline Marker Date Ranges

Timeline markers can specify a date range to control which posts appear on them:

**Marker file** (`_timeline/bottom-surgery/decision.md`):
```yaml
---
marker_id: bottom-surgery-decision
date: 2024-10-30
date_begin: 2021-08-01
date_end: 2024-10-30
title: "Made the Decision"
timeline: bottom-surgery
tags:
  - transgender
  - bottom-surgery
---
```

**How it works:**
- `date`: The primary date displayed for the marker (required)
- `date_begin`: Start of the date range (optional)
- `date_end`: End of the date range (optional)
- Posts will only appear on this marker if their `timeline_date` (or `date`) falls between `date_begin` and `date_end` (inclusive)
- If no date range is specified, all posts with matching tags will appear

**Example scenario:**

If a marker has `date_begin: 2021-08-01` and `date_end: 2024-10-30`:

| Post timeline_date | Matching tags? | Will appear? | Reason |
|--------------------|----------------|--------------|---------|
| 2023-05-15 | ✅ Yes | ✅ **YES** | Within date range |
| 2020-01-01 | ✅ Yes | ❌ **NO** | Too early (before date_begin) |
| 2025-01-01 | ✅ Yes | ❌ **NO** | Too late (after date_end) |
| 2023-05-15 | ❌ No | ❌ **NO** | No matching tags |

## Available Timeline Tags

Current timeline markers use these tags:

### Core Tags
- `transgender` - Used across all timeline markers
- `personal` - General personal milestones
- `milestone` - Major life events

### Journey-Specific Tags
- `coming-out` - Coming out journey markers
- `bottom-surgery` - Bottom surgery journey markers
- `ffs` - FFS (Facial Feminization Surgery) journey markers

### Sub-Tags
- `self-acceptance` - Internal journey moments
- `family` - Family-related events
- `public` - Public coming out events
- `medical` - Medical procedures and appointments
- `research` - Research and planning phases
- `upcoming` - Future planned events

## Best Practices

1. **Use multiple tags**: Posts with multiple matching tags will appear more relevant
2. **Be consistent**: Use the exact tag names as shown above (case-sensitive)
3. **Use specific sub-tags**: Use journey-specific tags like `bottom-surgery` or `coming-out` to target specific timeline sections
4. **Add timeline dates**: If your post should appear at a specific point in the timeline, add tags that match markers near that date

## Example Blog Post Setup

```yaml
---
layout: post
title: "One Week Post-Op: Recovery Update"
date: 2024-11-15
tags:
  - transgender
  - bottom-surgery
  - medical
  - milestone
excerpt: "Reflections on my first week of recovery after gender confirmation surgery."
---

Your blog post content here...
```

This post would appear on ANY timeline marker that has matching tags, such as:
- Markers with `transgender` tag
- Markers with `bottom-surgery` tag
- Markers with `medical` tag
- Markers with `milestone` tag

## Viewing Timeline Marker Tags

To see what tags a timeline marker uses:

```bash
# View all timeline markers and their tags
grep -r "tags:" _timeline/

# View a specific marker
cat _timeline/bottom-surgery/decision.md
```

## Testing Your Tags

1. Add tags to your blog post
2. Run Jekyll locally: `bundle exec jekyll serve`
3. Navigate to the Personal Journey page
4. Click on timeline markers to see if your post appears under "Related Blog Posts"

## Questions?

- **Q: Can one post appear on multiple timeline markers?**
  A: Yes! If your post shares tags with multiple markers, it will appear on all of them.

- **Q: Do I need to put my posts in the `_timeline` folder?**
  A: No! Regular blog posts in `_posts/` will automatically appear on the timeline through tag matching.

- **Q: What if I want to create a new tag?**
  A: Add the tag to your blog post AND to the relevant timeline marker file in `_timeline/`.

- **Q: Can I use custom dates for timeline placement?**
  A: The timeline uses the marker's date, not the post's date. Posts appear grouped under markers, not at specific timeline positions.

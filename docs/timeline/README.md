# Timeline System Documentation

This directory contains all documentation for the Personal Journey timeline feature.

## Documentation Files

### [TIMELINE_PLAN.md](./TIMELINE_PLAN.md)
Original planning document for the timeline system. Includes:
- System architecture and design
- Data structure specifications
- Component breakdown
- UI/UX requirements
- Implementation roadmap

### [IMPLEMENTATION_STRATEGY.md](./IMPLEMENTATION_STRATEGY.md)
Technical implementation guide covering:
- Jekyll integration approach
- JavaScript architecture
- CSS styling strategy
- Performance considerations
- Testing procedures

### [TIMELINE_TAGGING.md](./TIMELINE_TAGGING.md)
Guide for tagging timeline markers to link them with blog posts:
- Tag structure and conventions
- How tags connect timelines to posts
- Best practices for tagging
- Examples and use cases

### [RESOURCES.md](./RESOURCES.md)
**NEW** - Complete guide to the timeline resources feature:
- Adding files (PDFs, images, spreadsheets, etc.) to timeline markers
- How resource previews work
- Supported file types and preview capabilities
- Technical implementation details
- Troubleshooting guide

## Quick Start

### Using the Timeline

1. **View Timeline**: Navigate to `/personal-journey.html`
2. **Click Markers**: Click any marker to view details
3. **Explore Breakouts**: Markers with breakout timelines can be expanded
4. **View Resources**: Markers with an "R" indicator have attached files

### Adding Timeline Content

1. **Create Marker**: Add a `.md` file to `_timeline/{timeline-name}/`
2. **Set Frontmatter**: Include required fields (marker_id, date, title, timeline, etc.)
3. **Add Tags**: Tag with relevant topics to link with blog posts
4. **Add Resources** (optional): Create a `resources/` folder and add files

### Adding Resources to a Marker

```bash
# Create resources folder
mkdir -p assets/timeline-resources/bottom-surgery/resources/

# Add files
cp appointment.ics assets/timeline-resources/bottom-surgery/resources/
cp expenses.csv assets/timeline-resources/bottom-surgery/resources/
cp consent-form.pdf assets/timeline-resources/bottom-surgery/resources/

# Commit and build
git add assets/timeline-resources/
git commit -m "Add timeline resources"
bundle exec jekyll serve
```

## Timeline Directory Structure

```
_timeline/                  # Marker definitions
├── personal-journey/        # Top-level timeline
│   └── transition-journey.md
├── transition/             # Mid-level timeline
│   ├── bottom-surgery.md
│   ├── coming-out.md
│   └── ffs.md
├── bottom-surgery/         # Breakout timeline
│   ├── decision.md
│   ├── surgery-scheduled.md
│   └── trust-physician.md
├── coming-out/
│   ├── accepting-myself.md
│   ├── public-coming-out.md
│   └── told-family.md
└── ffs/
    └── research-phase.md

assets/timeline-resources/  # Resources (separate from markers)
└── bottom-surgery/
    └── resources/
        ├── appointment.ics
        ├── expenses.csv
        └── consent-form.pdf
```

## Key Concepts

### Three-Level Hierarchy
1. **Top Level**: Main journey (`personal-journey`)
2. **Mid Level**: Major milestones (`transition`, `career`, etc.)
3. **Breakout Level**: Detailed sub-timelines (`bottom-surgery`, `coming-out`, etc.)

### Marker Files
Each timeline marker is a Markdown file with frontmatter:

```yaml
---
marker_id: unique-id
date: 2024-10-30
title: "Marker Title"
description: "Brief description"
icon: hospital           # FontAwesome icon name
color: "#f84ef8"        # Optional custom color
timeline: timeline-name  # Parent timeline
has_breakout: true      # Optional: Has sub-timeline
breakout_timeline: sub-timeline-name  # Optional
tags:
  - tag1
  - tag2
---

Detailed content here (Markdown).
```

### Resources Feature

Resources are files attached to timeline markers:
- Stored directly in `assets/timeline-resources/{timeline-name}/resources/`
- Served as static files (no plugin required)
- Works with GitHub Pages safe mode
- Displayed with real content previews
- Accessible via tabbed interface

## GitHub Pages Deployment

The timeline system is fully compatible with GitHub Pages:

- **No plugins required**: Resources are static files in `assets/timeline-resources/`
- **Safe mode compatible**: Works with GitHub Pages' restricted Jekyll environment
- **No build step needed**: Just commit files and push

To deploy:
1. Ensure all resources are in `assets/timeline-resources/{timeline-name}/resources/`
2. Commit and push to your repository
3. GitHub Pages will build and serve the site automatically

## Related Documentation

- [Main Documentation Index](../INDEX.md)
- [Components Documentation](../components/README.md)
- [Development Guide](../development/README.md)

## Support

For issues or questions:
1. Check the troubleshooting sections in each document
2. Review the console for JavaScript errors
3. Ensure files are committed to the repository
4. Clear browser cache if changes aren't appearing

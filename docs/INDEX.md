# Documentation Index

## Quick Navigation

### 📊 Current Status & Overview
- **[Current State](./CURRENT_STATE.md)** - Live status of the website (September 2025)
- **[Repository Organization](./REPO_ORGANIZATION.md)** - Directory structure and file organization
- **[Documentation Hub](./README.md)** - Main documentation portal

### 🏗️ Architecture & Technical
- **[Architecture Overview](./architecture/README.md)** - Site structure, data flow, technical stack
- **[Components Guide](./components/README.md)** - Layouts, includes, and component documentation
- **[Security Headers](./SECURITY-HEADERS.md)** - Security configuration and headers

### 💻 Development
- **[Development Guide](./development/README.md)** - Local setup, content creation, testing
- **[Customization Guide](./customization/README.md)** - Theme customization, adding features
- **[Deployment Guide](./deployment/README.md)** - GitHub Pages deployment, custom domains

### 📜 Historical Documentation
- **[Migration Documentation](./MIGRATION_DOCUMENTATION.md)** - WordPress to Jekyll migration (April 2025)

## Documentation Structure

```
docs/
├── INDEX.md                    # This file - documentation index
├── README.md                   # Documentation hub with overview
├── CURRENT_STATE.md           # Current website status and features
├── REPO_ORGANIZATION.md       # Repository structure guide
├── SECURITY-HEADERS.md        # Security configuration
├── MIGRATION_DOCUMENTATION.md # Historical migration docs
│
├── architecture/              # Technical architecture
│   └── README.md             # Site structure and data flow
│
├── components/               # Component documentation
│   └── README.md            # Layouts, includes, features
│
├── development/             # Development guides
│   └── README.md           # Local setup and workflow
│
├── deployment/              # Deployment documentation
│   └── README.md          # GitHub Pages and domains
│
└── customization/          # Customization guides
    └── README.md         # Theme and feature customization
```

## Key Documentation by Topic

### For Site Maintenance
1. Start with [Current State](./CURRENT_STATE.md) to understand what's live
2. Review [Repository Organization](./REPO_ORGANIZATION.md) for file locations
3. Check [Development Guide](./development/README.md) for making changes

### For Adding Content
1. [Development Guide](./development/README.md#content-creation) - How to add blog posts, pages, photos
2. [Components Guide](./components/README.md) - Understanding page components
3. [Current State](./CURRENT_STATE.md#maintenance-notes) - Quick command reference

### For Technical Changes
1. [Architecture Overview](./architecture/README.md) - Understanding the technical stack
2. [Components Guide](./components/README.md) - Component specifications
3. [Customization Guide](./customization/README.md) - Making modifications

### For Deployment
1. [Deployment Guide](./deployment/README.md) - GitHub Pages setup
2. [Security Headers](./SECURITY-HEADERS.md) - Security configuration
3. [Current State](./CURRENT_STATE.md#build-commands) - Build and test commands

## Recent Updates

### September 2025
- Complete repository reorganization
- Documentation restructuring
- Updated all paths and permalinks
- Created comprehensive documentation index

### August 2025
- Enhanced blog features (TOC, Key Terms, Print)
- Mobile responsive improvements
- SomaFM player integration
- Performance optimizations

### May 2025
- Internationalization support (8 languages)
- PWA features implementation
- Security headers configuration

### April 2025
- Initial WordPress to Jekyll migration
- Basic site structure setup
- Core functionality implementation

## Quick Commands

```bash
# Local development
bundle exec jekyll serve --host 0.0.0.0 --port 4000

# Production build
bundle exec jekyll build

# Run tests
npm test

# Performance check
npx lighthouse http://localhost:4000

# Clean and rebuild
bundle exec jekyll clean && bundle exec jekyll build
```

## Support Resources

- **GitHub Repository**: [radicalkjax/blog](https://github.com/radicalkjax/blog)
- **Live Site**: [radicalkjax.com](https://radicalkjax.com)
- **Jekyll Documentation**: [jekyllrb.com](https://jekyllrb.com)

## Documentation Standards

All documentation follows these standards:
- **Markdown formatting** with proper headers
- **Last Updated** dates on all docs
- **Mermaid diagrams** for visual representations
- **Code examples** with syntax highlighting
- **Clear navigation** and cross-references

---

*For questions or updates to documentation, please create an issue in the GitHub repository.*
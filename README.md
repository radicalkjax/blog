# Kali Jackson's Personal Website

This repository contains the source code for Kali Jackson's personal website, hosted on GitHub Pages.

## Overview

This website serves as a personal blog and portfolio for Kali Jackson (@radicalkjax), showcasing:

- Blog posts on various topics
- Projects in software engineering, security research, and AI
- Art gallery
- About me information
- Connection methods

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Font Awesome for icons
- GitHub Pages for hosting

## Local Development

To run this site locally:

1. Clone the repository:
   ```
   git clone https://github.com/radicalkjax/radicalkjax.github.io.git
   ```

2. Navigate to the project directory:
   ```
   cd radicalkjax.github.io
   ```

3. Open the site in your browser:
   - You can simply open the `index.html` file in your browser
   - Alternatively, you can use a local server like Python's built-in HTTP server:
     ```
     python -m http.server
     ```
     Then visit `http://localhost:8000` in your browser

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Custom Domain Setup

To use a custom domain with this GitHub Pages site:

1. Update the CNAME file with your domain
2. Configure your domain's DNS settings:
   - Add an A record pointing to GitHub Pages IP addresses
   - Add a CNAME record for www subdomain pointing to your GitHub Pages URL

## Structure

- `index.html` - Main page with blog posts
- `blog.html` - Dedicated blog page
- `projects.html` - Projects showcase
- `art.html` - Art gallery
- `about.html` - About me information
- `connections.html` - Contact information and social links
- `assets/` - Directory containing CSS, JavaScript, fonts, and images
- `_config.yml` - GitHub Pages configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Design inspired by the Pixl WordPress theme
- Font: DM Mono
- Icons: Font Awesome

## Contact

For any questions or feedback, please reach out through the contact form on the website or via social media.

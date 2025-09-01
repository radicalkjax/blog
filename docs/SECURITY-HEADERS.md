# Security Headers Configuration Guide

## Overview

This Jekyll site implements comprehensive security headers to protect against common web vulnerabilities. Headers are configured both via HTML meta tags and server-level configurations.

## Implemented Security Headers

### 1. Content Security Policy (CSP)
**Purpose**: Controls which resources the browser is allowed to load  
**Configuration**:
```
default-src 'self' https:;
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://api.github.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

### 2. X-Frame-Options
**Purpose**: Prevents clickjacking attacks  
**Value**: `DENY` - Page cannot be displayed in a frame

### 3. X-Content-Type-Options
**Purpose**: Prevents MIME type sniffing  
**Value**: `nosniff` - Blocks requests if type doesn't match

### 4. X-XSS-Protection
**Purpose**: XSS protection for older browsers  
**Value**: `1; mode=block` - Enables XSS filter and blocks rendering

### 5. Referrer-Policy
**Purpose**: Controls referrer information sent with requests  
**Value**: `strict-origin-when-cross-origin` - Full URL for same-origin, origin only for cross-origin

### 6. Permissions-Policy
**Purpose**: Controls access to browser features and APIs  
**Value**: Disables unnecessary features:
- accelerometer, camera, geolocation, gyroscope
- magnetometer, microphone, payment, usb

### 7. Strict-Transport-Security (HSTS)
**Purpose**: Forces HTTPS connections  
**Value**: `max-age=31536000; includeSubDomains; preload`  
- Enforces HTTPS for 1 year
- Includes all subdomains
- Eligible for browser preload lists

### 8. Additional Headers
- **X-Permitted-Cross-Domain-Policies**: `none` - Prevents cross-domain data loading
- **Expect-CT**: `max-age=86400, enforce` - Certificate Transparency enforcement

## Implementation Methods

### 1. HTML Meta Tags (Default)
Located in `_layouts/default.html`, these work on all hosting platforms:
```html
<meta http-equiv="Content-Security-Policy" content="...">
<meta http-equiv="X-Frame-Options" content="DENY">
```

### 2. Server Configurations

#### Netlify
File: `_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  ...
```

#### Vercel
File: `vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [...]
    }
  ]
}
```

#### Cloudflare Pages
File: `_headers.txt`
```
/*
  X-Frame-Options: DENY
  ...
```

#### Apache
File: `.htaccess`
```apache
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
...
```

#### Nginx
File: `nginx.conf.example`
```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
...
```

## Testing Security Headers

### 1. Using the Test Script
```bash
node test-security-headers.js https://your-site.com
```

### 2. Online Tools
- [Security Headers](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

### 3. Browser Developer Tools
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reload the page
4. Click on the main document request
5. Check Response Headers

## Deployment Checklist

- [ ] HTML meta tags are present in all layouts
- [ ] Server configuration file added for your hosting platform
- [ ] HTTPS is enabled (required for HSTS)
- [ ] CSP policy tested with your site's resources
- [ ] No console errors from blocked resources
- [ ] Security headers test passing (grade A or B)

## Troubleshooting

### CSP Violations
If resources are blocked:
1. Check browser console for CSP errors
2. Add trusted domains to appropriate CSP directives
3. Avoid using 'unsafe-inline' unless necessary

### HSTS Issues
- Only enable HSTS after confirming HTTPS works correctly
- Start with shorter max-age (e.g., 86400) for testing
- Be careful with includeSubDomains directive

### Cache Headers Conflicts
- Service worker and manifest should not be cached
- Static assets can be cached for long periods
- Use cache busting for updated resources

## Security Best Practices

1. **Regular Updates**: Keep dependencies and plugins updated
2. **HTTPS Only**: Always use HTTPS in production
3. **Subresource Integrity**: Add SRI hashes for external scripts
4. **Environment Variables**: Never commit secrets or API keys
5. **Input Validation**: Sanitize user inputs
6. **Regular Audits**: Run security tests periodically

## Resources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Documentation](https://securityheaders.com/)
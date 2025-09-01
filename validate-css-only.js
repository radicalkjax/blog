#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function validateCSS(cssContent) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2);
        const formData = [
            `--${boundary}`,
            'Content-Disposition: form-data; name="text"',
            '',
            cssContent,
            `--${boundary}`,
            'Content-Disposition: form-data; name="profile"',
            '',
            'css3svg',
            `--${boundary}`,
            'Content-Disposition: form-data; name="output"',
            '',
            'json',
            `--${boundary}--`
        ].join('\r\n');

        const options = {
            hostname: 'jigsaw.w3.org',
            port: 443,
            path: '/css-validator/validator',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(formData),
                'User-Agent': 'W3C Validator Script'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', reject);
        req.write(formData);
        req.end();
    });
}

async function main() {
    console.log(`${colors.blue}CSS W3C Validator${colors.reset}`);
    console.log('═'.repeat(60));
    
    const cssDir = '/Users/kali/blog/assets/css';
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    
    let totalErrors = 0;
    let totalWarnings = 0;
    
    for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        console.log(`\n${colors.cyan}Validating: ${file}${colors.reset}`);
        console.log('─'.repeat(40));
        
        try {
            const result = await validateCSS(content);
            const validation = result.cssvalidation;
            
            if (!validation) {
                console.log(`${colors.red}✗ Validation failed${colors.reset}`);
                totalErrors++;
                continue;
            }
            
            const errors = validation.errors || [];
            const warnings = validation.warnings || [];
            
            if (errors.length === 0 && warnings.length === 0) {
                console.log(`${colors.green}✓ Valid CSS (no errors or warnings)${colors.reset}`);
            } else {
                if (errors.length > 0) {
                    console.log(`${colors.red}✗ ${errors.length} error(s)${colors.reset}`);
                    errors.forEach(err => {
                        console.log(`  ${colors.red}Line ${err.line}: ${err.message}${colors.reset}`);
                    });
                    totalErrors += errors.length;
                }
                
                if (warnings.length > 0) {
                    console.log(`${colors.yellow}⚠ ${warnings.length} warning(s)${colors.reset}`);
                    warnings.forEach(warn => {
                        console.log(`  ${colors.yellow}Line ${warn.line}: ${warn.message}${colors.reset}`);
                    });
                    totalWarnings += warnings.length;
                }
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
        }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`${colors.cyan}Summary${colors.reset}`);
    console.log('─'.repeat(60));
    console.log(`Total CSS files validated: ${cssFiles.length}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);
    
    if (totalErrors === 0 && totalWarnings === 0) {
        console.log(`\n${colors.green}✓ ALL CSS FILES ARE VALID WITH NO WARNINGS!${colors.reset}`);
    } else if (totalErrors === 0) {
        console.log(`\n${colors.yellow}⚠ CSS is valid but has ${totalWarnings} warning(s)${colors.reset}`);
    } else {
        console.log(`\n${colors.red}✗ CSS validation failed with ${totalErrors} error(s)${colors.reset}`);
    }
}

main();
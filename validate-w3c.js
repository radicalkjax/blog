#!/usr/bin/env node

/**
 * W3C HTML and CSS Validation Script
 * Validates HTML and CSS files against W3C standards
 */

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
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

/**
 * Validate HTML using W3C Validator API
 */
async function validateHTML(htmlContent, filename) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'validator.w3.org',
            port: 443,
            path: '/nu/?out=json',
            method: 'POST',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Length': Buffer.byteLength(htmlContent),
                'User-Agent': 'W3C Validator Script'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse validation response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(htmlContent);
        req.end();
    });
}

/**
 * Validate CSS using W3C CSS Validator API
 */
async function validateCSS(cssContent, filename) {
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

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    // CSS validator sometimes returns HTML on error
                    resolve({
                        cssvalidation: {
                            validity: false,
                            errors: [{
                                message: 'Failed to parse CSS validation response'
                            }]
                        }
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(formData);
        req.end();
    });
}

/**
 * Format and display HTML validation results
 */
function displayHTMLResults(results, filename) {
    const messages = results.messages || [];
    const errors = messages.filter(m => m.type === 'error');
    const warnings = messages.filter(m => m.type === 'warning' || m.type === 'info');

    console.log(`\n${colors.cyan}HTML Validation: ${filename}${colors.reset}`);
    console.log('─'.repeat(60));

    if (errors.length === 0 && warnings.length === 0) {
        console.log(`${colors.green}✓ Valid HTML${colors.reset}`);
        return { errors: 0, warnings: 0 };
    }

    if (errors.length > 0) {
        console.log(`\n${colors.red}Errors (${errors.length}):${colors.reset}`);
        errors.forEach((error, index) => {
            console.log(`${colors.red}${index + 1}. Line ${error.lastLine || '?'}, Column ${error.lastColumn || '?'}${colors.reset}`);
            console.log(`   ${error.message}`);
            if (error.extract) {
                console.log(`   ${colors.gray}${error.extract}${colors.reset}`);
            }
        });
    }

    if (warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${warnings.length}):${colors.reset}`);
        warnings.slice(0, 5).forEach((warning, index) => {
            console.log(`${colors.yellow}${index + 1}. Line ${warning.lastLine || '?'}, Column ${warning.lastColumn || '?'}${colors.reset}`);
            console.log(`   ${warning.message}`);
        });
        if (warnings.length > 5) {
            console.log(`   ${colors.gray}... and ${warnings.length - 5} more warnings${colors.reset}`);
        }
    }

    return { errors: errors.length, warnings: warnings.length };
}

/**
 * Format and display CSS validation results
 */
function displayCSSResults(results, filename) {
    const validation = results.cssvalidation;
    
    console.log(`\n${colors.cyan}CSS Validation: ${filename}${colors.reset}`);
    console.log('─'.repeat(60));

    if (!validation) {
        console.log(`${colors.red}✗ Validation failed${colors.reset}`);
        return { errors: 1, warnings: 0 };
    }

    const errors = validation.errors || [];
    const warnings = validation.warnings || [];

    if (validation.validity && errors.length === 0) {
        console.log(`${colors.green}✓ Valid CSS${colors.reset}`);
        return { errors: 0, warnings: warnings.length };
    }

    if (errors.length > 0) {
        console.log(`\n${colors.red}Errors (${errors.length}):${colors.reset}`);
        errors.slice(0, 10).forEach((error, index) => {
            console.log(`${colors.red}${index + 1}. Line ${error.line || '?'}${colors.reset}`);
            console.log(`   ${error.message}`);
            if (error.context) {
                console.log(`   ${colors.gray}${error.context}${colors.reset}`);
            }
        });
        if (errors.length > 10) {
            console.log(`   ${colors.gray}... and ${errors.length - 10} more errors${colors.reset}`);
        }
    }

    if (warnings.length > 0) {
        console.log(`\n${colors.yellow}Warnings (${warnings.length}):${colors.reset}`);
        warnings.slice(0, 5).forEach((warning, index) => {
            console.log(`${colors.yellow}${index + 1}. Line ${warning.line || '?'}${colors.reset}`);
            console.log(`   ${warning.message}`);
        });
        if (warnings.length > 5) {
            console.log(`   ${colors.gray}... and ${warnings.length - 5} more warnings${colors.reset}`);
        }
    }

    return { errors: errors.length, warnings: warnings.length };
}

/**
 * Validate local files
 */
async function validateLocalFiles(directory) {
    const stats = {
        html: { total: 0, errors: 0, warnings: 0 },
        css: { total: 0, errors: 0, warnings: 0 }
    };

    // Find HTML files in _site directory
    const htmlFiles = [];
    function findHTMLFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                findHTMLFiles(filePath);
            } else if (file.endsWith('.html')) {
                htmlFiles.push(filePath);
            }
        });
    }

    const siteDir = path.join(directory, '_site');
    if (fs.existsSync(siteDir)) {
        console.log(`${colors.blue}Validating HTML files in ${siteDir}${colors.reset}`);
        findHTMLFiles(siteDir);

        // Validate all HTML files
        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(directory, file);
            
            try {
                const results = await validateHTML(content, relativePath);
                const counts = displayHTMLResults(results, relativePath);
                stats.html.total++;
                stats.html.errors += counts.errors;
                stats.html.warnings += counts.warnings;
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`${colors.red}Failed to validate ${relativePath}: ${error.message}${colors.reset}`);
            }
        }

    }

    // Find and validate CSS files
    const cssDir = path.join(directory, 'assets', 'css');
    if (fs.existsSync(cssDir)) {
        console.log(`\n${colors.blue}Validating CSS files in ${cssDir}${colors.reset}`);
        const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
        
        for (const file of cssFiles) {
            const filePath = path.join(cssDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            try {
                const results = await validateCSS(content, file);
                const counts = displayCSSResults(results, file);
                stats.css.total++;
                stats.css.errors += counts.errors;
                stats.css.warnings += counts.warnings;
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`${colors.red}Failed to validate ${file}: ${error.message}${colors.reset}`);
            }
        }
    }

    return stats;
}

/**
 * Main function
 */
async function main() {
    console.log(`${colors.blue}W3C HTML & CSS Validator${colors.reset}`);
    console.log('═'.repeat(60));

    try {
        const directory = process.cwd();
        const stats = await validateLocalFiles(directory);

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log(`${colors.cyan}Validation Summary${colors.reset}`);
        console.log('─'.repeat(60));
        
        console.log(`HTML Files: ${stats.html.total} validated`);
        if (stats.html.errors === 0) {
            console.log(`  ${colors.green}✓ No errors${colors.reset}`);
        } else {
            console.log(`  ${colors.red}✗ ${stats.html.errors} errors${colors.reset}`);
        }
        if (stats.html.warnings > 0) {
            console.log(`  ${colors.yellow}⚠ ${stats.html.warnings} warnings${colors.reset}`);
        }

        console.log(`\nCSS Files: ${stats.css.total} validated`);
        if (stats.css.errors === 0) {
            console.log(`  ${colors.green}✓ No errors${colors.reset}`);
        } else {
            console.log(`  ${colors.red}✗ ${stats.css.errors} errors${colors.reset}`);
        }
        if (stats.css.warnings > 0) {
            console.log(`  ${colors.yellow}⚠ ${stats.css.warnings} warnings${colors.reset}`);
        }

        // Overall grade
        const totalErrors = stats.html.errors + stats.css.errors;
        const totalWarnings = stats.html.warnings + stats.css.warnings;
        
        console.log('\n' + '─'.repeat(60));
        if (totalErrors === 0) {
            console.log(`${colors.green}✓ Validation PASSED${colors.reset}`);
            if (totalWarnings > 0) {
                console.log(`${colors.yellow}Note: ${totalWarnings} warnings found (non-critical)${colors.reset}`);
            }
        } else {
            console.log(`${colors.red}✗ Validation FAILED${colors.reset}`);
            console.log(`${colors.red}${totalErrors} errors must be fixed${colors.reset}`);
        }

        // Recommendations
        if (totalErrors > 0 || totalWarnings > 50) {
            console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
            if (stats.html.errors > 0) {
                console.log('• Fix HTML errors (check for unclosed tags, invalid attributes)');
            }
            if (stats.css.errors > 0) {
                console.log('• Fix CSS errors (check for syntax errors, invalid properties)');
            }
            if (totalWarnings > 50) {
                console.log('• Review warnings to improve code quality');
            }
            console.log('• Run validation again after making fixes');
        }

    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { validateHTML, validateCSS };
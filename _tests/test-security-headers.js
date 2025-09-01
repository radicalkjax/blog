#!/usr/bin/env node

/**
 * Security Headers Test Script
 * Tests if security headers are properly configured
 */

const https = require('https');
const http = require('http');
const url = require('url');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Required security headers
const requiredHeaders = {
    'x-frame-options': {
        expected: ['DENY', 'SAMEORIGIN'],
        description: 'Prevents clickjacking attacks'
    },
    'x-content-type-options': {
        expected: ['nosniff'],
        description: 'Prevents MIME type sniffing'
    },
    'x-xss-protection': {
        expected: ['1; mode=block'],
        description: 'XSS protection for older browsers'
    },
    'referrer-policy': {
        expected: ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin'],
        description: 'Controls referrer information'
    },
    'content-security-policy': {
        expected: null, // Just check if exists
        description: 'Controls resources the browser can load'
    },
    'strict-transport-security': {
        expected: null, // Just check if exists
        description: 'Forces HTTPS connections'
    },
    'permissions-policy': {
        expected: null, // Just check if exists
        description: 'Controls browser features/APIs'
    }
};

// Optional but recommended headers
const optionalHeaders = {
    'x-permitted-cross-domain-policies': {
        expected: ['none'],
        description: 'Controls cross-domain policies'
    },
    'expect-ct': {
        expected: null,
        description: 'Certificate Transparency'
    }
};

function testUrl(testUrl) {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(testUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path,
            method: 'HEAD',
            timeout: 10000
        };
        
        const req = protocol.request(options, (res) => {
            resolve({
                statusCode: res.statusCode,
                headers: res.headers
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

function checkHeader(headers, headerName, headerConfig) {
    const value = headers[headerName.toLowerCase()];
    
    if (!value) {
        return { present: false };
    }
    
    if (!headerConfig.expected) {
        return { present: true, valid: true, value };
    }
    
    const isValid = headerConfig.expected.some(expected => 
        value.toLowerCase().includes(expected.toLowerCase())
    );
    
    return { present: true, valid: isValid, value };
}

function printResults(results, title, headers) {
    console.log(`\n${colors.cyan}${title}${colors.reset}`);
    console.log('─'.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    for (const [header, config] of Object.entries(headers)) {
        const result = results[header];
        
        if (!result.present) {
            console.log(`${colors.red}✗${colors.reset} ${header}`);
            console.log(`  ${colors.yellow}Missing: ${config.description}${colors.reset}`);
            failed++;
        } else if (result.valid === false) {
            console.log(`${colors.yellow}⚠${colors.reset} ${header}`);
            console.log(`  ${colors.yellow}Invalid value: ${result.value}${colors.reset}`);
            console.log(`  Expected: ${config.expected.join(' or ')}`);
            failed++;
        } else {
            console.log(`${colors.green}✓${colors.reset} ${header}`);
            console.log(`  ${colors.green}${result.value}${colors.reset}`);
            passed++;
        }
    }
    
    return { passed, failed };
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node test-security-headers.js <URL>');
        console.log('Example: node test-security-headers.js https://example.com');
        process.exit(1);
    }
    
    const testUrl = args[0];
    
    console.log(`${colors.blue}Testing Security Headers for: ${testUrl}${colors.reset}`);
    console.log('═'.repeat(60));
    
    try {
        const response = await testUrl(testUrl);
        
        console.log(`\n${colors.cyan}Response Status: ${response.statusCode}${colors.reset}`);
        
        // Check required headers
        const requiredResults = {};
        for (const [header, config] of Object.entries(requiredHeaders)) {
            requiredResults[header] = checkHeader(response.headers, header, config);
        }
        
        const required = printResults(requiredResults, 'Required Security Headers', requiredHeaders);
        
        // Check optional headers
        const optionalResults = {};
        for (const [header, config] of Object.entries(optionalHeaders)) {
            optionalResults[header] = checkHeader(response.headers, header, config);
        }
        
        const optional = printResults(optionalResults, 'Optional Security Headers', optionalHeaders);
        
        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log(`${colors.cyan}Summary${colors.reset}`);
        console.log(`Required: ${colors.green}${required.passed} passed${colors.reset}, ${colors.red}${required.failed} failed${colors.reset}`);
        console.log(`Optional: ${colors.green}${optional.passed} passed${colors.reset}, ${colors.yellow}${optional.failed} missing${colors.reset}`);
        
        // Security grade
        const totalRequired = Object.keys(requiredHeaders).length;
        const score = (required.passed / totalRequired) * 100;
        
        let grade;
        let gradeColor;
        if (score >= 90) {
            grade = 'A';
            gradeColor = colors.green;
        } else if (score >= 80) {
            grade = 'B';
            gradeColor = colors.green;
        } else if (score >= 70) {
            grade = 'C';
            gradeColor = colors.yellow;
        } else if (score >= 60) {
            grade = 'D';
            gradeColor = colors.yellow;
        } else {
            grade = 'F';
            gradeColor = colors.red;
        }
        
        console.log(`\n${colors.cyan}Security Grade: ${gradeColor}${grade}${colors.reset} (${score.toFixed(0)}%)`);
        
        // Recommendations
        if (required.failed > 0) {
            console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
            console.log('• Configure missing security headers in your web server');
            console.log('• Use the provided configuration files for your hosting platform');
            console.log('• Test again after deployment to verify headers are set');
        }
        
    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

main();
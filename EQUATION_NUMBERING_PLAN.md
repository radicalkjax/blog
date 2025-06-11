# Equation Numbering Correction Plan for 2025-06-11-multi-provider-ensemble-malware-detection.md

## Overview
This document provides a step-by-step plan to correct equation numbering issues in the blog post about multi-provider ensemble malware detection. The post currently has 62+ equations with numbering problems including duplicates, gaps, and out-of-order sequences.

## Current Issues
1. **Duplicate equation numbers**: (30), (51), and (52) each appear twice
2. **Out-of-order equations**: Some equations appear in wrong sequence
3. **Unnumbered equations**: Several equations are missing numbers
4. **Formatting inconsistencies**: Some equations use different formatting

## Step-by-Step Correction Plan

### Phase 1: Inventory All Equations
1. Search for all equations using pattern: `\$.*\$` 
2. Create a list with:
   - Line number
   - Current equation number (if any)
   - First few words of the equation
   - Section it belongs to

### Phase 2: Fix Duplicate Numbers
1. **Equation (30)**:
   - Keep first occurrence (line ~849) as (30)
   - Change second occurrence (line ~1031) to new number
   
2. **Equation (51)**:
   - Keep first occurrence (line ~1703) as (51)  
   - Change second occurrence to new number
   
3. **Equation (52)**:
   - Keep first occurrence (line ~1467) as (52)
   - Change second occurrence (line ~1707) to new number

### Phase 3: Renumber All Equations Sequentially
1. Start from the beginning of the document
2. Number equations consecutively starting from (1)
3. Ensure each equation ends with format: `\qquad (n)`
4. Pay special attention to multi-line equations in align blocks

### Phase 4: Add Numbers to Unnumbered Equations
Look for and number these specific equations:
1. Line ~1543: `$$\sigma_{\text{pooled}} = \sqrt{\frac{\sigma_1^2 + \sigma_2^2}{2}}$$`
2. Any other display equations (centered, on their own line) without numbers

### Phase 5: Special Cases to Handle
1. **Multi-line align blocks**: 
   - Lines 775-781 have equations (19), (20), (21) in an align block
   - Ensure proper formatting is maintained
   
2. **Inline equations**: 
   - Do NOT number inline equations (those within paragraph text)
   - Only number display equations

### Phase 6: Verification
1. Confirm no duplicate numbers exist
2. Verify sequential ordering (1, 2, 3, ..., n)
3. Check that all display equations have numbers
4. Ensure formatting is consistent: `$equation$ \qquad (number)`

## Technical Notes
- Use the Edit or MultiEdit tool to make changes
- Search patterns to find equations:
  - With numbers: `\$.*\$.*\\qquad.*([0-9]+)`
  - Without numbers: `^\$\$.*\$\$$` (for display equations)
- The standard format should be: `$equation$ \qquad (n)`

## Expected Outcome
- All equations numbered sequentially from (1) to approximately (65)
- No duplicate numbers
- All display equations have numbers
- Consistent formatting throughout

## Commands to Use
1. First, read the file to understand context
2. Use Grep to find all equations: `grep -n '\$.*\$' filename`
3. Use Edit/MultiEdit to update equation numbers
4. Verify with another grep after completion

## Important Reminders
- Only number display equations (standalone, centered)
- Do NOT number inline math expressions
- Maintain the `\qquad (n)` format
- Be careful with equations inside mermaid diagrams - leave those alone
- Currency values (like \$100) should remain escaped and are not equations
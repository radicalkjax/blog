# Detailed Equation Renumbering Plan

## Current State Summary
- Total equations: 66 (after adding number to pooled standard deviation)
- Duplicates found: (30), (51), (52)
- Out of order sections detected

## Comprehensive Renumbering Strategy

### Step 1: Create Master List
All equations need to be renumbered sequentially from (1) to (66) based on their order of appearance in the document.

### Step 2: Key Renumbering Changes
Based on document order:
1. Line 46: (1) → (1) [no change]
2. Line 52: (2) → (2) [no change]
3. Line 88: (3) → (3) [no change]
...continuing through...
19. Line 674: (19) → (19) [no change]
20. Line 771: (20) → (20) [no change]
21. Line 791: (23) → (21) [change]
22. Line 796: (21) → (22) [change]
23. Line 829: (22) → (23) [change]
24. Line 833: (24) → (24) [no change]
25. Line 837: (25) → (25) [no change]
26. Line 843: (29) → (26) [change]
27. Line 849: (30) → (27) [change - first duplicate]
28. Line 933: (26) → (28) [change]
29. Line 939: (27) → (29) [change]
30. Line 945: (28) → (30) [change]
31. Line 951: (29) → (31) [change]
32. Line 1031: (31) → (32) [no change after earlier fix]
33. Line 1040: (32) → (33) [change]
34. Line 1084: (32) → (34) [change - was duplicate]
35. Line 1088: (33) → (35) [change]
...continuing...
44. Line 1215: (60) → (44) [change - was out of order]
45. Line 1467: (52) → (45) [change - first occurrence]
46. Line 1539: (55) → (46) [change]
47. Line 1543: (56) → (47) [change - newly numbered]
48. Line 1703: (51) → (48) [change - first occurrence]
49. Line 1707: (52) → (49) [change - second duplicate]
50. Line 1711: (48) → (50) [change]
51. Line 1801: (49) → (51) [change]
52. Line 1813: (50) → (52) [change]
53. Line 1914: (53) → (53) [no change]
54. Line 1916: (54) → (54) [no change]
55. Line 2184: (58) → (55) [change]
56. Line 2196: (56) → (56) [no change]
57. Line 2202: (57) → (57) [no change]
58. Line 2303: (51) → (58) [change - second duplicate]
59. Line 2472: (59) → (59) [no change]
60. Line 2486: (61) → (60) [change]
61. Line 2494: (62) → (61) [change]
62. Line 2518: (43) → (62) [change]
63. Line 2532: (44) → (63) [change]
64. Line 2542: (45) → (64) [change]
65. Line 2690: (46) → (65) [change]
66. Line 2696: (47) → (66) [change]

### Step 3: Implementation Order
To avoid conflicts during editing:
1. Start from the END of the document and work backwards
2. This prevents changing an equation number that might conflict with another equation later in the document
3. Use MultiEdit for batch updates where possible

### Step 4: Verification
After renumbering:
1. Verify no duplicates: `grep -o '\\qquad ([0-9]\+)' file | sort | uniq -d` should return empty
2. Verify sequence: All numbers from (1) to (66) should be present
3. Verify order: Numbers should increase monotonically through the document
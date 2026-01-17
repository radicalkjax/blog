# Timeline Resources Feature

## Overview

The Timeline Resources feature allows you to attach files (PDFs, images, spreadsheets, calendar files, etc.) to any timeline marker. These resources are displayed in a tabbed interface alongside Related Blog Posts, with real content previews.

## Features

- **Multiple File Types Supported**: PDF, images, Excel files, CSV files, calendar files (.ics), and more
- **Real Content Previews**: Displays actual content from files, not just icons
- **Visual "R" Indicator**: Timeline markers with resources show an "R" badge
- **Tabbed Interface**: Resources appear in a tab next to "Related Blog Posts"
- **Responsive Design**: Works on desktop and mobile devices

## Adding Resources to a Timeline Marker

### 1. Create a `resources` Folder

Add resources directly to `assets/timeline-resources/{timeline-name}/resources/`:

```bash
assets/timeline-resources/
└── bottom-surgery/
    └── resources/           # Create this folder
        ├── appointment.ics
        ├── checklist.xlsx
        ├── expenses.csv
        └── consent-form.pdf
```

> **Note:** Resources go directly in the `assets/` directory, not in `_timeline/`. This ensures compatibility with GitHub Pages (which runs Jekyll in safe mode).

### 2. Add Files

Place any files you want to attach to that timeline section in the `resources` folder. Supported file types:

- **Documents**: `.pdf`, `.doc`, `.docx`, `.txt`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- **Spreadsheets**: `.xlsx`, `.xls`, `.csv`
- **Calendar**: `.ics`
- **Other**: Any file type will show with an appropriate icon

### 3. Commit and Build

Commit the resources to your repository:

```bash
git add assets/timeline-resources/
git commit -m "Add timeline resources"
bundle exec jekyll serve
```

Resources in `assets/timeline-resources/` are served directly as static files.

## How It Works

### Backend (Static Files)

Resources are stored directly in `assets/timeline-resources/` and served as static files:

1. Resources are committed directly to the repository
2. Jekyll serves them as static files (no plugin needed)
3. GitHub Pages compatible (works in safe mode)

### Frontend (JavaScript)

The `timeline.js` script:

1. Reads resource data from the page's JSON
2. Detects resources using the `hasResources` flag and `resources` array
3. Renders previews based on file type:
   - **PDFs**: Embedded iframe showing first page
   - **Images**: Thumbnail preview
   - **Calendar files**: Parses `.ics` and shows event details (date, title)
   - **CSV files**: Parses and displays first 4 rows as a table
   - **Excel files**: Uses SheetJS library to parse and preview data
   - **Other files**: Shows file type icon

### Template Logic

The `pages/personal-journey.html` template:

1. For each marker, checks if resources exist in `assets/timeline-resources/{timeline-name}/resources/`
2. Sets `hasResources: true` if resources are found
3. Includes resource metadata (name, path, extension, URL) in JSON output

## Resource Previews by File Type

### PDF Files (`.pdf`)
- **Preview**: Browser native iframe showing actual first page
- **Implementation**: `<iframe src="file.pdf#page=1&view=FitH&toolbar=0">`

### Images (`.jpg`, `.png`, `.gif`, etc.)
- **Preview**: Actual image thumbnail
- **Implementation**: `<img src="file.jpg">` with CSS styling

### Calendar Files (`.ics`)
- **Preview**: Visual calendar page showing:
  - Large day number (e.g., "01")
  - Month and year (e.g., "Mar 2025")
  - Event title (e.g., "Surgical Consultation")
- **Implementation**: Fetches and parses ICS file, extracts SUMMARY and DTSTART

### CSV Files (`.csv`)
- **Preview**: Spreadsheet-style table showing first 4 rows × 4 columns
- **Implementation**: Fetches and parses CSV, displays in styled table

### Excel Files (`.xlsx`, `.xls`)
- **Preview**: Spreadsheet-style table showing first 4 rows × 4 columns
- **Implementation**: Uses SheetJS library to parse binary Excel format
- **Library**: https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js

## File Structure

```
pages/
└── personal-journey.html    # Template (detects and includes resources in JSON)

assets/
├── js/
│   └── timeline.js         # JavaScript (fetches, parses, and previews files)
├── css/
│   └── timeline.css        # Styling for resources UI
└── timeline-resources/     # Add resource files here
    └── {timeline-name}/
        └── resources/
            ├── file1.pdf
            ├── file2.jpg
            └── file3.xlsx

_timeline/
└── {timeline-name}/        # Marker definitions only (no resources)
    ├── marker1.md
    └── marker2.md
```

## User Interface

### Marker Indicator

Timeline markers with resources show an "R" badge below the marker icon:

```
   [Icon]
      R
```

### Tabbed Interface

When a marker is clicked, resources appear in a tab:

```
┌─────────────────────────────────────────┐
│ [Related Blog Posts] [Resources]        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ PDF │ │ IMG │ │ CSV │               │
│  └─────┘ └─────┘ └─────┘               │
│                                         │
└─────────────────────────────────────────┘
```

## Technical Implementation Details

### Template Logic

```liquid
{% if marker.has_breakout and marker.breakout_timeline %}
  {% assign resource_path = "/assets/timeline-resources/" | append: marker.breakout_timeline | append: "/resources/" %}
{% else %}
  {% assign resource_path = "/assets/timeline-resources/" | append: marker.timeline | append: "/resources/" %}
{% endif %}
{% assign marker_resources = site.static_files | where_exp: "file", "file.path contains resource_path" %}
"hasResources": {% if marker_resources.size > 0 %}true{% else %}false{% endif %}
```

### JavaScript Preview Functions

```javascript
// Renders all resources
renderResources(resources)

// Parses and displays calendar files
async loadCalendarPreview(url, elementId)

// Parses and displays CSV files
async loadCSVPreview(url, elementId)

// Parses and displays Excel files (uses SheetJS)
async loadExcelPreview(url, elementId)
```

## Dependencies

- **SheetJS**: Required for Excel file parsing
  - CDN: `https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js`
  - Loaded in `pages/personal-journey.html`
  - Works with GitHub Pages (client-side library)

## GitHub Pages Compatibility

✅ **Fully compatible with GitHub Pages**

- No plugins required (resources are static files)
- Works with GitHub Pages safe mode
- SheetJS is a client-side JavaScript library (no server processing)
- All file parsing happens in the user's browser
- No backend dependencies required

## Limitations

1. **File size**: Large files may take longer to fetch and preview
2. **Browser compatibility**: Some preview features require modern browsers
3. **Excel parsing**: Requires SheetJS library; complex Excel features (formulas, macros) not supported

## Troubleshooting

### Resources not appearing

1. **Verify folder structure**: Resources must be in `assets/timeline-resources/{timeline-name}/resources/`
2. **Check file paths**: Ensure files are committed to the repository
3. **Check browser console**: Look for JavaScript errors
4. **Hard refresh**: Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

### Previews not loading

1. **Check file paths**: Ensure files were copied to `assets/timeline-resources/`
2. **Check SheetJS**: For Excel files, verify library loaded
3. **Check file format**: Ensure files are valid (not corrupted)
4. **Check console**: Look for fetch errors or parsing errors

### "R" indicator not showing

1. **Check `hasResources` in JSON**: Should be `true` for markers with resources
2. **Check resource path logic**: For breakout timelines, uses `breakout_timeline` value
3. **Hard refresh browser**: Clear cached JavaScript/CSS

## Example Use Case

For a "Bottom Surgery Journey" timeline marker:

1. Create folder: `assets/timeline-resources/bottom-surgery/resources/`
2. Add files:
   - `appointment-schedule.ics` - Calendar with surgery dates
   - `medical-expenses.csv` - Cost tracking spreadsheet
   - `surgery-checklist.xlsx` - Pre-op preparation checklist
   - `consent-form.pdf` - Signed consent document
   - `pre-op-photo.jpg` - Medical photos
3. Commit the files: `git add assets/timeline-resources/ && git commit -m "Add resources"`
4. Navigate to Personal Journey page → Click "Bottom Surgery Journey"
5. See "R" indicator on marker
6. Click marker → See "Resources" tab
7. View previews:
   - Calendar shows: "Mar 01" with "Surgical Consultation"
   - CSV shows: Table with dates, descriptions, amounts
   - Excel shows: Checklist items with status
   - PDF shows: First page of consent form
   - Image shows: Photo thumbnail

## Future Enhancements

Potential improvements:

- [ ] Drag-and-drop file upload interface
- [ ] File categorization/tagging
- [ ] Advanced PDF viewer with page navigation
- [ ] Video file support with video player
- [ ] Audio file support with audio player
- [ ] Markdown file rendering
- [ ] File search/filter functionality
- [ ] Download all resources as ZIP
- [ ] Resource comments/annotations

## Related Documentation

- [Timeline Implementation Strategy](./IMPLEMENTATION_STRATEGY.md)
- [Timeline Plan](./TIMELINE_PLAN.md)
- [Timeline Tagging](./TIMELINE_TAGGING.md)

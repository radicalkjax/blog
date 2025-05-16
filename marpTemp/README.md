# Vibe Coding: It's A Legitimate Strategy

This is a presentation created using [Marp](https://marp.app/), a Markdown Presentation Ecosystem.

## Presentation Overview

This presentation covers how to effectively use AI tools like Claude Code to develop clean, effective, up-to-date, and secure code. It includes:

- The 12-step AI-Assisted Development Pipeline
- Different role perspectives (Developer, Security Analyst, Tester, Designer)
- Documentation responsibilities
- Impacts to users
- Addressing common concerns about AI-generated code

## Recent Updates

The presentation has been enhanced with the following improvements:

- **Improved "Impacts to the User" slide**:
  - Larger, more visually prominent blocks with min-height of 180px
  - Enhanced spacing between blocks (20px grid gap)
  - Centered titles with background shading that wraps to content
  - Improved readability with adjusted font sizes and line heights
  - Stronger visual hierarchy with enhanced box shadows

- **Visual consistency**:
  - Maintained consistent styling between "Different Perspectives" and "Impacts to the User" slides
  - Ensured proper alignment and spacing throughout the presentation
  - Optimized for better readability on projectors and screens

## Slide Examples

Here are some examples of how to create different types of slides in Marp based on this presentation:

### Title Slide

```markdown
<!-- _class: title _paginate: false _footer: "" -->

# <!-- fit --> <div style="text-align: center;"><img src="svgfiles/sitelogo.png" alt="Site Logo" style="height: 360px; display: inline-block; vertical-align: middle; margin: 0 auto 0 auto;"></div><div style="text-align: center;">Vibe Coding: It's A Legitimate Strategy</div>

## Using AI for Clean, Effective, Up-to-Date, and Secure Code

### A presentation by Kali Jackson
### (@radicalkjax)
```

### Content Slide with Columns

```markdown
# 1. Initial Build

<div class="pipeline-step box-shadow" style="text-align: center;">
Using AI to generate the initial code structure and implementation.
</div>

<div class="columns">
<div class="column compact-list">

## Key Considerations:
- Be specific about requirements
- Provide context about your project
- Specify coding standards and patterns
- Give strong educational and experience background
- Develop strong need to document well
- Give agent artistic style

</div>
<div class="column small-code">

## Effective Prompts:

<div style="font-size: .5em; line-height: 1.6; background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 5px; margin: 10px 0; font-family: 'DM Mono', monospace; white-space: pre-wrap;">
Hi [agent], my name is [your name]. [Build agent worker profile] [build agent educational background: degrees and certs] [minor technical skills][build agent experience: github] 

[build agent need to document well and visually]
[Initial task][give agent resources for task]
[build agent visual style: give examples such as images, websites or repos]
[build agent art style: give it context such as 'whimsical']

Stop and let me know once you've completed your thorough research and are ready to begin the project.
</div>

</div>
</div>
```

### Diagram Slide

```markdown
<!-- _class: diagram-slide with-logo -->

# <!-- fit --> <span style="margin-left: 120px;">The AI-Assisted Development Pipeline</span>

<div class="diagram-container" style="margin-top: 20px; height: 80vh; text-align: center;">

<img src="svgfiles/The%20AI-Assisted%20Development%20Pipeline.svg" alt="AI-Assisted Development Pipeline" style="width: 70%; margin: 0 auto;">

</div>
```

### Grid Layout Slide

```markdown
# Different Perspectives

<style scoped>
.perspective-block {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.perspective-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;
  margin-top: 12px;
}

.perspective-title {
  background-color: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 15px;
  display: inline-block;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.95em;
}
</style>

<div class="perspective-grid">
  <div class="perspective-block">
    <div class="perspective-title">Developer</div>
    <ul class="perspective-list">
      <li><b>Focus:</b> Initial Build, AI Surprises, Docs Creation</li>
      <li><b>Primary concern:</b> Functionality and code quality</li>
    </ul>
  </div>
  
  <div class="perspective-block">
    <div class="perspective-title">Security Analyst</div>
    <ul class="perspective-list">
      <li><b>Focus:</b> Security Review, Defects</li>
      <li><b>Primary concern:</b> Identifying vulnerabilities</li>
    </ul>
  </div>
</div>
```

### Simple Content Slide with Lists

```markdown
# Best Practices for AI-Assisted Coding

<div class="columns">
<div class="column">

## Understand Implementation
- Don't blindly copy AI suggestions
- Ask AI to explain complex code
- Review code for security implications

</div>
<div class="column">

## Verify and Test
- Test all AI-generated code
- Verify edge cases
- Implement automated testing

</div>
</div>
```

### Quote Slide

```markdown
# Addressing Common Concerns

## "But Kali, it's just copying someone else's code! How can I trust it?"

> I know most of you are going to Stack Overflow and GitHub to c&p code. Do you trust that code inherently? We've been teaching that's a no-no for a while. You still have a responsibility to maintain your code. AI as a tool doesn't alleviate you from that responsibility.
```

## How to View/Present

### Using VS Code with Marp Extension

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension
3. Open `presentation.md` in VS Code
4. Click the "Open Preview" button in the top-right corner to view the presentation
5. To export to PDF, HTML, or PPTX, use the "Export slide deck..." command from the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)

### Using Marp CLI

If you prefer using the command line:

1. Install [Node.js](https://nodejs.org/)
2. Install Marp CLI globally: `npm install -g @marp-team/marp-cli`
3. Generate HTML: `marp presentation.md`
4. Generate PDF: `marp presentation.md --pdf`
5. Generate PPTX: `marp presentation.md --pptx`

### Using This Project's Setup (Recommended)

This project includes a local setup with npm scripts for a consistent experience:

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Navigate to the `Marp_Presentation` directory in your terminal
3. Install dependencies: `npm install`
4. Launch the presentation in preview mode:
   ```
   npx @marp-team/marp-cli presentation.md -o presentation.html --preview
   ```
   This will generate the HTML and open it in your default browser with live updates as you edit
5. Build the presentation without preview:
   ```
   npx @marp-team/marp-cli presentation.md -o presentation.html
   ```
6. Generate PDF version:
   ```
   npx @marp-team/marp-cli presentation.md -o presentation.pdf --pdf
   ```
7. Generate PowerPoint version:
   ```
   npx @marp-team/marp-cli presentation.md -o presentation.pptx --pptx
   ```

The preview mode is particularly useful during development as it automatically refreshes when you make changes to the presentation.md file.

## Customization

The presentation uses a custom theme based on the color palette from radicalkjax's blog:
- Main background: #6d105a (deep purple/magenta)
- Text color: #ffffff (white)
- Background elements: rgba(255, 255, 255, 0.1) (slightly lighter elements)

You can modify the CSS in the style section at the top of the `presentation.md` file to customize the appearance further.

## Credits

Created with [Marp](https://marp.app/) - Markdown Presentation Ecosystem.

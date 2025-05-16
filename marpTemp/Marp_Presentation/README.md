# Marp Presentation: Vibe Coding

This is a presentation created using [Marp](https://marp.app/), a Markdown Presentation Ecosystem.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (required to run the presentation)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the presentation in preview mode:
   ```
   npm run start
   ```
   This will launch a browser window with the presentation and automatically update it when you make changes to the presentation.md file.

3. Build the presentation without preview:
   ```
   npm run build
   ```
   This will generate the HTML file without opening a browser window.

## Slide Examples

Here are examples of how to create different types of slides in this Marp presentation:

### Basic Slide Structure

Every Marp presentation starts with a YAML front matter section that defines global settings:

```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: "#6d105a"
color: "#ffffff"
class: with-logo
footer: "Made with ❤️ by Kali"
---
```

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

</div>
<div class="column small-code">

## Effective Prompts:

<div style="font-size: .5em; line-height: 1.6; background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 5px; margin: 10px 0; font-family: 'DM Mono', monospace; white-space: pre-wrap;">
Hi [agent], my name is [your name]. [Build agent worker profile]
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

### Styling Slides with Scoped CSS

You can add custom styling to individual slides using the `<style scoped>` tag:

```markdown
# Impacts to the User

<style scoped>
.impact-block {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  margin: 40px auto 0;
  max-width: 90%;
  justify-content: center;
}

.impact-title {
  background-color: rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 15px;
  display: inline-block;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.95em;
}
</style>

<div class="impact-grid">
  <div class="impact-block">
    <div class="impact-title">Accessibility</div>
    <ul class="impact-list">
      <li>AI can help ensure accessibility standards are met</li>
      <li>Generates accessible code patterns</li>
    </ul>
  </div>
  
  <div class="impact-block">
    <div class="impact-title">Thinking Bigger</div>
    <ul class="impact-list">
      <li>Enables tackling more ambitious projects</li>
      <li>Helps understand complex patterns</li>
    </ul>
  </div>
</div>
```

## Troubleshooting

If you encounter issues with the presentation:

1. Make sure all dependencies are installed by running `npm install`
2. If you see an error about the engine not resolving, check that the mermaid module is properly installed
3. For any other issues, try running with the debug flag: `npx @marp-team/marp-cli presentation.md -p --config marp.config.js --html --engine ./engine.js --debug=true`

## Additional Resources

- [Marp Documentation](https://marpit.marp.app/)
- [Marp CLI GitHub Repository](https://github.com/marp-team/marp-cli)
- [Markdown Guide](https://www.markdownguide.org/)

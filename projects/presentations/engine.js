// engine.js
const mermaid = require('mermaid')

module.exports = ({ marp }) => {
  marp.markdown.core.ruler.push('mermaid', state => {
    const tokens = state.tokens
    let i = 0

    while (i < tokens.length) {
      if (tokens[i].type === 'fence' && tokens[i].info === 'mermaid') {
        const token = tokens[i]
        const code = token.content.trim()
        
        // Replace the fence token with an html_block token
        token.type = 'html_block'
        token.content = `<div class="mermaid">${code}</div>`
      }
      i++
    }
  })

  return marp
}

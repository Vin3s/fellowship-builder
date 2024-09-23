import React, { useState } from 'react';
// import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { Sandpack } from '@codesandbox/sandpack-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractCode = (content) => {
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
    const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/);

    return {
      html: htmlMatch ? htmlMatch[1] : '',
      css: cssMatch ? cssMatch[1] : '',
      js: jsMatch ? jsMatch[1] : '',
    };
  };

  const handleBuild = async () => {
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }
    setLoading(true);
    const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    const client = new Anthropic({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `Create a simple ${prompt} app using HTML, CSS, and JavaScript. Provide the code in separate code blocks for HTML, CSS, and JavaScript.`,
          },
        ],
      });
      
      const content = response.content[0].text;
      const { html, css, js } = extractCode(content);


      setFiles({
        "/index.html": `
<!DOCTYPE html>
<html>
  <head>
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>${js}</script>
  </body>
</html>
        `,
        "/index.js": js,
        "/styles.css": css,
      });

    } catch (error) {
      console.error(error);
      alert('An error occurred while generating the app.');
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>Fellowship Builder</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Create a simple {promt} app in HTML, CSS, & JS"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={handleBuild} disabled={loading}>
          {loading ? 'Building...' : 'Build'}
        </button>
      </div>
      {files && (
        <div className="sandpack-container">
          <Sandpack
            template="vanilla"
            files={files}
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              editorHeight: 400,
            }}
            theme="light"
          />
          <p className="built-by">Built by Rohan with Claude 3.5 Sonnet for the Faculty Fellowship Interview</p>
        </div>
      )}
    </div>
  );
}

export default App;
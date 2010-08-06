This is a simple web app for publishing static websites with RingoJS.
Most files are served as-is except for Markdown files (.md) which are converted
to HTML on the fly.

Set the public document root in config.js and start the application with:

  ringo main.js

Then point your browser to this URL:

  http://localhost:8080/

You can change the appearance of Markdown pages and directory listings by
editing the HTML skin files. If this app is mounted in another Ringo app
it will use the base skin of the embedding app.


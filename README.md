# React Tasks with JSON-file backend

This minimal sample demonstrates a React frontend (UMD via CDN) that performs full CRUD against an Express backend which persists tasks to `tasks.json`.

How to run (PowerShell):

```powershell
# from project root
npm install
npm start

# open http://localhost:3000 in your browser
```

What it includes
- Backend: `server.js` (Express) with endpoints:
  - GET /api/tasks
  - POST /api/tasks
  - PUT /api/tasks/:id
  - DELETE /api/tasks/:id
- Data file: `tasks.json` stores the array of tasks.
- Frontend: `public/index.html` and `public/app.js` (React via CDN). The UI uses `useState` and a controlled input to add tasks, toggles completion, supports edit and delete, and conditionally renders a message when there are no tasks.

Notes
- This demo uses Babel in the browser for quick development; for production you'd normally bundle the frontend.
- The server rewrites `tasks.json` on each change — don't use this approach for multi-user production use without proper locking.

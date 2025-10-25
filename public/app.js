const { useState, useEffect } = React;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error('Failed to fetch tasks', err));
  }, []);

  // Controlled form add
  function handleAdd(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed })
    })
      .then(r => r.json())
      .then(newTask => {
        setTasks(prev => [...prev, newTask]);
        setTitle('');
      })
      .catch(err => console.error('Add failed', err));
  }

  function toggleComplete(task) {
    fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    })
      .then(r => r.json())
      .then(updated => {
        setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      })
      .catch(err => console.error('Toggle failed', err));
  }

  function removeTask(id) {
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .then(r => {
        if (r.status === 204) setTasks(prev => prev.filter(t => t.id !== id));
        else return r.json().then(j => Promise.reject(j));
      })
      .catch(err => console.error('Delete failed', err));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function saveEdit(e) {
    e.preventDefault();
    const trimmed = editingTitle.trim();
    if (!trimmed) return;
    fetch(`/api/tasks/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed })
    })
      .then(r => r.json())
      .then(updated => {
        setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        setEditingId(null);
        setEditingTitle('');
      })
      .catch(err => console.error('Edit failed', err));
  }

  return (
    <div>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="New task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <div>
          {tasks.map(task => (
            <div className="task" key={task.id}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={!!task.completed}
                  onChange={() => toggleComplete(task)}
                />
                <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {editingId === task.id ? (
                    <form onSubmit={saveEdit} style={{ display: 'inline' }}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                      />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <span>{task.title}</span>
                  )}
                </div>
              </div>
              <div>
                {editingId !== task.id && (
                  <>
                    <button onClick={() => startEdit(task)}>Edit</button>
                    <button onClick={() => removeTask(task.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

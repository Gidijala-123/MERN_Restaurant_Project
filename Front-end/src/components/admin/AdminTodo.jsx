import React, { useState, useEffect, useRef } from "react";
import "./AdminTodo.css";

const STORAGE_KEY = "adminTodoList";

const PRIORITIES = [
  { value: "high", label: "High", color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "low", label: "Low", color: "#10b981" },
];

function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function AdminTodo() {
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState(loadTodos);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all"); // all | active | done
  const inputRef = useRef(null);

  useEffect(() => { saveTodos(todos); }, [todos]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: Date.now(), text, priority, done: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setInput("");
  };

  const toggle = (id) => setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));
  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const filtered = todos.filter((t) =>
    filter === "active" ? !t.done : filter === "done" ? t.done : true
  );

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <>
      {/* Floating trigger button */}
      <button className="todo-fab" onClick={() => setOpen((o) => !o)} title="Admin Todo List">
        <span className="todo-fab-icon">📋</span>
        {activeCount > 0 && <span className="todo-fab-badge">{activeCount}</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className="todo-panel">
          <div className="todo-panel-header">
            <div className="todo-panel-title">
              <span>📋</span>
              <span>Admin Todo</span>
            </div>
            <div className="todo-panel-meta">
              <span className="todo-meta-chip active">{activeCount} pending</span>
              {doneCount > 0 && (
                <button className="todo-clear-btn" onClick={clearDone} title="Clear completed">
                  Clear done
                </button>
              )}
              <button className="todo-close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          {/* Input */}
          <div className="todo-input-row">
            <input
              ref={inputRef}
              className="todo-input"
              placeholder="Add a task…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <select
              className="todo-priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <button className="todo-add-btn" onClick={addTodo}>Add</button>
          </div>

          {/* Filter tabs */}
          <div className="todo-filters">
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                className={`todo-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="todo-list">
            {filtered.length === 0 ? (
              <div className="todo-empty">
                {filter === "done" ? "No completed tasks yet." : "No tasks here. Add one above!"}
              </div>
            ) : (
              filtered.map((todo) => {
                const p = PRIORITIES.find((x) => x.value === todo.priority);
                return (
                  <div key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
                    <button
                      className={`todo-check ${todo.done ? "checked" : ""}`}
                      onClick={() => toggle(todo.id)}
                      title={todo.done ? "Mark pending" : "Mark done"}
                    >
                      {todo.done ? "✓" : ""}
                    </button>
                    <div className="todo-item-body">
                      <span className="todo-item-text">{todo.text}</span>
                      <span
                        className="todo-priority-dot"
                        style={{ background: p?.color }}
                        title={p?.label}
                      />
                    </div>
                    <button className="todo-remove-btn" onClick={() => remove(todo.id)} title="Remove">✕</button>
                  </div>
                );
              })
            )}
          </div>

          {todos.length > 0 && (
            <div className="todo-panel-footer">
              {doneCount}/{todos.length} completed
            </div>
          )}
        </div>
      )}
    </>
  );
}

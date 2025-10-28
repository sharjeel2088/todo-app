import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState(() => {
    // load from localStorage and ensure every task has a unique id
    const raw = JSON.parse(localStorage.getItem("tasks")) || [];
    return raw.map((t) => {
      if (!t.id) {
        return { ...t, id: generateIdStatic() };
      }
      return t;
    });
  });
  const [selectedTasks, setSelectedTasks] = useState([]);

  const categories = ["New", "In Progress", "Finished", "Cancelled"];

  // keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Static id generator function
  const generateIdStatic = () =>
    "_" + Math.random().toString(36).substr(2, 9);

  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = {
      id: generateIdStatic(),
      text: task.trim(),
      status: "New",
    };
    setTasks((prev) => [...prev, newTask]);
    setTask("");
  };

  const moveTask = (id, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const toggleSelect = (id) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Optional: single-task delete (by id)
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTasks((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="app-container">
      <h1 className="title">🚀 Task Board</h1>

        <div className="input-section">
          <input
            type="text"
            placeholder="Add a new task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button onClick={addTask}>Add</button>
        </div>
      

      <div className="board">
        {categories.map((category) => (
          <div key={category} className="column">
            <h2>{category}</h2>
            <ul>
              <AnimatePresence>
                {tasks
                  .filter((t) => t.status === category)
                  .map((taskObj) => (
                    <motion.li
                      key={taskObj.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className={`task-item ${selectedTasks.includes(taskObj.id) ? "selected" : ""}`}
                      // clicking the whole li toggles selection
                      onClick={() => toggleSelect(taskObj.id)}
                    >
                      <div className="task-content">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(taskObj.id)}
                          // stop propagation so checkbox doesn't trigger li onClick twice
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelect(taskObj.id);
                          }}
                        />
                        <span>{taskObj.text}</span>
                      </div>

                      <div className="task-actions">
                        {category !== "New" && (
                          <button onClick={(e) => { e.stopPropagation(); moveTask(taskObj.id, "New"); }} title="Move to New">
                            ↩️
                          </button>
                        )}
                        {category === "New" && (
                          <button onClick={(e) => { e.stopPropagation(); moveTask(taskObj.id, "In Progress"); }} title="Move to In Progress">
                            ▶️
                          </button>
                        )}
                        {category === "In Progress" && (
                          <button onClick={(e) => { e.stopPropagation(); moveTask(taskObj.id, "Finished"); }} title="Mark Finished">
                            ✅
                          </button>
                        )}
                        {category !== "Cancelled" && (
                          <button onClick={(e) => { e.stopPropagation(); moveTask(taskObj.id, "Cancelled"); }} title="Cancel Task">
                            ❌
                          </button>
                        )}
                        {/* single delete button */}
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(taskObj.id); }} title="Delete Task">
                          🗑️
                        </button>
                      </div>
                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

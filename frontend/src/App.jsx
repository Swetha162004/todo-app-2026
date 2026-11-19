
import { useState, useEffect } from "react";
import API from "../services/api";

function App() {
  // Input State
  const [task, setTask] = useState("");

  // Edit States
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Filter State
  const [filter, setFilter] = useState("All");

  // Tasks State
  const [tasks, setTasks] = useState([]);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");

  // Get Tasks from Backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await API.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Unable to load tasks. Please check your backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add Task Function
  const handleAddTask = async () => {
    if (task.trim() === "") return;

    try {
      setAddLoading(true);

      const response = await API.post("/tasks", {
        title: task.trim(),
      });

      setTasks([...tasks, response.data.task]);
      setTask("");
      setError("");
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Unable to add task.");
    } finally {
      setAddLoading(false);
    }
  };

  // Toggle Task Function
  const handleToggleTask = async (id, completed) => {
    try {
      const response = await API.put(`/tasks/${id}`, {
        completed: !completed,
      });

      setTasks(
        tasks.map((item) =>
          item._id === id ? response.data.task : item
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Unable to update task.");
    }
  };

  // Delete Task Function
  const handleDeleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await API.delete(`/tasks/${id}`);

      setTasks(tasks.filter((item) => item._id !== id));

      if (editId === id) {
        setEditId(null);
        setEditText("");
      }

      setError("");
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Unable to delete task.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Edit Task Function
  const handleEditTask = (item) => {
    setEditId(item._id);
    setEditText(item.title);
  };

  // Update Task Function
  const handleUpdateTask = async () => {
    if (editText.trim() === "") return;

    try {
      const response = await API.put(`/tasks/${editId}`, {
        title: editText.trim(),
      });

      setTasks(
        tasks.map((item) =>
          item._id === editId ? response.data.task : item
        )
      );

      setEditId(null);
      setEditText("");
      setError("");
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Unable to update task.");
    }
  };

  // Cancel Edit Function
  const handleCancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  // Summary Counts
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  // Filter Tasks
  const filteredTasks = tasks.filter((item) => {
    if (filter === "Completed") return item.completed;
    if (filter === "Pending") return !item.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-600">
            Todo App
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-800">
          My Tasks
        </h2>

        <p className="text-gray-500 mt-2">
          Stay organized and get things done.
        </p>

        {/* Task Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Tasks</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">
              {totalTasks}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Completed</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {completedTasks}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Pending</p>
            <h3 className="text-3xl font-bold text-orange-500 mt-2">
              {pendingTasks}
            </h3>
          </div>

        </div>

        {/* Add Todo Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
          className="bg-white p-6 rounded-xl shadow-sm mt-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Add New Task
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              placeholder="Enter your task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={addLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {addLoading ? "Adding..." : "Add Task"}
            </button>

          </div>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        {/* Todo List */}
        <div className="bg-white p-6 rounded-xl shadow-sm mt-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

            <h3 className="text-xl font-bold text-gray-800">
              Your Tasks
            </h3>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {["All", "Completed", "Pending"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

          </div>

          {/* Loading Spinner */}
          {loading ? (

            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-gray-500">
                Loading tasks...
              </p>
            </div>

          ) : filteredTasks.length === 0 ? (

            <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-medium">
                {tasks.length === 0
                  ? "No tasks yet!"
                  : `No ${filter.toLowerCase()} tasks found!`}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {tasks.length === 0
                  ? "Add a new task to get started."
                  : "Try another filter."}
              </p>
            </div>

          ) : (

            filteredTasks.map((item) => (

              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 py-4"
              >

                {editId === item._id ? (

                  /* Edit Mode */
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">

                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateTask();
                        }

                        if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUpdateTask}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>

                ) : (

                  <>
                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          handleToggleTask(item._id, item.completed)
                        }
                        className="w-4 h-4 cursor-pointer"
                      />

                      <span
                        className={
                          item.completed
                            ? "text-gray-500 line-through"
                            : "text-gray-800"
                        }
                      >
                        {item.title}
                      </span>

                    </div>

                    <div className="flex items-center gap-3">

                      <span
                        className={
                          item.completed
                            ? "text-sm text-green-600 font-medium"
                            : "text-sm text-orange-500 font-medium"
                        }
                      >
                        {item.completed ? "Completed" : "Pending"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEditTask(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(item._id)}
                        disabled={deleteLoading === item._id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </>

                )}

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default App;





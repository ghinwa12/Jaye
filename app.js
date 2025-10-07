// This file contains the JavaScript logic for the application. It manages the functionality for adding and deleting to-do items, managing projects, saving data to local storage, and updating the UI based on user interactions.

let projects = JSON.parse(localStorage.getItem('projects')) || [];
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let notes = localStorage.getItem('quickNotes') || '';

const projectsList = document.getElementById('projects-list');
const todoList = document.getElementById('todo-list');
const todoInput = document.getElementById('todo-input');
const projectsCount = document.getElementById('projects-count');
const tasksCount = document.getElementById('tasks-count');
const completedCount = document.getElementById('completed-count');
const progressCount = document.getElementById('progress-count');
const quickNotes = document.getElementById('quick-notes');

quickNotes.value = notes;

function updateSummary() {
    projectsCount.textContent = projects.length;

    let totalTasks = 0;
    let completedTasks = 0;

    projects.forEach(project => {
        if (project.tasks) {
            totalTasks += project.tasks.length;
            completedTasks += project.tasks.filter(task => task.completed).length;
        }
    });

    totalTasks += todos.length;
    completedTasks += todos.filter(todo => todo.completed).length;

    tasksCount.textContent = totalTasks - completedTasks;
    completedCount.textContent = completedTasks;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    progressCount.textContent = `${progress}%`;
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No tasks yet</p></div>';
        return;
    }

    todos.forEach((todo, index) => {
        const todoEl = document.createElement('li');
        todoEl.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoEl.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
            <span class="todo-text">${todo.text}</span>
            <span class="todo-delete" onclick="deleteTodo(${index})"><i class="fas fa-trash"></i></span>
        `;
        todoList.appendChild(todoEl);
    });

    updateSummary();
}

function addTodo() {
    const text = todoInput.value.trim();

    if (!text) return;

    todos.push({
        text,
        completed: false,
        date: new Date().toISOString()
    });

    saveTodos();
    renderTodos();
    todoInput.value = '';
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function saveNotes() {
    notes = quickNotes.value;
    localStorage.setItem('quickNotes', notes);
    alert('Notes saved successfully!');
}

function renderProjects() {
    projectsList.innerHTML = '';

    if (projects.length === 0) {
        projectsList.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Add your first project!</p></div>';
        updateSummary();
        return;
    }

    projects.forEach((project, index) => {
        const projectEl = document.createElement('div');
        projectEl.className = 'project-item';

        let statusClass = '';
        let statusText = '';
        switch(project.status) {
            case 'planning':
                statusClass = 'status-planning';
                statusText = 'Planning';
                break;
            case 'progress':
                statusClass = 'status-progress';
                statusText = 'In Progress';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Completed';
                break;
        }

        projectEl.innerHTML = `
            <div class="project-header">
                <div>
                    <div class="project-title">${project.title}</div>
                    <div class="project-date">Created: ${new Date(project.date).toLocaleDateString()}</div>
                </div>
                <div class="project-actions">
                    <button onclick="toggleEditMode(${index})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteProject(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="project-description">${project.description}</div>
            <span class="project-status ${statusClass}">${statusText}</span>
            
            <div class="tasks-section">
                <h3><i class="fas fa-check-circle"></i> Tasks</h3>
                <div class="task-list" id="tasks-${index}">
                    ${renderTasks(project.tasks || [])}
                </div>
                <div class="task-form">
                    <input type="text" id="task-input-${index}" placeholder="New task">
                    <button onclick="addTask(${index})"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            
            <div class="comments-section">
                <h3><i class="fas fa-comments"></i> Comments</h3>
                <div class="comment-list" id="comments-${index}">
                    ${renderComments(project.comments || [])}
                </div>
                <div class="comment-form">
                    <input type="text" id="comment-input-${index}" placeholder="Add a comment">
                    <button onclick="addComment(${index})"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;

        projectsList.appendChild(projectEl);
    });

    updateSummary();
}

function renderTasks(tasks) {
    if (tasks.length === 0) return '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>No tasks yet</p></div>';

    return tasks.map((task, i) => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${i}, this.parentNode.parentNode.parentNode)">
            <span class="task-priority priority-${task.priority || 'medium'}"></span>
            <span class="task-text">${task.text}</span>
        </div>
    `).join('');
}

function renderComments(comments) {
    if (comments.length === 0) return '<div class="empty-state"><i class="fas fa-comment"></i><p>No comments yet</p></div>';

    return comments.map(comment => `
        <div class="comment-item">
            <div>${comment.text}</div>
            <div class="comment-date">${new Date(comment.date).toLocaleString()}</div>
        </div>
    `).join('');
}

function addProject() {
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const status = document.getElementById('project-status').value;

    if (!title) {
        alert('Please enter a project title');
        return;
    }

    projects.push({
        title,
        description,
        status,
        date: new Date().toISOString(),
        tasks: [],
        comments: []
    });

    saveProjects();
    renderProjects();

    document.getElementById('project-title').value = '';
    document.getElementById('project-description').value = '';
}

function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects.splice(index, 1);
        saveProjects();
        renderProjects();
    }
}

function toggleEditMode(index) {
    const newTitle = prompt('Edit project title:', projects[index].title);
    if (newTitle === null) return;

    const newDesc = prompt('Edit project description:', projects[index].description);
    if (newDesc === null) return;

    projects[index].title = newTitle;
    projects[index].description = newDesc;

    saveProjects();
    renderProjects();
}

function addTask(projectIndex) {
    const taskInput = document.getElementById(`task-input-${projectIndex}`);
    const text = taskInput.value;

    if (!text) return;

    if (!projects[projectIndex].tasks) {
        projects[projectIndex].tasks = [];
    }

    projects[projectIndex].tasks.push({
        text,
        completed: false,
        priority: 'medium'
    });

    saveProjects();
    renderProjects();
    taskInput.value = '';
}

function toggleTask(taskIndex, projectElement) {
    const projectItems = document.querySelectorAll('.project-item');
    let projectIndex = -1;

    for (let i = 0; i < projectItems.length; i++) {
        if (projectItems[i] === projectElement) {
            projectIndex = i;
            break;
        }
    }

    if (projectIndex !== -1) {
        projects[projectIndex].tasks[taskIndex].completed = 
            !projects[projectIndex].tasks[taskIndex].completed;
        saveProjects();
        renderProjects();
    }
}

function addComment(projectIndex) {
    const commentInput = document.getElementById(`comment-input-${projectIndex}`);
    const text = commentInput.value;

    if (!text) return;

    if (!projects[projectIndex].comments) {
        projects[projectIndex].comments = [];
    }

    projects[projectIndex].comments.push({
        text,
        date: new Date().toISOString()
    });

    saveProjects();
    renderProjects();
    commentInput.value = '';
}

function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

renderTodos();
renderProjects();

todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

let notesTimeout;
quickNotes.addEventListener('input', function() {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveNotes, 2000);
});

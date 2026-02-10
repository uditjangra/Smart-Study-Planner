// Main variables
let subjects = [];
let tasks = [];
let schedule = []; // New schedule array
let isDarkTheme = false;

// Chart Instances
let completionChartInstance = null;
let subjectChartInstance = null;
let weeklyChartInstance = null;

// DOM 
//Saare constant values yaha store honge
const subjectListEl = document.getElementById('subjects-list');
const subjectInputEl = document.getElementById('new-subject-input');
const taskListEl = document.getElementById('all-tasks-list');
const todayTasksListEl = document.getElementById('today-tasks-list');
const taskTitleInput = document.getElementById('task-title');
const taskSubjectSelect = document.getElementById('task-subject');
const taskDateInput = document.getElementById('task-date');

//Storage ki values yaha store hongi
const scheduleDaySelect = document.getElementById('schedule-day');
const scheduleTimeInput = document.getElementById('schedule-time');
const scheduleSubjectInput = document.getElementById('schedule-subject');
const scheduleListContainer = document.getElementById('schedule-list-container');
const todayScheduleListEl = document.getElementById('today-schedule-list');

// Initialization 
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    applyTheme(); // Apply saved theme
    renderSubjects();
    renderTasks();
    renderSchedule();
});

//data ko persist krne ke liye

function loadData() {
    const storedSubjects = localStorage.getItem('studyPlannerNames');
    const storedTasks = localStorage.getItem('studyPlannerTasks');
    const storedSchedule = localStorage.getItem('studyPlannerSchedule');
    const storedTheme = localStorage.getItem('studyPlannerTheme');

    if (storedSubjects) {
        subjects = JSON.parse(storedSubjects);
    } else {
        subjects = ['Math', 'Science', 'History'];
        saveData();
    }

    if (storedTasks) tasks = JSON.parse(storedTasks);
    if (storedSchedule) schedule = JSON.parse(storedSchedule);
    if (storedTheme) isDarkTheme = JSON.parse(storedTheme);
}

function saveData() {
    localStorage.setItem('studyPlannerNames', JSON.stringify(subjects));
    localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks));
    localStorage.setItem('studyPlannerSchedule', JSON.stringify(schedule));
    localStorage.setItem('studyPlannerTheme', JSON.stringify(isDarkTheme));
}
//agar reset dabayenge to reload kardenge

function exportData() {
    const data = {
        subjects: subjects,
        tasks: tasks,
        schedule: schedule,
        isDarkTheme: isDarkTheme
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "study_planner_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function resetData() {
    if (confirm("Are you sure you want to delete all data?")) {
        localStorage.clear();
        subjects = ['Math', 'Science', 'History'];
        tasks = [];
        schedule = [];
        isDarkTheme = false;
        saveData();
        location.reload();
    }
}

//theme change ka button

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    saveData();
    applyTheme();
}

function applyTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

//main navigation and sections 

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.style.display = 'none';
        if (section.id === sectionId) {
            section.style.display = 'block';
        }
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById('nav-' + sectionId);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    if (sectionId === 'analytics') {
        updateAnalytics();
    }
}


//addSubject & deleteSubject & renderSubjects

function addSubject() {
    const name = subjectInputEl.value.trim();
    if (name) {
        subjects.push(name);
        subjectInputEl.value = '';
        saveData();
        renderSubjects();
    } else {
        alert("Please enter a subject name.");
    }
}

function deleteSubject(index) {
    if (confirm("Delete this subject?")) {
        subjects.splice(index, 1);
        saveData();
        renderSubjects();
    }
}

function renderSubjects() {
    subjectListEl.innerHTML = '';
    subjects.forEach((subject, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${subject}</span>
            <button class="delete-btn" onclick="deleteSubject(${index})">Delete</button>
        `;
        subjectListEl.appendChild(li);
    });
    taskSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        taskSubjectSelect.appendChild(option);
    });
}


//addTask & deleteTask & toggleTaskComplete & renderTasks

function addTask() {
    const title = taskTitleInput.value.trim();
    const subject = taskSubjectSelect.value;
    const date = taskDateInput.value;

    if (title && subject && date) {
        const newTask = {
            id: Date.now(),
            title: title,
            subject: subject,
            date: date,
            completed: false
        };
        tasks.push(newTask);

        taskTitleInput.value = '';
        taskSubjectSelect.value = '';
        taskDateInput.value = '';

        saveData();
        renderTasks();
        alert("Task Added!");
    } else {
        alert("Please fill in all fields.");
    }
}

function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index > -1 && confirm("Delete this task?")) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
    }
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
    }
}

function renderTasks() {
    // all task render
    taskListEl.innerHTML = '';
    // Sort tasks by date
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskListEl.appendChild(li);
    });

    // Today's Task render
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    todayTasksListEl.innerHTML = '';

    const todaysTasks = tasks.filter(task => task.date === todayStr);

    if (todaysTasks.length === 0) {
        todayTasksListEl.innerHTML = '<li style="justify-content: center; color: #777;">No tasks for today!</li>';
    } else {
        todaysTasks.forEach(task => {
            const li = createTaskElement(task);
            todayTasksListEl.appendChild(li);
        });
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    if (task.completed) {
        li.style.opacity = '0.6';
        li.style.textDecoration = 'line-through';
    }

    li.innerHTML = `
        <div>
            <span class="task-subject-tag">${task.subject}</span>
            <span style="font-weight: bold;">${task.title}</span>
            <br>
            <span class="task-meta">Due: ${task.date}</span>
        </div>
        <div>
            <button onclick="toggleTaskComplete(${task.id})" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.5rem;">
                ${task.completed ? 'Undo' : 'Done'}
            </button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">X</button>
        </div>
    `;
    return li;
}


//Schedule Management 

function addSchedule() {
    const day = scheduleDaySelect.value;
    const time = scheduleTimeInput.value;
    const subject = scheduleSubjectInput.value.trim();

    if (day && time && subject) {
        const newItem = {
            id: Date.now(),
            day: day,
            time: time,
            subject: subject
        };
        schedule.push(newItem);
        scheduleSubjectInput.value = '';

        saveData();
        renderSchedule();
    } else {
        alert("Please fill in Day, Time, and Subject.");
    }
}

function deleteSchedule(id) {
    if (confirm("Remove this class?")) {
        schedule = schedule.filter(item => item.id !== id);
        saveData();
        renderSchedule();
    }
}

function renderSchedule() {
    // Main Schedule Page render
    scheduleListContainer.innerHTML = '';

    // Order of days for display
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    daysOrder.forEach(day => {
        const dayItems = schedule.filter(item => item.day === day);
        if (dayItems.length > 0) {
            dayItems.sort((a, b) => a.time.localeCompare(b.time));

            const dayCard = document.createElement('div');
            dayCard.className = 'card';

            let itemsHtml = '';
            dayItems.forEach(item => {
                itemsHtml += `
                    <li>
                        <span><b>${item.time}</b> - ${item.subject}</span>
                        <button class="delete-btn" onclick="deleteSchedule(${item.id})" style="padding:0.2rem 0.5rem; font-size:0.8rem;">X</button>
                    </li>
                `;
            });

            dayCard.innerHTML = `<h3>${day}</h3><ul>${itemsHtml}</ul>`;
            scheduleListContainer.appendChild(dayCard);
        }
    });

    if (schedule.length === 0) {
        scheduleListContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No schedule added yet.</p>';
    }

    // Today's Schedule render
    todayScheduleListEl.innerHTML = '';
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];

    const todayItems = schedule.filter(item => item.day === currentDayName);
    todayItems.sort((a, b) => a.time.localeCompare(b.time));

    if (todayItems.length === 0) {
        todayScheduleListEl.innerHTML = '<li style="justify-content: center; color: #777;">No classes today!</li>';
    } else {
        todayItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span><b>${item.time}</b> - ${item.subject}</span>`;
            todayScheduleListEl.appendChild(li);
        });
    }
}

// Quick Actions

function goToAddTask() {
    showSection('tasks');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    taskDateInput.value = `${year}-${month}-${day}`;

    taskTitleInput.focus();
}

function goToAddSchedule() {
    showSection('schedule');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()];
    scheduleDaySelect.value = currentDayName;
}

// Analytics Logic
function updateAnalytics() {
    // 1. Completion Chart Data
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // 2. Subject Chart Data
    const subjectCounts = {};
    if (subjects.length === 0 && tasks.length > 0) {
        // Fallback if subjects empty but tasks exist
        tasks.forEach(t => {
            if (!subjectCounts[t.subject]) subjectCounts[t.subject] = 0;
        });
    } else {
        subjects.forEach(sub => subjectCounts[sub] = 0);
    }

    tasks.forEach(task => {
        if (subjectCounts.hasOwnProperty(task.subject)) {
            subjectCounts[task.subject]++;
        } else {
            // Handle cases where task subject might not be in subjects list anymore
            subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
        }
    });

    // 3. Weekly Activity Data (Next 7 Days)
    const next7Days = [];
    const dates = [];
    const dateCounts = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        next7Days.push(dateStr);
        dates.push(dayName);

        const count = tasks.filter(t => t.date === dateStr).length;
        dateCounts.push(count);
    }

    // Colors
    const chartColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#8AC926', '#1982C4', '#6A4C93'
    ];

    // Render Charts
    renderCompletionChart(completedTasks, pendingTasks);
    renderSubjectChart(subjectCounts, chartColors);
    renderWeeklyChart(dates, dateCounts);
}

function renderCompletionChart(completed, pending) {
    const ctx = document.getElementById('completionChart').getContext('2d');

    if (completionChartInstance) {
        completionChartInstance.destroy();
    }

    // Handle case where no tasks exist to show empty state or just 0s
    const data = (completed === 0 && pending === 0) ? [0, 0] : [completed, pending];
    const bgColors = (completed === 0 && pending === 0) ? ['#e0e0e0', '#e0e0e0'] : ['#4BC0C0', '#FF6384'];

    completionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderSubjectChart(subjectCounts, colors) {
    const ctx = document.getElementById('subjectChart').getContext('2d');
    const labels = Object.keys(subjectCounts);
    const data = Object.values(subjectCounts);

    if (subjectChartInstance) {
        subjectChartInstance.destroy();
    }

    subjectChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderWeeklyChart(dates, counts) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Tasks Due',
                data: counts,
                backgroundColor: '#36A2EB',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Tasks Due (Next 7 Days)'
                }
            }
        }
    });
}

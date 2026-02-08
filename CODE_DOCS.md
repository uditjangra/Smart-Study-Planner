# Code Documentation 📖

This document explains how the **Smart Study Planner** works under the hood. It is written for beginners to understand the logic.

## 🗄️ How Data Storage Works (LocalStorage)

We use the browser's **LocalStorage** to save your data.
-   **What is it?** Think of it like a tiny database inside your web browser.
-   **How it works:** Data is saved as "Key-Value" pairs (like a dictionary).
    -   `studyPlannerNames`: Saves your list of Subjects.
    -   `studyPlannerTasks`: Saves all your Tasks.
    -   `studyPlannerSchedule`: Saves your Weekly Schedule.
    -   `studyPlannerTheme`: Saves your preference for Light/Dark mode.
-   **Persistence:** Even if you refresh the page or close the browser, the data stays there until you click "Reset Data".

---

## ⚙️ Key JavaScript Functions (`script.js`)

Here is a breakdown of the main functions used in the code:

### 1. Data Handling
-   `loadData()`: Runs when the page opens. It checks LocalStorage for saved data and loads it into the app.
-   `saveData()`: Runs every time you add/delete something. It converts your data into a text string (`JSON.stringify`) and puts it into LocalStorage.
-   `resetData()`: Wipes everything from LocalStorage and reloads the page to start fresh.

### 2. Navigation
-   `showSection(sectionId)`: Hides all sections (like Home, Tasks, Schedule) and only shows the one you clicked on. It also highlights the active tab in the navigation bar.
-   `goToAddTask()` & `goToAddSchedule()`: Helper functions for the "Quick Actions" buttons. They switch tabs and pre-fill today's date/day for convenience.

### 3. Subject Management
-   `addSubject()`: Takes the text from the input, adds it to the `subjects` list, saves it, and refreshing the list.
-   `renderSubjects()`: loops through the `subjects` list and creates HTML list items (`<li>`) to display them. It also updates the dropdown menu in the "Add Task" section.

### 4. Task Management
-   `addTask()`: Creates a new task object with an ID, Title, Subject, Date, and Completed status.
-   `renderTasks()`:
    -   Sorts tasks by date.
    -   Displays ALL tasks in the "Tasks" tab.
    -   Filters and displays ONLY today's tasks in the "Home" dashboard.

### 5. Schedule Management
-   `addSchedule()`: Adds a class/activity to your weekly plan.
-   `renderSchedule()`: Groups your schedule items by Day (Monday, Tuesday, etc.) and displays them in the Schedule tab. It also shows today's classes on the Home dashboard.

---

## 🎨 Styling (`style.css`)

-   **CSS Variables**: We use variables (like `--bg-color`, `--nav-bg`) at the top of the file. This makes it easy to switch themes.
-   **Dark Mode**: When you switch themes, we adds a class called `.dark-theme` to the `<body>`. This overrides the variable colors with dark colors.

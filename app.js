
let currentCalendarDate = new Date();

const getTodayDate = () => {
  
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const getHabits = () => {
  const habitsJSON = localStorage.getItem("habits");
  return habitsJSON ? JSON.parse(habitsJSON) : [];
};

const saveHabits = (habits) => {
  localStorage.setItem("habits", JSON.stringify(habits));
};

const createNewHabit = (name, category, description) => {
  return {
    id: Date.now().toString(),
    name,
    category,
    description,
    history: {},
    currentStreak: 0,
    longestStreak: 0,
  };
};

//Streak Calculator

const calculateStreaks = (habit) => {
  const completedDates = Object.keys(habit.history)
    .filter((date) => habit.history[date] === true)
    .sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const dateObjects = completedDates.map((date) => new Date(date));

 
  for (let i = 0; i < dateObjects.length; i++) {
    tempStreak++;

    if (i < dateObjects.length - 1) {
      const nextDay = dateObjects[i + 1];
      const currentDay = dateObjects[i];

      
      const diffDays = Math.round(
        (nextDay.getTime() - currentDay.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);


  let lastDate = new Date();
  currentStreak = 0;

  for (let i = completedDates.length - 1; i >= 0; i--) {
    const currentDate = new Date(completedDates[i]);

    
    const diffDays = Math.round(
      (lastDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays <= 1) {
      currentStreak++;
      lastDate = currentDate;
    } else {
  
      break;
    }
  }

  return { currentStreak, longestStreak };
};

//Add-Habit Page
const setupAddHabitPage = () => {
  const habitForm = document.getElementById("habit-form");

  if (habitForm) {
    habitForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("habit-name").value.trim();
      const category = document.getElementById("habit-category").value;
      const description = document
        .getElementById("habit-description")
        .value.trim();

      const newHabit = createNewHabit(name, category, description);

      const habits = getHabits();
      habits.push(newHabit);
      saveHabits(habits);

      alert(`Habit "${name}" added successfully!`);
      window.location.href = "index.html";
    });
  }
};

//home page
const renderTodayHabitItem = (habit) => {
  const today = getTodayDate();
  const isCompleted = habit.history[today] === true;

  const completionClass = isCompleted ? "habit-completed" : "";
  const checkedAttribute = isCompleted ? "checked" : "";

  return `
        <li class="habit-item ${completionClass}" data-id="${habit.id}">
            <div class="habit-info">
                <h4 class="habit-name">${habit.name}</h4>
                <p class="habit-description">${
                  habit.description || habit.category
                }</p>
            </div>
            <div class="habit-tracker">
                <label class="completion-toggle">
                    <input 
                        type="checkbox" 
                        class="habit-checkbox" 
                        data-habit-id="${habit.id}" 
                        ${checkedAttribute}
                    >
                    <span class="checkmark"></span>
                </label>
            </div>
        </li>
    `;
};

const attachTrackingListener = () => {
  const today = getTodayDate();
  const listContainer = document.getElementById("today-habit-list");

  if (listContainer) {
    listContainer.addEventListener("change", (event) => {
      if (event.target.classList.contains("habit-checkbox")) {
        const checkbox = event.target;
        const habitId = checkbox.dataset.habitId;
        const isChecked = checkbox.checked;
        const listItem = checkbox.closest(".habit-item");

        let habits = getHabits();
        const habitIndex = habits.findIndex((h) => h.id === habitId);

        if (habitIndex !== -1) {
          // Update history
          habits[habitIndex].history[today] = isChecked;

          // Recalculate streaks
          const { currentStreak, longestStreak } = calculateStreaks(
            habits[habitIndex]
          );
          habits[habitIndex].currentStreak = currentStreak;
          habits[habitIndex].longestStreak = longestStreak;

          saveHabits(habits);

         
          if (isChecked) {
            listItem.classList.add("habit-completed");
          } else {
            listItem.classList.remove("habit-completed");
          }
        }
      }
    });
  }
};

const setupHomePage = () => {
  const habitList = document.getElementById("today-habit-list");

  if (habitList) {
    const habits = getHabits();

    if (habits.length === 0) {
      habitList.innerHTML =
        '<li class="no-habits">No habits to track today. <a href="add-habit.html">Add a new habit!</a></li>';
      return;
    }

    const habitsHTML = habits.map(renderTodayHabitItem).join("");
    habitList.innerHTML = habitsHTML;

    attachTrackingListener();
  }
};


const handleDeleteHabit = (event) => {
  const button = event.target;
  if (!button.classList.contains("btn-delete")) return;

  const habitId = button.dataset.id;
  if (
    !confirm(
      "Are you sure you want to delete this habit? This cannot be undone."
    )
  ) {
    return;
  }

  let habits = getHabits();

  habits = habits.filter((habit) => habit.id !== habitId);
  saveHabits(habits);


  setupHabitsPage();
};


const renderHabitItem = (habit) => {
  return `
        <li class="habit-item" data-habit-id="${habit.id}">
            <div class="habit-info">
                <h4 class="habit-name">${habit.name}</h4>
                <span class="habit-category">Category: ${habit.category}</span>
                <p class="habit-description">${habit.description}</p>
                <span class="habit-streak">Current Streak: ${habit.currentStreak} days</span>
            </div>
            <button class="btn btn-delete" data-id="${habit.id}">Delete</button>
        </li>
    `;
};


const setupHabitsPage = () => {
  const habitList = document.getElementById("habit-list");

  if (habitList) {
    const habits = getHabits();

    if (habits.length === 0) {
      habitList.innerHTML =
        '<li class="no-habits">You have no habits yet. <a href="add-habit.html">Start tracking one!</a></li>';
      return;
    }

    const habitsHTML = habits.map(renderHabitItem).join("");
    habitList.innerHTML = habitsHTML;

 
    habitList.addEventListener("click", handleDeleteHabit);
  }
};


//Habit Change
const handleHabitSelectionChange = (event) => {
  const selectedHabitId = event.target.value;
  setupStreakPage(selectedHabitId);
};


const handleMonthChange = (direction) => {

  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);

//Month selector
  const habitSelector = document.getElementById("habit-selector");
  if (habitSelector) {
    setupStreakPage(habitSelector.value);
  }
};

const renderStreakPage = (habit) => {
  const calendarGrid = document.getElementById("calendar-grid");

  if (!calendarGrid || !habit) return;

  const { currentStreak, longestStreak } = calculateStreaks(habit);

  document.querySelector(
    ".streak-box .streak-value:nth-child(2)"
  ).textContent = `🔥 ${currentStreak} days (${habit.name})`;
  document.querySelector(
    ".streak-box .streak-value:nth-child(4)"
  ).textContent = `🏆 ${longestStreak} days (${habit.name})`;


  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  document.querySelector(
    ".month-label"
  ).textContent = `${currentCalendarDate.toLocaleString("default", {
    month: "long",
  })} ${year}`;

  let calendarHTML = "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach((day) => {
    calendarHTML += `<div class="weekday">${day}</div>`;
  });

 
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarHTML += '<div class="calendar-day"></div>';
  }


  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const isCompleted = habit.history[fullDate] === true;
    const completionClass = isCompleted ? "done" : "";

    calendarHTML += `<div class="calendar-day ${completionClass}" data-date="${fullDate}">${day}</div>`;
  }

  calendarGrid.innerHTML = calendarHTML;
};

const setupStreakPage = (selectedHabitId) => {
  const habits = getHabits();
  const habitSelector = document.getElementById("habit-selector");
  const prevBtn = document.getElementById("prev-month-btn");
  const nextBtn = document.getElementById("next-month-btn");

  if (habits.length === 0) {
    if (habitSelector) habitSelector.style.display = "none";
    document.querySelector(".main").innerHTML =
      '<h2 class="page-title">Add habits first to see your streak! <a href="add-habit.html">Add Habit</a></h2>';
    return;
  }

  if (habitSelector) {
    const initialSelectedId = selectedHabitId || habits[0].id;
    const selectedHabit = habits.find((h) => h.id === initialSelectedId);

    habitSelector.innerHTML = habits
      .map(
        (h) =>
          `<option value="${h.id}" ${
            h.id === initialSelectedId ? "selected" : ""
          }>${h.name}</option>`
      )
      .join("");

    if (!habitSelector.dataset.listenerAttached) {
      habitSelector.addEventListener("change", handleHabitSelectionChange);
      habitSelector.dataset.listenerAttached = "true";
    }

    if (prevBtn && !prevBtn.dataset.listenerAttached) {
      prevBtn.addEventListener("click", () => handleMonthChange(-1));
      nextBtn.addEventListener("click", () => handleMonthChange(1));
      prevBtn.dataset.listenerAttached = "true";
    }

    renderStreakPage(selectedHabit);
  }
};



const init = () => {
  const path = window.location.pathname;

  if (path.includes("add-habit.html")) {
    setupAddHabitPage();
  } else if (path.includes("habits.html")) {
    setupHabitsPage();
  } else if (path.includes("streak.html")) {
    currentCalendarDate = new Date();
    setupStreakPage();
  } else if (path.includes("index.html") || path.endsWith("/")) {
    setupHomePage();
  }
};

init();

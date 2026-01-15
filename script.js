// Task Data
const defaultTasks = [
    { id: 'quran_morning', title: 'ورد القرآن الكريم', time: 'بعد صلاة الفجر', category: 'quran' },
    { id: 'morning_azkar', title: 'أذكار الصباح', time: 'بعد صلاة الفجر', category: 'morning' },
    { id: 'evening_azkar', title: 'أذكار المساء', time: 'بعد العصر', category: 'evening' },
    { id: 'quran_hifz', title: 'حفظ قرآن', time: 'بعد العصر', category: 'quran' },
    { id: 'tajweed_lesson', title: 'درس تجويد', time: 'بعد العصر', category: 'quran' },
    { id: 'tasbeeh_100', title: 'سبحان الله وبحمده سبحان الله العظيم', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'istighfar_100', title: 'الاستغفار', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'salat_nabi_100', title: 'الصلاة على النبي', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'hawqala_100', title: 'لا حول ولا قوة إلا بالله', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'mulk_surah', title: 'قراءة سورة الملك', time: 'قبل النوم', category: 'night' }
];

let spiritualTasks = JSON.parse(localStorage.getItem('spiritual_tasks_v1')) || defaultTasks;

// Data Migration: Remove names from existing tasks if they exist
spiritualTasks = spiritualTasks.map(task => {
    if (task.title.includes('(علا)')) task.title = task.title.replace('(علا)', '').trim();
    if (task.title.includes('(أحمد)')) task.title = task.title.replace('(أحمد)', '').trim();
    return task;
});
localStorage.setItem('spiritual_tasks_v1', JSON.stringify(spiritualTasks));

const motivationalMessages = [
    "أحسنت! تقبل الله منك",
    "ما شاء الله، استمر في طاعتك",
    "تبارك الله، زادك الله من فضله",
    "خطوة رائعة نحو الجنة",
    "بارك الله في وقتك وجهدك",
    "عمل صالح يرفعك درجات",
    "السعادة في طاعة الله، أحسنت",
    "نور الله قلبك بالإيمان"
];

// Initialize State
let userProgress = JSON.parse(localStorage.getItem('spiritual_tracker_v1')) || {};
let userCounts = JSON.parse(localStorage.getItem('spiritual_counts_v1')) || {};
let lastDate = localStorage.getItem('spiritual_last_date_v1');
let customDua = localStorage.getItem('spiritual_custom_dua_v1') || "";

// Auto Reset if New Day
const todayDateString = new Date().toDateString();
if (lastDate !== todayDateString) {
    userProgress = {};
    userCounts = {};
    localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
    localStorage.setItem('spiritual_counts_v1', JSON.stringify(userCounts));
    localStorage.setItem('spiritual_last_date_v1', todayDateString);
}

// DOM Elements
const trackerBody = document.getElementById('tracker-body');
const progressPath = document.getElementById('progress-path');
const progressText = document.getElementById('progress-text');
const currentDateEl = document.getElementById('current-date');
const timerText = document.getElementById('timer-text');
const timerPath = document.getElementById('timer-path');
const timerCard = document.getElementById('timer-card');
let warningShown = false;

// Set Current Date
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('ar-EG', options);
    currentDateEl.textContent = today;
}

// Render Table
function renderTasks() {
    trackerBody.innerHTML = spiritualTasks.map(task => {
        const isCompleted = userProgress[task.id];
        const currentCount = userCounts[task.id] || 0;
        const target = parseInt(task.target);
        const hasCounter = !isNaN(target) && target > 0;

        return `
            <tr>
                <td>
                    <div class="task-title-cell">
                        <span class="badge badge-${task.category}">${task.title}</span>
                        <div class="manage-btns">
                            <button class="icon-btn edit-btn" onclick="editTask('${task.id}')">✏️</button>
                            <button class="icon-btn delete-btn" onclick="deleteTask('${task.id}')">🗑️</button>
                        </div>
                    </div>
                </td>
                <td>${task.time}</td>
                <td class="status-cell">
                    <div class="status-controls">
                        ${hasCounter ? `
                            <button class="counter-btn" onclick="incrementCount('${task.id}', ${target})">
                                ${currentCount} / ${target}
                            </button>
                        ` : ''}
                        <label class="checkbox-container">
                            <input type="checkbox" 
                                   id="${task.id}" 
                                   ${isCompleted ? 'checked' : ''} 
                                   onchange="toggleTask('${task.id}')">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Increment Count
window.incrementCount = function(taskId, target) {
    if (userProgress[taskId]) return; // Already done

    userCounts[taskId] = (userCounts[taskId] || 0) + 1;
    
    if (userCounts[taskId] >= target) {
        userProgress[taskId] = true;
        playSuccessFeedback();
    }

    localStorage.setItem('spiritual_counts_v1', JSON.stringify(userCounts));
    localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
    
    renderTasks();
    updateProgress();
    checkAllDone();
}

// Toggle Task
window.toggleTask = function(taskId) {
    userProgress[taskId] = !userProgress[taskId];
    
    if (userProgress[taskId]) {
        playSuccessFeedback();
    }
    
    localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
    updateProgress();
    checkAllDone();
}

function checkAllDone() {
    const allDone = spiritualTasks.length > 0 && spiritualTasks.every(t => userProgress[t.id]);
    if (allDone) {
        setTimeout(confettiEffect, 1000); // Slight delay to separate from single task feedback
    }
}

function playSuccessFeedback() {
    const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    showSimpleToast(randomMsg);
    
    const msg = new SpeechSynthesisUtterance();
    msg.text = randomMsg;
    msg.lang = 'ar-SA';
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}



// Update Progress Circle
function updateProgress() {
    const total = spiritualTasks.length;
    const completed = spiritualTasks.filter(t => userProgress[t.id]).length;
    const percentage = Math.round((completed / total) * 100);
    
    progressText.textContent = `${percentage}%`;
    progressPath.setAttribute('stroke-dasharray', `${percentage}, 100`);
}

// Countdown Timer Logic
function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); 

    const diff = midnight - now; 
    
    if (diff <= 0) {
        timerText.textContent = "00:00";
        timerPath.setAttribute('stroke-dasharray', '100, 100');
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format display (HH:MM:SS)
    timerText.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Calculate percentage (elapsed)
    const totalSecondsInDay = 24 * 60 * 60;
    const secondsRemaining = diff / 1000;
    const percentageRemaining = (secondsRemaining / totalSecondsInDay) * 100;
    const percentageElapsed = 100 - percentageRemaining;

    if (timerPath) {
        timerPath.setAttribute('stroke-dasharray', `${percentageElapsed}, 100`);
    }

    // Color Transitions & Warnings
    if (hours < 2) {
        timerCard.className = 'stat-card timer-critical';
        if (hours < 1 && !warningShown) {
            showSimpleToast("تنبيه: الوقت قارب على الانتهاء! استكمل أورادك");
            warningShown = true;
        }
    } else if (hours < 6) {
        timerCard.className = 'stat-card timer-warning';
    } else {
        timerCard.className = 'stat-card';
    }
}

function showSimpleToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const originalText = toast.textContent;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.textContent = originalText; }, 500);
    }, 4000);
}


// Celebration & Voice Prayer
function confettiEffect() {
    // Visual Effect
    document.body.style.boxShadow = 'inset 0 0 100px var(--primary-light)';
    setTimeout(() => {
        document.body.style.boxShadow = 'none';
    }, 1000);

    // Show Modal
    const modal = document.getElementById('celebration-modal');
    const duaDisplay = document.getElementById('dua-text');
    
    // Use custom dua if available, otherwise hide or use default
    duaDisplay.textContent = customDua || "تقبل الله طاعاتكم وزادكم من فضله";
    
    modal.classList.add('active');

    // Voice Prayer (Speech Synthesis)
    const prayerText = duaDisplay.textContent;
    const msg = new SpeechSynthesisUtterance();
    msg.text = prayerText;
    msg.lang = 'ar-SA';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
}

window.saveCustomDua = function() {
    const input = document.getElementById('custom-dua-input');
    customDua = input.value;
    localStorage.setItem('spiritual_custom_dua_v1', customDua);
}


window.closeModal = function() {
    document.getElementById('celebration-modal').classList.remove('active');
    window.speechSynthesis.cancel();
}

// Reset Progress
window.resetProgress = function() {
    if (confirm('هل تريد تصفير العداد ليوم جديد؟')) {
        userProgress = {};
        userCounts = {};
        localStorage.removeItem('spiritual_tracker_v1');
        localStorage.removeItem('spiritual_counts_v1');
        renderTasks();
        updateProgress();
        showToast();
    }
}

// Show Notification
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Task Management Functions
window.openTaskModal = function(taskId = null) {
    const modal = document.getElementById('task-modal');
    const titleInput = document.getElementById('task-title-input');
    const timeInput = document.getElementById('task-time-input');
    const categorySelect = document.getElementById('task-category-input');
    const targetInput = document.getElementById('task-target-input');
    const idInput = document.getElementById('task-id-input');
    const modalTitle = document.getElementById('modal-title');

    if (taskId) {
        const task = spiritualTasks.find(t => t.id === taskId);
        modalTitle.textContent = "تعديل عبادة";
        idInput.value = task.id;
        titleInput.value = task.title;
        timeInput.value = task.time;
        categorySelect.value = task.category;
        targetInput.value = task.target || "";
    } else {
        modalTitle.textContent = "إضافة عبادة";
        idInput.value = "";
        titleInput.value = "";
        timeInput.value = "";
        categorySelect.value = "quran";
        targetInput.value = "";
    }

    modal.classList.add('active');
}

window.closeTaskModal = function() {
    document.getElementById('task-modal').classList.remove('active');
}

window.saveTask = function(event) {
    event.preventDefault();
    const id = document.getElementById('task-id-input').value;
    const title = document.getElementById('task-title-input').value;
    const time = document.getElementById('task-time-input').value;
    const category = document.getElementById('task-category-input').value;
    const target = parseInt(document.getElementById('task-target-input').value) || null;

    if (id) {
        // Edit existing
        const index = spiritualTasks.findIndex(t => t.id === id);
        spiritualTasks[index] = { ...spiritualTasks[index], title, time, category, target };
    } else {
        // Add new
        const newId = 'task_' + Date.now();
        spiritualTasks.push({ id: newId, title, time, category, target });
    }

    localStorage.setItem('spiritual_tasks_v1', JSON.stringify(spiritualTasks));
    closeTaskModal();
    renderTasks();
    updateProgress();
}

window.deleteTask = function(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه العبادة؟')) {
        spiritualTasks = spiritualTasks.filter(t => t.id !== taskId);
        delete userProgress[taskId];
        delete userCounts[taskId];
        localStorage.setItem('spiritual_tasks_v1', JSON.stringify(spiritualTasks));
        localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
        localStorage.setItem('spiritual_counts_v1', JSON.stringify(userCounts));
        renderTasks();
        updateProgress();
    }
}

window.editTask = function(taskId) {
    openTaskModal(taskId);
}

// App Initialization
function init() {
    updateDate();
    renderTasks();
    updateProgress();
    updateCountdown();
    
    // Set custom dua input value
    const duaInput = document.getElementById('custom-dua-input');
    if (duaInput) duaInput.value = customDua;

    setInterval(updateCountdown, 1000);
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker Registered'));
}

init();

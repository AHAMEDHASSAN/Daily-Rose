// Task Data
const spiritualTasks = [
    { id: 'quran_morning', title: 'ورد القرآن الكريم', time: 'بعد صلاة الفجر', category: 'quran' },
    { id: 'morning_azkar', title: 'أذكار الصباح', time: 'بعد صلاة الفجر', category: 'morning' },
    { id: 'evening_azkar', title: 'أذكار المساء', time: 'بعد العصر', category: 'evening' },
    { id: 'quran_hifz', title: 'حفظ قرآن (علا)', time: 'بعد العصر', category: 'quran' },
    { id: 'tajweed_lesson', title: 'درس تجويد (أحمد)', time: 'بعد العصر', category: 'quran' },
    { id: 'tasbeeh_100', title: 'سبحان الله وبحمده سبحان الله العظيم', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'istighfar_100', title: 'الاستغفار', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'salat_nabi_100', title: 'الصلاة على النبي', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'hawqala_100', title: 'لا حول ولا قوة إلا بالله', time: 'بعد صلاة العشاء', category: 'night', target: 100 },
    { id: 'mulk_surah', title: 'قراءة سورة الملك', time: 'قبل النوم', category: 'night' }
];

// Initialize State
let userProgress = JSON.parse(localStorage.getItem('spiritual_tracker_v1')) || {};
let userCounts = JSON.parse(localStorage.getItem('spiritual_counts_v1')) || {};
let lastDate = localStorage.getItem('spiritual_last_date_v1');

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
        const hasCounter = !!task.target;

        return `
            <tr>
                <td>
                    <span class="badge badge-${task.category}">${task.title}</span>
                </td>
                <td>${task.time}</td>
                <td class="status-cell">
                    <div class="status-controls">
                        ${hasCounter ? `
                            <button class="counter-btn" onclick="incrementCount('${task.id}', ${task.target})">
                                ${currentCount} / ${task.target}
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
        confettiEffect();
    }

    localStorage.setItem('spiritual_counts_v1', JSON.stringify(userCounts));
    localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
    
    renderTasks();
    updateProgress();
}

// Toggle Task
window.toggleTask = function(taskId) {
    userProgress[taskId] = !userProgress[taskId];
    
    // If unchecked, maybe reset count? (User's choice, let's keep count for now)
    
    localStorage.setItem('spiritual_tracker_v1', JSON.stringify(userProgress));
    updateProgress();
    
    const allDone = spiritualTasks.every(t => userProgress[t.id]);
    if (allDone) {
        confettiEffect();
    }
}

// Update Progress Circle
function updateProgress() {
    const total = spiritualTasks.length;
    const completed = spiritualTasks.filter(t => userProgress[t.id]).length;
    const percentage = Math.round((completed / total) * 100);
    
    progressText.textContent = `${percentage}%`;
    progressPath.setAttribute('stroke-dasharray', `${percentage}, 100`);
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
    modal.classList.add('active');

    // Voice Prayer (Speech Synthesis)
    const prayerText = document.getElementById('dua-text').textContent;
    const msg = new SpeechSynthesisUtterance();
    msg.text = prayerText;
    msg.lang = 'ar-SA';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
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

// App Initialization
function init() {
    updateDate();
    renderTasks();
    updateProgress();
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker Registered'));
}

init();

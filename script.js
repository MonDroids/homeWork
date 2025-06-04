// DOM бүрэн ачаалагдсаны дараа ажиллуулах
document.addEventListener('DOMContentLoaded', () => {
    // Элементийн заагчид
    const workInput = document.getElementById('work-duration-input');
    const breakInput = document.getElementById('break-duration-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    const timerLabel = document.getElementById('timer-label');
    const timeDisplay = document.getElementById('time-display');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    const sessionsCompletedEl = document.getElementById('sessions-completed');

    // Дуут дохионы объект
    const alarmSound = new Audio('ding.mp3');

    // Өгөгдөл хадгалах түлхүүрүүд
    const LS_WORK = 'pomodoro-work-duration';
    const LS_BREAK = 'pomodoro-break-duration';
    const LS_SESSIONS = 'pomodoro-sessions-completed';

    // Тулаад буй цагийн төлөв
    let isRunning = false;
    let isWorkPeriod = true;
    let remainingTime = 0; // секундын тоогоор
    let timerInterval = null;

    // Өгөгдөл унших функцийг тодорхойлох
    function loadSettings() {
        const savedWork = localStorage.getItem(LS_WORK);
        const savedBreak = localStorage.getItem(LS_BREAK);
        const savedSessions = localStorage.getItem(LS_SESSIONS);

        if (savedWork) {
            workInput.value = parseInt(savedWork, 10);
        }
        if (savedBreak) {
            breakInput.value = parseInt(savedBreak, 10);
        }
        if (savedSessions) {
            sessionsCompletedEl.textContent = parseInt(savedSessions, 10);
        }

        resetTimer();
    }

    // Тулалдсан хугацааг форматаар (mm:ss) харуулах
    function formatTime(sec) {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Notification харуулах функц
    function showNotification(message) {
        if (!("Notification" in window)) {
            // Энэ хөтөч Notification-ийг дэмжихгүй
            return;
        }
        if (Notification.permission === 'granted') {
            new Notification(message);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(message);
                }
            });
        }
    }

    // Таймерээ эхлүүлэх
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                onPeriodEnd();
                return;
            }
            remainingTime--;
            timeDisplay.textContent = formatTime(remainingTime);
        }, 1000);
    }

    // Таймерээ зогсоох
    function pauseTimer() {
        if (!isRunning) return;
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // Шинэ период эхлэх үед хийгдэх үйлдэл
    function onPeriodEnd() {
        // Дуут дохио тоглуулах
        alarmSound.play();

        // Browser notification харуулах
        if (isWorkPeriod) {
            showNotification("Ажиллах хугацаа дууслаа! Амарч эхлээрэй.");
        } else {
            showNotification("Амрах хугацаа дууслаа! Дахин ажиллаж эхлээрэй.");
        }

        // Хэрвээ ажлын хугацаа дууссан бол session нэмэгдүүлэх
        if (isWorkPeriod) {
            incrementSessions();
        }

        // Дараагийн период руу шилжих
        isWorkPeriod = !isWorkPeriod;
        resetTimer();
        startTimer();
    }

    // Reset буюу дахин тохируулах
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;

        if (isWorkPeriod) {
            timerLabel.textContent = 'Ажиллах цаг';
            remainingTime = parseInt(workInput.value, 10) * 60;
        } else {
            timerLabel.textContent = 'Амрах цаг';
            remainingTime = parseInt(breakInput.value, 10) * 60;
        }
        timeDisplay.textContent = formatTime(remainingTime);
    }

    // Хийгдсэн session-үүдийн тоог нэмэх функц
    function incrementSessions() {
        let count = parseInt(localStorage.getItem(LS_SESSIONS) || '0', 10);
        count++;
        localStorage.setItem(LS_SESSIONS, count);
        sessionsCompletedEl.textContent = count;
    }

    // Тохиргоо хадгалах
    saveSettingsBtn.addEventListener('click', () => {
        const workMins = parseInt(workInput.value, 10);
        const breakMins = parseInt(breakInput.value, 10);

        if (workMins < 1 || breakMins < 1) {
            alert('Утга 1-ээс их байх ёстой');
            return;
        }

        localStorage.setItem(LS_WORK, workMins);
        localStorage.setItem(LS_BREAK, breakMins);
        // Шинэчилсэн тохиргооор таймерээ дахин тохируулна
        isWorkPeriod = true;
        resetTimer();
        alert('Тохиргоо амжилттай хадгалагдлаа');
    });

    // Товчны үйлдлүүд
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', () => {
        isWorkPeriod = true;
        resetTimer();
    });

    // Апп эхлүүлэхэд өгөгдөл унших
    loadSettings();
});

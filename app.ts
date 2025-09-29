class PomodoroTimer {
    workTime: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    currentTime: number;
    isRunning: boolean;
    isWorkSession: boolean;
    cycle: number;
    totalTime: number;
    timerDisplay: HTMLElement | null;
    timerStatus: HTMLElement | null;
    startBtn: HTMLElement | null;
    pauseBtn: HTMLElement | null;
    cycleInfo: HTMLElement | null;
    progressCircle: SVGCircleElement | null;
    timer: number | null;

    constructor() {
        this.workTime = 25 * 60;
        this.shortBreak = 10 * 60;
        this.longBreak = 15 * 60;
        this.longBreakInterval = 4;

        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.cycle = 1;
        this.totalTime = 0;
        this.timer = null;

        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerStatus = document.getElementById('timerStatus');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.cycleInfo = document.getElementById('cycleInfo');
        this.progressCircle = document.querySelector('.progress') as SVGCircleElement | null;

        this.setupProgressCircle();
        this.updateDisplay();
        this.loadSettings();
    }

    setupProgressCircle() {
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        if (this.progressCircle) {
            this.progressCircle.style.strokeDasharray = `${circumference}`;
            this.progressCircle.style.strokeDashoffset = `${circumference}`;
        }
    }

    updateProgressCircle() {
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const totalTime = this.isWorkSession ? this.workTime :
            (this.cycle % this.longBreakInterval === 0 && this.cycle > 0) ? this.longBreak : this.shortBreak;
        const progress = (totalTime - this.currentTime) / totalTime;
        const offset = circumference - progress * circumference;
        if (this.progressCircle) {
            this.progressCircle.style.strokeDashoffset = `${offset}`;
            this.progressCircle.style.stroke = this.isWorkSession ? '#4CAF50' : '#FF9800';
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        if (this.timerDisplay)
            this.timerDisplay.textContent = `${pad2(minutes)}:${pad2(seconds)}`;

        const statusText = this.isWorkSession ? 'Ish vaqti - Fokus qiling!' : 'Tanaffus - Dam oling!';
        if (this.timerStatus) {
            this.timerStatus.textContent = statusText;
            this.timerStatus.className = this.isWorkSession ? 'timer-status work-mode' : 'timer-status break-mode';
        }

        const totalHours = Math.floor(this.totalTime / 3600);
        const totalMinutes = Math.floor((this.totalTime % 3600) / 60);
        if (this.cycleInfo)
            this.cycleInfo.textContent = `Sikl: ${this.cycle} | Jami: ${totalHours}s ${totalMinutes}d`;

        this.updateProgressCircle();
        this.updateTitle();
    }

    updateTitle() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeString = `${pad2(minutes)}:${pad2(seconds)}`;
        const status = this.isWorkSession ? '🍅' : '☕';
        document.title = `${status} ${timeString} - Pomodoro Timer`;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            if (this.startBtn) this.startBtn.style.display = 'none';
            if (this.pauseBtn) this.pauseBtn.style.display = 'inline-block';

            this.timer = window.setInterval(() => {
                this.currentTime--;
                this.totalTime++;
                this.updateDisplay();

                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.timer !== null) clearInterval(this.timer);
            if (this.startBtn) this.startBtn.style.display = 'inline-block';
            if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        }
    }

    reset() {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workTime :
            (this.cycle % this.longBreakInterval === 0 && this.cycle > 0) ? this.longBreak : this.shortBreak;
        this.updateDisplay();
    }

    completeSession() {
        this.pause();
        this.playNotificationSound();

        if (this.isWorkSession) {
            this.showNotification('Ish vaqti tugadi! Tanaffus vaqti.');
            this.isWorkSession = false;
            this.currentTime = (this.cycle % this.longBreakInterval === 0) ? this.longBreak : this.shortBreak;
        } else {
            this.showNotification('Tanaffus tugadi! Ish vaqti boshlandi.');
            this.isWorkSession = true;
            this.cycle++;
            this.currentTime = this.workTime;
        }

        this.updateDisplay();
        setTimeout(() => {
            this.start();
        }, 2000);
    }

    skip() {
        this.pause();
        if (this.isWorkSession) {
            this.isWorkSession = false;
            this.currentTime = (this.cycle % this.longBreakInterval === 0) ? this.longBreak : this.shortBreak;
        } else {
            this.isWorkSession = true;
            this.cycle++;
            this.currentTime = this.workTime;
        }
        this.updateDisplay();
    }

    showNotification(message: string) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }

    playNotificationSound() {
        const soundEnabled = document.getElementById('soundEnabled') as HTMLInputElement | null;
        if (soundEnabled && soundEnabled.checked) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }

    updateSettings() {
        const workTimeInput = document.getElementById('workTime') as HTMLInputElement | null;
        const shortBreakInput = document.getElementById('shortBreak') as HTMLInputElement | null;
        const longBreakInput = document.getElementById('longBreak') as HTMLInputElement | null;
        const longBreakIntervalInput = document.getElementById('longBreakInterval') as HTMLInputElement | null;

        if (workTimeInput) this.workTime = parseInt(workTimeInput.value) * 60;
        if (shortBreakInput) this.shortBreak = parseInt(shortBreakInput.value) * 60;
        if (longBreakInput) this.longBreak = parseInt(longBreakInput.value) * 60;
        if (longBreakIntervalInput) this.longBreakInterval = parseInt(longBreakIntervalInput.value);

        this.reset();
        this.saveSettings();
    }

    saveSettings() {
        const settings = {
            workTime: this.workTime / 60,
            shortBreak: this.shortBreak / 60,
            longBreak: this.longBreak / 60,
            longBreakInterval: this.longBreakInterval
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const settings = localStorage.getItem('pomodoroSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.workTime = parsed.workTime * 60;
            this.shortBreak = parsed.shortBreak * 60;
            this.longBreak = parsed.longBreak * 60;
            this.longBreakInterval = parsed.longBreakInterval;

            const workTimeInput = document.getElementById('workTime') as HTMLInputElement | null;
            const shortBreakInput = document.getElementById('shortBreak') as HTMLInputElement | null;
            const longBreakInput = document.getElementById('longBreak') as HTMLInputElement | null;
            const longBreakIntervalInput = document.getElementById('longBreakInterval') as HTMLInputElement | null;

            if (workTimeInput) workTimeInput.value = parsed.workTime;
            if (shortBreakInput) shortBreakInput.value = parsed.shortBreak;
            if (longBreakInput) longBreakInput.value = parsed.longBreak;
            if (longBreakIntervalInput) longBreakIntervalInput.value = parsed.longBreakInterval;

            this.currentTime = this.workTime;
            this.updateDisplay();
        }
    }
}

// Initialize the timer
const pomodoro = new PomodoroTimer();

function toggleTimer() {
    if (pomodoro.isRunning) {
        pomodoro.pause();
    } else {
        pomodoro.start();
    }
}

function pauseTimer() {
    pomodoro.pause();
}

function resetTimer() {
    pomodoro.reset();
}

function skipSession() {
    pomodoro.skip();
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('open');
}

function changeBackground() {
    const fileInput = document.getElementById('backgroundImage') as HTMLInputElement | null;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        if (e.target && typeof e.target.result === 'string') {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            localStorage.setItem('backgroundImage', e.target.result);
        }
    };
    reader.readAsDataURL(file);
}

function resetBackground() {
    document.body.style.backgroundImage = '';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    localStorage.removeItem('backgroundImage');
}

function loadBackground() {
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Null-check for all settings inputs
const workTimeInput = document.getElementById('workTime');
if (workTimeInput) workTimeInput.addEventListener('change', () => pomodoro.updateSettings());

const shortBreakInput = document.getElementById('shortBreak');
if (shortBreakInput) shortBreakInput.addEventListener('change', () => pomodoro.updateSettings());

const longBreakInput = document.getElementById('longBreak');
if (longBreakInput) longBreakInput.addEventListener('change', () => pomodoro.updateSettings());

const longBreakIntervalInput = document.getElementById('longBreakInterval');
if (longBreakIntervalInput) longBreakIntervalInput.addEventListener('change', () => pomodoro.updateSettings());

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        toggleTimer();
    } else if (event.code === 'KeyR') {
        event.preventDefault();
        resetTimer();
    } else if (event.code === 'KeyS') {
        event.preventDefault();
        skipSession();
    }
});

loadBackgroundAndColors();
createColorTemplates();
createThemeTemplates();

document.addEventListener('click', function(event) {
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsToggle = document.querySelector('.settings-toggle');
    // Null-check for both elements
    if (
        settingsPanel &&
        settingsToggle &&
        !settingsPanel.contains(event.target as Node) &&
        !settingsToggle.contains(event.target as Node)
    ) {
        settingsPanel.classList.remove('open');
    }
});

// Color and theme functions
function changeBackgroundColor() {
    const colorPicker = document.getElementById('colorPicker') as HTMLInputElement | null;
    if (colorPicker) {
        const color = colorPicker.value;
        applyBackgroundColor(color);
    }
}

function applyBackgroundColor(color: string) {
    document.body.style.backgroundImage = '';
    document.body.style.background = color;
    localStorage.setItem('backgroundColor', color);
    localStorage.removeItem('backgroundImage');
    updateActiveColorSelection(color);
}

function createColorTemplates() {
    const colorTemplates = [
        { name: 'Mavi', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
        { name: 'Qizil', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' },
        { name: 'Yashil', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
        { name: 'Sariq', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
        { name: 'Binafsha', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
        { name: 'Apelsin', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' },
        { name: 'Pushti', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#ff9a9e' },
        { name: 'Qora', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)', color: '#434343' }
    ];

    const container = document.getElementById('colorTemplates');
    if (container) {
        container.innerHTML = '';
        colorTemplates.forEach((template, index) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.setAttribute('data-color', template.gradient);
            colorItem.innerHTML = `
                <div class="color-preview" style="background: ${template.gradient}"></div>
                <div class="color-name">${template.name}</div>
            `;
            colorItem.addEventListener('click', () => applyBackgroundGradient(template.gradient));
            container.appendChild(colorItem);
        });
    }
}

function createThemeTemplates() {
    const themeTemplates = [
        { name: 'Klassik', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Quyosh', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
        { name: 'Okean', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { name: 'Tog\'', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
        { name: 'Kecha', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
        { name: 'Bahor', gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)' }
    ];

    const container = document.getElementById('themeTemplates');
    if (container) {
        container.innerHTML = '';
        themeTemplates.forEach((template, index) => {
            const themeItem = document.createElement('div');
            themeItem.className = 'theme-item';
            themeItem.setAttribute('data-theme', template.gradient);
            themeItem.innerHTML = `
                <div class="theme-preview" style="background: ${template.gradient}"></div>
                <div class="theme-name">${template.name}</div>
            `;
            themeItem.addEventListener('click', () => applyBackgroundGradient(template.gradient));
            container.appendChild(themeItem);
        });
    }
}

function applyBackgroundGradient(gradient: string) {
    document.body.style.backgroundImage = '';
    document.body.style.background = gradient;
    localStorage.setItem('backgroundGradient', gradient);
    localStorage.removeItem('backgroundImage');
    localStorage.removeItem('backgroundColor');
    updateActiveThemeSelection(gradient);
}

function updateActiveColorSelection(color: string) {
    const colorItems = document.querySelectorAll('.color-item');
    colorItems.forEach(item => {
        item.classList.remove('active');
        const itemColor = item.getAttribute('data-color');
        if (itemColor && itemColor.indexOf(color) !== -1) {
            item.classList.add('active');
        }
    });
}

function updateActiveThemeSelection(gradient: string) {
    const themeItems = document.querySelectorAll('.theme-item');
    themeItems.forEach(item => {
        item.classList.remove('active');
        const itemTheme = item.getAttribute('data-theme');
        if (itemTheme === gradient) {
            item.classList.add('active');
        }
    });
}

function loadBackgroundAndColors() {
    const savedBackground = localStorage.getItem('backgroundImage');
    const savedColor = localStorage.getItem('backgroundColor');
    const savedGradient = localStorage.getItem('backgroundGradient');
    
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else if (savedColor) {
        document.body.style.background = savedColor;
        updateActiveColorSelection(savedColor);
        const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
        if (colorPicker) colorPicker.value = savedColor;
    } else if (savedGradient) {
        document.body.style.background = savedGradient;
        updateActiveThemeSelection(savedGradient);
    }
}

function pad2(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

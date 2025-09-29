// Types
interface PomodoroSettings {
    workTime: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
}

interface ThemeTemplate {
    name: string;
    preview: string;
    background: string;
    primaryColor: string;
    secondaryColor: string;
    workColor: string;
    breakColor: string;
}

// Theme templates with beautiful gradients like the image
const THEME_TEMPLATES: ThemeTemplate[] = [
    {
        name: "Aura Twilight",
        preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        primaryColor: "#764ba2",
        secondaryColor: "#667eea",
        workColor: "#764ba2",
        breakColor: "#667eea"
    },
    {
        name: "Shaftoli Aura yurak",
        preview: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
        primaryColor: "#ff6b9d",
        secondaryColor: "#c44569",
        workColor: "#ff6b9d",
        breakColor: "#c44569"
    },
    {
        name: "Och pushti yurak",
        preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        primaryColor: "#f5576c",
        secondaryColor: "#4834d4",
        workColor: "#f5576c",
        breakColor: "#4834d4"
    },
    {
        name: "Yonish",
        preview: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        primaryColor: "#fa709a",
        secondaryColor: "#fee140",
        workColor: "#fa709a",
        breakColor: "#fee140"
    },
    {
        name: "Lava chiroq",
        preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        primaryColor: "#00f2fe",
        secondaryColor: "#4facfe",
        workColor: "#00f2fe",
        breakColor: "#4facfe"
    },
    {
        name: "Minimalist qora",
        preview: "linear-gradient(135deg, #434343 0%, #000000 100%)",
        background: "linear-gradient(135deg, #434343 0%, #000000 100%)",
        primaryColor: "#434343",
        secondaryColor: "#ffffff",
        workColor: "#ffffff",
        breakColor: "#434343"
    },
    {
        name: "Minimalist oq",
        preview: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        primaryColor: "#333333",
        secondaryColor: "#666666",
        workColor: "#4CAF50",
        breakColor: "#FF5722"
    },
    {
        name: "Elektr binafsha",
        preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        primaryColor: "#764ba2",
        secondaryColor: "#667eea",
        workColor: "#764ba2",
        breakColor: "#667eea"
    },
    {
        name: "Okean chuqurligi",
        preview: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
        background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
        primaryColor: "#21CBF3",
        secondaryColor: "#2196F3",
        workColor: "#21CBF3",
        breakColor: "#2196F3"
    },
    {
        name: "Quyosh nuri",
        preview: "linear-gradient(135deg, #FF8A00 0%, #e52e71 100%)",
        background: "linear-gradient(135deg, #FF8A00 0%, #e52e71 100%)",
        primaryColor: "#e52e71",
        secondaryColor: "#FF8A00",
        workColor: "#e52e71",
        breakColor: "#FF8A00"
    }
];

// Helper function for padding numbers
function pad2(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}

class PomodoroTimer {
    private workTime: number;
    private shortBreak: number;
    private longBreak: number;
    private longBreakInterval: number;
    
    private currentTime: number;
    private isRunning: boolean;
    private isWorkSession: boolean;
    private cycle: number;
    private totalTime: number;
    private timer: number | null;
    
    private timerDisplay: HTMLElement | null;
    private timerStatus: HTMLElement | null;
    private startBtn: HTMLElement | null;
    private pauseBtn: HTMLElement | null;
    private cycleInfo: HTMLElement | null;
    private progressCircle: HTMLElement | null;
    
    constructor() {
        this.workTime = 25 * 60; // 25 minutes in seconds
        this.shortBreak = 10 * 60; // 10 minutes in seconds
        this.longBreak = 15 * 60; // 15 minutes in seconds
        this.longBreakInterval = 4;
        
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isWorkSession = true;
        this.cycle = 1;
        this.totalTime = 0;
        this.timer = null;
        
        // Get DOM elements
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerStatus = document.getElementById('timerStatus');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.cycleInfo = document.getElementById('cycleInfo');
        this.progressCircle = document.querySelector('.progress');
        
        this.setupProgressCircle();
        this.updateDisplay();
        this.loadSettings();
    }
    
    private setupProgressCircle(): void {
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        
        if (this.progressCircle) {
            (this.progressCircle as any).style.strokeDasharray = `${circumference}`;
            (this.progressCircle as any).style.strokeDashoffset = `${circumference}`;
        }
    }
    
    private updateProgressCircle(): void {
        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const totalTime = this.isWorkSession ? this.workTime : 
            (this.cycle % this.longBreakInterval === 0 && this.cycle > 0) ? this.longBreak : this.shortBreak;
        const progress = (totalTime - this.currentTime) / totalTime;
        const offset = circumference - progress * circumference;
        
        if (this.progressCircle) {
            (this.progressCircle as any).style.strokeDashoffset = `${offset}`;
            (this.progressCircle as any).style.stroke = this.isWorkSession ? 
                this.getCurrentTheme().workColor : this.getCurrentTheme().breakColor;
        }
    }
    
    private updateDisplay(): void {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `${pad2(minutes)}:${pad2(seconds)}`;
        }
        
        const statusText = this.isWorkSession ? 'Ish vaqti - Fokus qiling!' : 'Tanaffus - Dam oling!';
        if (this.timerStatus) {
            this.timerStatus.textContent = statusText;
            this.timerStatus.className = this.isWorkSession ? 'timer-status work-mode' : 'timer-status break-mode';
        }
        
        const totalHours = Math.floor(this.totalTime / 3600);
        const totalMinutes = Math.floor((this.totalTime % 3600) / 60);
        if (this.cycleInfo) {
            this.cycleInfo.textContent = `Sikl: ${this.cycle} | Jami: ${totalHours}s ${totalMinutes}d`;
        }
        
        this.updateProgressCircle();
        this.updateTitle();
    }
    
    private updateTitle(): void {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const timeString = `${pad2(minutes)}:${pad2(seconds)}`;
        const status = this.isWorkSession ? '🍅' : '☕';
        document.title = `${status} ${timeString} - Pomodoro Timer`;
    }
    
    private getCurrentTheme(): ThemeTemplate {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            const theme = THEME_TEMPLATES.find(t => t.name === savedTheme);
            if (theme) return theme;
        }
        return THEME_TEMPLATES[0];
    }
    
    public start(): void {
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
    
    public pause(): void {
        if (this.isRunning && this.timer !== null) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.timer = null;
            if (this.startBtn) this.startBtn.style.display = 'inline-block';
            if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        }
    }
    
    public reset(): void {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workTime : 
            (this.cycle % this.longBreakInterval === 0 && this.cycle > 0) ? this.longBreak : this.shortBreak;
        this.updateDisplay();
    }
    
    private completeSession(): void {
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
    
    public skip(): void {
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
    
    private showNotification(message: string): void {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
    
    private playNotificationSound(): void {
        const soundEnabledElement = document.getElementById('soundEnabled') as HTMLInputElement;
        if (soundEnabledElement?.checked) {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.warn('Audio context not available:', error);
            }
        }
    }
    
    public updateSettings(): void {
        const workTimeInput = document.getElementById('workTime') as HTMLInputElement;
        const shortBreakInput = document.getElementById('shortBreak') as HTMLInputElement;
        const longBreakInput = document.getElementById('longBreak') as HTMLInputElement;
        const longBreakIntervalInput = document.getElementById('longBreakInterval') as HTMLInputElement;
        
        if (workTimeInput && shortBreakInput && longBreakInput && longBreakIntervalInput) {
            this.workTime = parseInt(workTimeInput.value) * 60;
            this.shortBreak = parseInt(shortBreakInput.value) * 60;
            this.longBreak = parseInt(longBreakInput.value) * 60;
            this.longBreakInterval = parseInt(longBreakIntervalInput.value);
            
            this.reset();
            this.saveSettings();
        }
    }
    
    private saveSettings(): void {
        const settings: PomodoroSettings = {
            workTime: this.workTime / 60,
            shortBreak: this.shortBreak / 60,
            longBreak: this.longBreak / 60,
            longBreakInterval: this.longBreakInterval
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    private loadSettings(): void {
        const settingsString = localStorage.getItem('pomodoroSettings');
        if (settingsString) {
            try {
                const settings: PomodoroSettings = JSON.parse(settingsString);
                this.workTime = settings.workTime * 60;
                this.shortBreak = settings.shortBreak * 60;
                this.longBreak = settings.longBreak * 60;
                this.longBreakInterval = settings.longBreakInterval;
                
                const workTimeInput = document.getElementById('workTime') as HTMLInputElement;
                const shortBreakInput = document.getElementById('shortBreak') as HTMLInputElement;
                const longBreakInput = document.getElementById('longBreak') as HTMLInputElement;
                const longBreakIntervalInput = document.getElementById('longBreakInterval') as HTMLInputElement;
                
                if (workTimeInput) workTimeInput.value = settings.workTime.toString();
                if (shortBreakInput) shortBreakInput.value = settings.shortBreak.toString();
                if (longBreakInput) longBreakInput.value = settings.longBreak.toString();
                if (longBreakIntervalInput) longBreakIntervalInput.value = settings.longBreakInterval.toString();
                
                this.currentTime = this.workTime;
                this.updateDisplay();
            } catch (error) {
                console.warn('Failed to load settings:', error);
            }
        }
    }
    
    public get isTimerRunning(): boolean {
        return this.isRunning;
    }
}

// Theme functions
function applyTheme(theme: ThemeTemplate): void {
    document.body.style.background = theme.background;
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--work-color', theme.workColor);
    document.documentElement.style.setProperty('--break-color', theme.breakColor);
    
    localStorage.setItem('selectedTheme', theme.name);
}

function createThemeSelector(): void {
    const themeContainer = document.getElementById('themeTemplates');
    if (!themeContainer) return;
    
    themeContainer.innerHTML = '';
    
    THEME_TEMPLATES.forEach(theme => {
        const themeItem = document.createElement('div');
        themeItem.className = 'theme-item';
        themeItem.innerHTML = `
            <div class="theme-preview" style="background: ${theme.preview}">
            </div>
            <div class="theme-name">${theme.name}</div>
        `;
        
        themeItem.addEventListener('click', () => {
            applyTheme(theme);
            // Update active state
            document.querySelectorAll('.theme-item').forEach(item => item.classList.remove('active'));
            themeItem.classList.add('active');
        });
        
        themeContainer.appendChild(themeItem);
    });
    
    // Set active theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        const activeTheme = THEME_TEMPLATES.find(t => t.name === savedTheme);
        if (activeTheme) {
            applyTheme(activeTheme);
            const themeItems = themeContainer.querySelectorAll('.theme-item');
            const index = THEME_TEMPLATES.indexOf(activeTheme);
            if (themeItems[index]) {
                themeItems[index].classList.add('active');
            }
        }
    }
}

// Initialize the timer when DOM is ready
let pomodoro: PomodoroTimer | null = null;

document.addEventListener('DOMContentLoaded', function() {
    pomodoro = new PomodoroTimer();
    createThemeSelector();
    
    // Add event listeners after DOM and timer are ready
    const workTimeInput = document.getElementById('workTime');
    const shortBreakInput = document.getElementById('shortBreak');
    const longBreakInput = document.getElementById('longBreak');
    const longBreakIntervalInput = document.getElementById('longBreakInterval');
    
    if (workTimeInput) workTimeInput.addEventListener('change', () => pomodoro?.updateSettings());
    if (shortBreakInput) shortBreakInput.addEventListener('change', () => pomodoro?.updateSettings());
    if (longBreakInput) longBreakInput.addEventListener('change', () => pomodoro?.updateSettings());
    if (longBreakIntervalInput) longBreakIntervalInput.addEventListener('change', () => pomodoro?.updateSettings());
});

// Global functions for HTML onclick handlers
(window as any).toggleTimer = function(): void {
    if (pomodoro?.isTimerRunning) {
        pomodoro.pause();
    } else {
        pomodoro?.start();
    }
};

(window as any).pauseTimer = function(): void {
    pomodoro?.pause();
};

(window as any).resetTimer = function(): void {
    pomodoro?.reset();
};

(window as any).skipSession = function(): void {
    pomodoro?.skip();
};

(window as any).toggleSettings = function(): void {
    const panel = document.getElementById('settingsPanel');
    panel?.classList.toggle('open');
};

(window as any).changeBackground = function(): void {
    const fileInput = document.getElementById('backgroundImage') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e: ProgressEvent<FileReader>) {
            if (e.target?.result) {
                document.body.style.backgroundImage = `url(${e.target.result})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                localStorage.setItem('backgroundImage', e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
};

(window as any).resetBackground = function(): void {
    document.body.style.backgroundImage = '';
    const currentTheme = THEME_TEMPLATES.find(t => t.name === localStorage.getItem('selectedTheme')) || THEME_TEMPLATES[0];
    document.body.style.background = currentTheme.background;
    localStorage.removeItem('backgroundImage');
};

function loadBackground(): void {
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Keyboard shortcuts and other global event listeners
document.addEventListener('keydown', function (event: KeyboardEvent) {
    if (event.code === 'Space') {
        event.preventDefault();
        (window as any).toggleTimer();
    } else if (event.code === 'KeyR') {
        event.preventDefault();
        (window as any).resetTimer();
    } else if (event.code === 'KeyS') {
        event.preventDefault();
        (window as any).skipSession();
    }
});

// Load background on page load
loadBackground();

// Close settings when clicking outside
document.addEventListener('click', function (event: MouseEvent) {
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsToggle = document.querySelector('.settings-toggle') as HTMLElement;
    const target = event.target as HTMLElement;
    
    if (settingsPanel &&
        settingsToggle &&
        !settingsPanel.contains(target) &&
        !settingsToggle.contains(target)) {
        settingsPanel.classList.remove('open');
    }
});

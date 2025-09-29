    class PomodoroTimer {
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
            
            setupProgressCircle() {
                const radius = 140;
                const circumference = 2 * Math.PI * radius;
                this.progressCircle.style.strokeDasharray = circumference;
                this.progressCircle.style.strokeDashoffset = circumference;
            }
            
            updateProgressCircle() {
                const radius = 140;
                const circumference = 2 * Math.PI * radius;
                const totalTime = this.isWorkSession ? this.workTime : 
                    (this.cycle % this.longBreakInterval === 0 && this.cycle > 0) ? this.longBreak : this.shortBreak;
                const progress = (totalTime - this.currentTime) / totalTime;
                const offset = circumference - progress * circumference;
                this.progressCircle.style.strokeDashoffset = offset;
                
                // Change color based on session type
                this.progressCircle.style.stroke = this.isWorkSession ? '#4CAF50' : '#FF9800';
            }
            
            updateDisplay() {
                const minutes = Math.floor(this.currentTime / 60);
                const seconds = this.currentTime % 60;
                this.timerDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                const statusText = this.isWorkSession ? 'Ish vaqti - Fokus qiling!' : 'Tanaffus - Dam oling!';
                this.timerStatus.textContent = statusText;
                this.timerStatus.className = this.isWorkSession ? 'timer-status work-mode' : 'timer-status break-mode';
                
                const totalHours = Math.floor(this.totalTime / 3600);
                const totalMinutes = Math.floor((this.totalTime % 3600) / 60);
                this.cycleInfo.textContent = 
                    `Sikl: ${this.cycle} | Jami: ${totalHours}s ${totalMinutes}d`;
                
                this.updateProgressCircle();
                this.updateTitle();
            }
            
            updateTitle() {
                const minutes = Math.floor(this.currentTime / 60);
                const seconds = this.currentTime % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                const status = this.isWorkSession ? '🍅' : '☕';
                document.title = `${status} ${timeString} - Pomodoro Timer`;
            }
            
            start() {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.startBtn.style.display = 'none';
                    this.pauseBtn.style.display = 'inline-block';
                    
                    this.timer = setInterval(() => {
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
                    clearInterval(this.timer);
                    this.startBtn.style.display = 'inline-block';
                    this.pauseBtn.style.display = 'none';
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
                    // Work session completed
                    this.showNotification('Ish vaqti tugadi! Tanaffus vaqti.');
                    this.isWorkSession = false;
                    this.currentTime = (this.cycle % this.longBreakInterval === 0) ? this.longBreak : this.shortBreak;
                } else {
                    // Break completed
                    this.showNotification('Tanaffus tugadi! Ish vaqti boshlandi.');
                    this.isWorkSession = true;
                    this.cycle++;
                    this.currentTime = this.workTime;
                }
                
                this.updateDisplay();
                // Auto-start next session
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
            
            showNotification(message) {
                const notification = document.getElementById('notification');
                notification.textContent = message;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 5000);
            }
            
            playNotificationSound() {
                if (document.getElementById('soundEnabled').checked) {
                    // Create audio context for notification sound
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
                this.workTime = parseInt(document.getElementById('workTime').value) * 60;
                this.shortBreak = parseInt(document.getElementById('shortBreak').value) * 60;
                this.longBreak = parseInt(document.getElementById('longBreak').value) * 60;
                this.longBreakInterval = parseInt(document.getElementById('longBreakInterval').value);
                
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
                    
                    document.getElementById('workTime').value = parsed.workTime;
                    document.getElementById('shortBreak').value = parsed.shortBreak;
                    document.getElementById('longBreak').value = parsed.longBreak;
                    document.getElementById('longBreakInterval').value = parsed.longBreakInterval;
                    
                    this.currentTime = this.workTime;
                    this.updateDisplay();
                }
            }
        }
        
        // Initialize the timer
        const pomodoro = new PomodoroTimer();
        
        // Control functions
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
            panel.classList.toggle('open');
        }
        
        function changeBackground() {
            const fileInput = document.getElementById('backgroundImage');
            const file = fileInput.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.body.style.backgroundImage = `url(${e.target.result})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    localStorage.setItem('backgroundImage', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
        
        function resetBackground() {
            document.body.style.backgroundImage = '';
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            localStorage.removeItem('backgroundImage');
        }
        
        // Load background from localStorage
        function loadBackground() {
            const savedBackground = localStorage.getItem('backgroundImage');
            if (savedBackground) {
                document.body.style.backgroundImage = `url(${savedBackground})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        }
        
        // Event listeners for settings
        document.getElementById('workTime').addEventListener('change', () => pomodoro.updateSettings());
        document.getElementById('shortBreak').addEventListener('change', () => pomodoro.updateSettings());
        document.getElementById('longBreak').addEventListener('change', () => pomodoro.updateSettings());
        document.getElementById('longBreakInterval').addEventListener('change', () => pomodoro.updateSettings());
        
        // Keyboard shortcuts
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
        
        // Load background on page load
        loadBackground();
        
        // Close settings when clicking outside
        document.addEventListener('click', function(event) {
            const settingsPanel = document.getElementById('settingsPanel');
            const settingsToggle = document.querySelector('.settings-toggle');
            
            if (!settingsPanel.contains(event.target) && !settingsToggle.contains(event.target)) {
                settingsPanel.classList.remove('open');
            }
        });
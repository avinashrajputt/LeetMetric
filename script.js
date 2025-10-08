class LeetMetric {
    constructor() {
        this.currentUser = null;
        this.compareUser = null;
        this.recentSearches = this.getRecentSearches();
        this.currentData = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.aiChat = new AIChat();
        this.initializeEventListeners();
        this.displayRecentSearches();
        this.generateCalendar();
        this.initializeCharts();
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => this.searchUser());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUser();
        });

        // Refresh button
        document.getElementById('refresh-btn')?.addEventListener('click', () => this.refreshData());
        
        // Retry button
        document.getElementById('retry-btn')?.addEventListener('click', () => this.hideError());

        // Tab functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Recent searches
        document.getElementById('recent-list')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('recent-item')) {
                document.getElementById('user-input').value = e.target.textContent;
                this.searchUser();
            }
        });

        // Comparison functionality
        document.getElementById('compare-btn')?.addEventListener('click', () => this.compareUsers());
        document.getElementById('compare-username')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.compareUsers();
        });

        // Calendar navigation
        document.getElementById('prev-month')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => this.navigateMonth(1));

        // Export functionality
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportData(e.target.dataset.format));
        });

        // Share functionality
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.shareProfile(e.target.dataset.platform));
        });

        // Settings
        document.getElementById('dark-mode')?.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        document.getElementById('animations')?.addEventListener('change', (e) => this.toggleAnimations(e.target.checked));
        document.getElementById('notifications')?.addEventListener('change', (e) => this.toggleNotifications(e.target.checked));
    }

    async searchUser() {
        const username = document.getElementById('user-input').value.trim();
        if (!username) {
            this.showError('Please enter a username.');
            return;
        }

        this.showLoading();
        this.hideError();

        try {
            const data = await this.fetchUserData(username);
            this.currentUser = username;
            this.currentData = data;
            this.addToRecentSearches(username);
            this.displayUserData(data);
            this.displayRecentSearches();
            this.generateActivityHeatmap();
            this.generateSubmissionTimeline();
            this.generateRecommendations();
            this.updateAnalytics();
        } catch (error) {
            console.error('Error fetching user data:', error);
            this.showError('Failed to fetch user data. Please check the username and try again.');
        } finally {
            this.hideLoading();
        }
    }

    async fetchUserData(username) {
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    }

    displayUserData(data) {
        this.updateUserProfile(data);
        this.updateProgressCircles(data);
        this.updateStatsCards(data);
        this.updateLanguageStats(data);
        this.updateContestStats(data);
        this.showDashboard();
    }

    updateUserProfile(data) {
        document.getElementById('username-display').textContent = this.currentUser;
    }

    updateProgressCircles(data) {
        const difficulties = [
            { key: 'easy', color: '#22c55e', total: data.totalEasy || 0 },
            { key: 'medium', color: '#f59e0b', total: data.totalMedium || 0 },
            { key: 'hard', color: '#ef4444', total: data.totalHard || 0 }
        ];

        difficulties.forEach(({ key, color, total }) => {
            const solved = data[`${key}Solved`] || 0;
            const percentage = total > 0 ? (solved / total) * 100 : 0;
            
            // Update progress circle
            const circle = document.getElementById(`${key}-circle`);
            if (circle) {
                circle.style.setProperty('--progress-color', color);
                circle.style.setProperty('--progress-angle', `${(percentage / 100) * 360}deg`);
            }

            // Update numbers with animation
            this.animateNumber(document.getElementById(`${key}-count`), solved);
            document.getElementById(`${key}-solved`).textContent = solved;
            document.getElementById(`${key}-total`).textContent = total;

            // Update progress bar
            const progressBar = document.getElementById(`${key}-bar`);
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.width = `${percentage}%`;
                }, 100);
            }
        });
    }

    updateStatsCards(data) {
        const totalSolved = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);
        const totalQuestions = (data.totalEasy || 0) + (data.totalMedium || 0) + (data.totalHard || 0);
        const successRate = totalQuestions > 0 ? ((totalSolved / totalQuestions) * 100).toFixed(1) : 0;

        this.animateNumber(document.getElementById('total-solved'), totalSolved);
        document.getElementById('success-rate').textContent = `${successRate}%`;
        document.getElementById('ranking').textContent = data.ranking || '-';
        document.getElementById('streak').textContent = data.streak || '0';
    }

    updateLanguageStats(data) {
        const languageList = document.getElementById('language-list');
        if (!languageList) return;

        // Get user's preferred language from AI chat settings
        const preferredLang = localStorage.getItem('preferredLanguage') || 'cpp';
        
        // Create realistic language data based on user's preference
        let languages;
        
        if (preferredLang === 'cpp') {
            // C++ developer profile - C++ dominant
            languages = [
                { name: 'C++', count: Math.floor(Math.random() * 30) + 45, color: '#00599c' },
                { name: 'Python', count: Math.floor(Math.random() * 15) + 8, color: '#3776ab' },
                { name: 'Java', count: Math.floor(Math.random() * 12) + 6, color: '#ed8b00' },
                { name: 'JavaScript', count: Math.floor(Math.random() * 8) + 3, color: '#f7df1e' },
                { name: 'C', count: Math.floor(Math.random() * 10) + 5, color: '#a8b9cc' }
            ];
        } else if (preferredLang === 'python') {
            // Python developer profile
            languages = [
                { name: 'Python', count: Math.floor(Math.random() * 30) + 40, color: '#3776ab' },
                { name: 'JavaScript', count: Math.floor(Math.random() * 20) + 15, color: '#f7df1e' },
                { name: 'Java', count: Math.floor(Math.random() * 15) + 10, color: '#ed8b00' },
                { name: 'C++', count: Math.floor(Math.random() * 12) + 8, color: '#00599c' },
                { name: 'Go', count: Math.floor(Math.random() * 8) + 5, color: '#00add8' }
            ];
        } else if (preferredLang === 'java') {
            // Java developer profile
            languages = [
                { name: 'Java', count: Math.floor(Math.random() * 30) + 38, color: '#ed8b00' },
                { name: 'Python', count: Math.floor(Math.random() * 18) + 12, color: '#3776ab' },
                { name: 'C++', count: Math.floor(Math.random() * 15) + 10, color: '#00599c' },
                { name: 'JavaScript', count: Math.floor(Math.random() * 12) + 8, color: '#f7df1e' },
                { name: 'Kotlin', count: Math.floor(Math.random() * 8) + 4, color: '#7f52ff' }
            ];
        } else {
            // JavaScript developer profile
            languages = [
                { name: 'JavaScript', count: Math.floor(Math.random() * 25) + 35, color: '#f7df1e' },
                { name: 'TypeScript', count: Math.floor(Math.random() * 20) + 15, color: '#3178c6' },
                { name: 'Python', count: Math.floor(Math.random() * 15) + 10, color: '#3776ab' },
                { name: 'Java', count: Math.floor(Math.random() * 12) + 8, color: '#ed8b00' },
                { name: 'C++', count: Math.floor(Math.random() * 10) + 5, color: '#00599c' }
            ];
        }

        // Sort languages by count (descending)
        languages.sort((a, b) => b.count - a.count);

        languageList.innerHTML = languages.map((lang, index) => `
            <div class="language-item ${index === 0 ? 'primary-language' : ''}">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${lang.color};"></div>
                    <span>${lang.name}</span>
                    ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
                </div>
                <span>${lang.count} problems</span>
            </div>
        `).join('');

        // Update language chart
        this.updateLanguageChart(languages);
    }

    updateContestStats(data) {
        // Mock contest data
        const contestRating = 1500 + Math.floor(Math.random() * 500);
        const contestRank = this.getContestRank(contestRating);
        const contestsAttended = Math.floor(Math.random() * 50) + 10;

        document.getElementById('contest-rating').textContent = contestRating;
        document.getElementById('contest-rank').textContent = contestRank;
        document.getElementById('contest-attended').textContent = contestsAttended;

        // Generate contest rating chart
        this.generateContestChart();
    }

    getContestRank(rating) {
        if (rating < 1200) return 'Newbie';
        if (rating < 1400) return 'Pupil';
        if (rating < 1600) return 'Specialist';
        if (rating < 1900) return 'Expert';
        if (rating < 2100) return 'Candidate Master';
        if (rating < 2300) return 'Master';
        if (rating < 2400) return 'International Master';
        return 'Grandmaster';
    }

    generateActivityHeatmap() {
        const heatmapContainer = document.getElementById('activity-heatmap');
        if (!heatmapContainer) return;

        const days = 365;
        const today = new Date();
        let html = '';

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const level = Math.floor(Math.random() * 5);
            const submissions = level > 0 ? Math.floor(Math.random() * level * 3) : 0;
            
            html += `<div class="heatmap-day level-${level}" 
                          title="${date.toDateString()}: ${submissions} submissions"
                          data-date="${date.toISOString().split('T')[0]}"
                          data-count="${submissions}"></div>`;
        }

        heatmapContainer.innerHTML = html;
    }

    generateSubmissionTimeline() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;

        const submissions = [
            { title: 'Two Sum', result: 'accepted', time: '2 hours ago', difficulty: 'easy' },
            { title: 'Add Two Numbers', result: 'wrong', time: '5 hours ago', difficulty: 'medium' },
            { title: 'Longest Substring', result: 'accepted', time: '1 day ago', difficulty: 'medium' },
            { title: 'Median of Arrays', result: 'timeout', time: '2 days ago', difficulty: 'hard' },
            { title: 'Palindrome Number', result: 'accepted', time: '3 days ago', difficulty: 'easy' }
        ];

        timelineContainer.innerHTML = submissions.map(sub => `
            <div class="timeline-item">
                <div class="timeline-badge ${sub.result}">
                    ${sub.result === 'accepted' ? '✓' : sub.result === 'wrong' ? '✗' : '⏱'}
                </div>
                <div class="timeline-content">
                    <div class="timeline-title">${sub.title}</div>
                    <div class="timeline-meta">${sub.time} • ${sub.difficulty}</div>
                </div>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const recommendationsGrid = document.getElementById('recommendations-grid');
        if (!recommendationsGrid) return;

        const recommendations = [
            { title: 'Binary Search', difficulty: 'medium', topic: 'Algorithm', reason: 'Based on your recent activity' },
            { title: 'Dynamic Programming', difficulty: 'hard', topic: 'DP', reason: 'Trending in your skill level' },
            { title: 'Tree Traversal', difficulty: 'easy', topic: 'Data Structure', reason: 'Foundation building' },
            { title: 'Graph Algorithms', difficulty: 'hard', topic: 'Graph', reason: 'Next challenge level' }
        ];

        recommendationsGrid.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <span class="recommendation-title">${rec.title}</span>
                    <span class="difficulty-badge ${rec.difficulty}">${rec.difficulty}</span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">${rec.topic}</p>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">${rec.reason}</p>
            </div>
        `).join('');
    }

    async compareUsers() {
        const compareUsername = document.getElementById('compare-username').value.trim();
        if (!compareUsername || !this.currentUser) {
            this.showError('Please enter a username to compare with.');
            return;
        }

        try {
            const compareData = await this.fetchUserData(compareUsername);
            this.compareUser = compareUsername;
            this.displayComparison(this.currentData, compareData);
            document.getElementById('comparison-results').style.display = 'block';
        } catch (error) {
            this.showError('Failed to fetch comparison user data.');
        }
    }

    displayComparison(user1Data, user2Data) {
        document.getElementById('user1-name').textContent = this.currentUser;
        document.getElementById('user2-name').textContent = this.compareUser;

        const user1Stats = this.generateComparisonStats(user1Data);
        const user2Stats = this.generateComparisonStats(user2Data);

        document.getElementById('user1-stats').innerHTML = user1Stats;
        document.getElementById('user2-stats').innerHTML = user2Stats;

        this.generateComparisonChart(user1Data, user2Data);
    }

    generateComparisonStats(data) {
        const totalSolved = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);
        return `
            <div style="display: grid; gap: 8px; text-align: left;">
                <div>Total Solved: <strong>${totalSolved}</strong></div>
                <div>Easy: <strong>${data.easySolved || 0}</strong></div>
                <div>Medium: <strong>${data.mediumSolved || 0}</strong></div>
                <div>Hard: <strong>${data.hardSolved || 0}</strong></div>
            </div>
        `;
    }

    updateAnalytics() {
        this.updateWeeklyStats();
        this.updateTopicBreakdown();
        this.generatePatternChart();
        this.generateAccuracyChart();
    }

    updateWeeklyStats() {
        const weeklyStats = document.getElementById('weekly-stats');
        if (!weeklyStats) return;

        const weeks = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];
        const stats = weeks.map(() => Math.floor(Math.random() * 20) + 5);

        weeklyStats.innerHTML = weeks.map((week, index) => `
            <div class="week-item">
                <span>${week}</span>
                <strong>${stats[index]} problems</strong>
            </div>
        `).join('');
    }

    updateTopicBreakdown() {
        const topicBreakdown = document.getElementById('topic-breakdown');
        if (!topicBreakdown) return;

        const topics = [
            { name: 'Array', percentage: 85 },
            { name: 'String', percentage: 70 },
            { name: 'Tree', percentage: 60 },
            { name: 'Graph', percentage: 45 },
            { name: 'DP', percentage: 30 }
        ];

        topicBreakdown.innerHTML = topics.map(topic => `
            <div class="topic-item">
                <span>${topic.name}</span>
                <div class="topic-bar">
                    <div class="topic-fill" style="width: ${topic.percentage}%"></div>
                </div>
            </div>
        `).join('');
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');
        
        if (!calendarGrid || !calendarTitle) return;

        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        calendarTitle.textContent = `${months[this.currentMonth]} ${this.currentYear}`;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            html += `<div style="font-weight: 600; text-align: center; padding: 8px; color: var(--text-muted);">${day}</div>`;
        });

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const hasSubmissions = Math.random() > 0.7;
            const className = hasSubmissions ? 'calendar-day has-submissions' : 'calendar-day';
            html += `<div class="${className}">${day}</div>`;
        }

        calendarGrid.innerHTML = html;
    }

    navigateMonth(direction) {
        this.currentMonth += direction;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    // Chart generation methods
    initializeCharts() {
        // Initialize empty charts that will be populated when data is available
        this.languageChart = null;
        this.contestChart = null;
        this.patternChart = null;
        this.accuracyChart = null;
        this.comparisonChart = null;
    }

    updateLanguageChart(languages) {
        const canvas = document.getElementById('language-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Simple pie chart implementation
        const total = languages.reduce((sum, lang) => sum + lang.count, 0);
        let currentAngle = 0;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        languages.forEach(lang => {
            const sliceAngle = (lang.count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 80, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = lang.color;
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }

    generateContestChart() {
        const canvas = document.getElementById('contest-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mock contest rating data
        const ratings = [1200, 1250, 1180, 1300, 1350, 1400, 1380, 1450, 1500, 1480];
        const maxRating = Math.max(...ratings);
        const minRating = Math.min(...ratings);
        const range = maxRating - minRating;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        ratings.forEach((rating, index) => {
            const x = (index / (ratings.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - ((rating - minRating) / range) * (canvas.height - 40);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    generatePatternChart() {
        const canvas = document.getElementById('pattern-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mock solving pattern data (problems solved by day of week)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = [12, 15, 8, 20, 18, 25, 22];
        const maxValue = Math.max(...values);

        ctx.fillStyle = '#22c55e';
        
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * (canvas.height - 40);
            const barWidth = canvas.width / days.length - 10;
            const x = index * (canvas.width / days.length) + 5;
            const y = canvas.height - 20 - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    generateAccuracyChart() {
        const canvas = document.getElementById('accuracy-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mock accuracy trend data
        const accuracy = [85, 78, 82, 90, 88, 85, 92, 89, 86, 91];
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();

        accuracy.forEach((acc, index) => {
            const x = (index / (accuracy.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - ((acc - 70) / 30) * (canvas.height - 40);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    generateComparisonChart(user1Data, user2Data) {
        const canvas = document.getElementById('comparison-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const categories = ['Easy', 'Medium', 'Hard'];
        const user1Values = [user1Data.easySolved || 0, user1Data.mediumSolved || 0, user1Data.hardSolved || 0];
        const user2Values = [user2Data.easySolved || 0, user2Data.mediumSolved || 0, user2Data.hardSolved || 0];
        
        const maxValue = Math.max(...user1Values, ...user2Values);
        const barWidth = canvas.width / (categories.length * 3);

        categories.forEach((category, index) => {
            const x1 = index * (canvas.width / categories.length) + barWidth;
            const x2 = x1 + barWidth + 5;
            
            const height1 = (user1Values[index] / maxValue) * (canvas.height - 40);
            const height2 = (user2Values[index] / maxValue) * (canvas.height - 40);
            
            // User 1 bar
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x1, canvas.height - 20 - height1, barWidth, height1);
            
            // User 2 bar
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x2, canvas.height - 20 - height2, barWidth, height2);
        });
    }

    // Export functionality
    exportData(format) {
        if (!this.currentData) {
            this.showError('No data to export. Please search for a user first.');
            return;
        }

        const data = {
            username: this.currentUser,
            totalSolved: (this.currentData.easySolved || 0) + (this.currentData.mediumSolved || 0) + (this.currentData.hardSolved || 0),
            easy: this.currentData.easySolved || 0,
            medium: this.currentData.mediumSolved || 0,
            hard: this.currentData.hardSolved || 0,
            exportDate: new Date().toISOString()
        };

        switch (format) {
            case 'json':
                this.downloadJSON(data);
                break;
            case 'csv':
                this.downloadCSV(data);
                break;
            case 'pdf':
                this.generatePDF(data);
                break;
        }
    }

    downloadJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `${this.currentUser}_leetcode_stats.json`);
    }

    downloadCSV(data) {
        const csv = Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, `${this.currentUser}_leetcode_stats.csv`);
    }

    generatePDF(data) {
        // Simple PDF generation (in a real app, you'd use a library like jsPDF)
        const content = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, `${this.currentUser}_leetcode_stats.txt`);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Share functionality
    shareProfile(platform) {
        if (!this.currentUser) {
            this.showError('No profile to share. Please search for a user first.');
            return;
        }

        const url = `${window.location.origin}${window.location.pathname}?user=${this.currentUser}`;
        const text = `Check out ${this.currentUser}'s LeetCode statistics on LeetMetric!`;

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showNotification('Link copied to clipboard!');
                });
                break;
        }
    }

    // Settings functionality
    toggleDarkMode(enabled) {
        document.body.classList.toggle('light-mode', !enabled);
        localStorage.setItem('leetmetric-dark-mode', enabled);
    }

    toggleAnimations(enabled) {
        document.documentElement.style.setProperty('--transition', enabled ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none');
        localStorage.setItem('leetmetric-animations', enabled);
    }

    toggleNotifications(enabled) {
        localStorage.setItem('leetmetric-notifications', enabled);
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        // Load tab-specific content
        if (tabId === 'calendar-stats') {
            this.generateCalendar();
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('stats-dashboard').style.display = 'none';
        document.getElementById('error-message').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('stats-dashboard').style.display = 'block';
        document.getElementById('stats-dashboard').classList.add('fade-in');
        document.getElementById('error-message').style.display = 'none';
    }

    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('stats-dashboard').style.display = 'none';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    async refreshData() {
        if (this.currentUser) {
            document.getElementById('refresh-btn').style.transform = 'rotate(360deg)';
            setTimeout(() => {
                document.getElementById('refresh-btn').style.transform = '';
            }, 300);
            await this.searchUser();
        }
    }

    getRecentSearches() {
        const searches = localStorage.getItem('leetmetric-recent-searches');
        return searches ? JSON.parse(searches) : [];
    }

    addToRecentSearches(username) {
        this.recentSearches = this.recentSearches.filter(search => search !== username);
        this.recentSearches.unshift(username);
        this.recentSearches = this.recentSearches.slice(0, 5);
        localStorage.setItem('leetmetric-recent-searches', JSON.stringify(this.recentSearches));
    }

    displayRecentSearches() {
        const recentList = document.getElementById('recent-list');
        const recentContainer = document.getElementById('recent-searches');
        
        if (!recentList || this.recentSearches.length === 0) {
            if (recentContainer) recentContainer.style.display = 'none';
            return;
        }

        recentContainer.style.display = 'block';
        recentList.innerHTML = this.recentSearches.map(search => 
            `<span class="recent-item">${search}</span>`
        ).join('');
    }

    animateNumber(element, target, duration = 1000) {
        if (!element) return;
        
        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (range * progress));
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.leetMetricInstance = new LeetMetric();
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage.style.display !== 'none') {
            errorMessage.style.display = 'none';
        }
    }
});

// Add theme detection for better user experience
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', 'none');
}

// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('leetmetric-dark-mode') !== 'false';
    const animations = localStorage.getItem('leetmetric-animations') !== 'false';
    const notifications = localStorage.getItem('leetmetric-notifications') === 'true';

    document.getElementById('dark-mode').checked = darkMode;
    document.getElementById('animations').checked = animations;
    document.getElementById('notifications').checked = notifications;
});

// AI Chat Assistant Class
class AIChat {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messageHistory = [];
        this.isTyping = false;
        this.preferredLanguage = 'cpp'; // Default to C++
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.initializeChat();
        this.initializeLanguagePreference();
    }

    initializeChat() {
        // Chat toggle functionality
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-close').addEventListener('click', () => this.closeChat());
        document.getElementById('chat-minimize').addEventListener('click', () => this.minimizeChat());

        // Chat input functionality
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');

        chatInput.addEventListener('input', (e) => {
            chatSend.disabled = !e.target.value.trim();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        chatSend.addEventListener('click', () => this.sendMessage());

        // Quick questions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                this.askQuestion(question);
            });
        });

        // Suggestions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                this.askQuestion(suggestion);
            });
        });
    }

    initializeLanguagePreference() {
        // Get saved language preference or default to C++
        this.preferredLanguage = localStorage.getItem('preferredLanguage') || 'cpp';
        
        // Add language selection UI to chat
        this.addLanguageSelector();
    }

    addLanguageSelector() {
        // This will be called after the chat is opened for the first time
        setTimeout(() => {
            const chatBody = document.getElementById('chat-body');
            if (chatBody && !document.getElementById('language-selector')) {
                const languageSelector = document.createElement('div');
                languageSelector.id = 'language-selector';
                languageSelector.innerHTML = `
                    <div style="padding: 12px 20px; border-bottom: 1px solid var(--border-color); background: var(--background-light);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <i class="fas fa-code" style="color: var(--primary-color);"></i>
                            <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">Preferred Language:</span>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="lang-btn ${this.preferredLanguage === 'cpp' ? 'active' : ''}" data-lang="cpp">C++</button>
                            <button class="lang-btn ${this.preferredLanguage === 'python' ? 'active' : ''}" data-lang="python">Python</button>
                            <button class="lang-btn ${this.preferredLanguage === 'java' ? 'active' : ''}" data-lang="java">Java</button>
                            <button class="lang-btn ${this.preferredLanguage === 'javascript' ? 'active' : ''}" data-lang="javascript">JavaScript</button>
                        </div>
                    </div>
                `;
                
                // Insert after chat header
                chatBody.insertBefore(languageSelector, chatBody.firstChild);
                
                // Add event listeners for language selection
                document.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.setPreferredLanguage(e.target.dataset.lang);
                    });
                });
            }
        }, 100);
    }

    setPreferredLanguage(language) {
        this.preferredLanguage = language;
        localStorage.setItem('preferredLanguage', language);
        
        // Update UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${language}"]`).classList.add('active');
        
        // Update language stats in the main dashboard to reflect the new preference
        const leetMetricInstance = window.leetMetricInstance;
        if (leetMetricInstance) {
            leetMetricInstance.updateLanguageStats({});
        }
        
        // Show confirmation message
        this.addMessage('ai', `Great! I'll now show code examples in ${this.getLanguageName(language)}. Your skills section has been updated to reflect your ${this.getLanguageName(language)} expertise! 🎯`);
    }

    getLanguageName(lang) {
        const names = {
            'cpp': 'C++',
            'python': 'Python', 
            'java': 'Java',
            'javascript': 'JavaScript'
        };
        return names[lang] || lang;
    }

    initializeKnowledgeBase() {
        return {
            algorithms: {
                'binary search': {
                    explanation: "Binary search is an efficient algorithm for searching sorted arrays. It works by repeatedly dividing the search space in half.",
                    timeComplexity: "O(log n)",
                    spaceComplexity: "O(1)",
                    code: {
                        cpp: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`,
                        python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
                        java: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`,
                        javascript: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`
                    },
                    tips: "Always remember to check if the array is sorted first!"
                },
                'dynamic programming': {
                    explanation: "Dynamic Programming is a method for solving complex problems by breaking them down into simpler subproblems.",
                    approach: "1. Define the problem recursively\n2. Identify overlapping subproblems\n3. Store solutions to subproblems\n4. Build up solutions bottom-up",
                    examples: "Fibonacci, Longest Common Subsequence, Knapsack Problem",
                    code: {
                        cpp: `// Fibonacci with DP
int fibonacci(int n) {
    if (n <= 1) return n;
    
    vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}

// Longest Common Subsequence
int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length(), n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i-1] == text2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }
    
    return dp[m][n];
}`,
                        python: `# Fibonacci with DP
def fibonacci(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# Longest Common Subsequence
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]`
                    },
                    tips: "Start with the recursive solution, then optimize with memoization or tabulation."
                },
                'two pointers': {
                    explanation: "Two pointers technique uses two pointers moving towards each other or in the same direction to solve problems efficiently.",
                    useCases: "Sorted arrays, palindromes, sum problems, sliding window",
                    code: {
                        cpp: `// Two Sum in Sorted Array
vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) {
            return {left + 1, right + 1}; // 1-indexed
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return {};
}

// Valid Palindrome
bool isPalindrome(string s) {
    int left = 0, right = s.length() - 1;
    
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        
        if (tolower(s[left]) != tolower(s[right])) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}`,
                        python: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []`
                    }
                },
                'sliding window': {
                    explanation: "Sliding window technique is used to solve problems involving subarrays or substrings efficiently.",
                    code: {
                        cpp: `// Maximum Sum Subarray of Size K
int maxSumSubarray(vector<int>& arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    
    int maxSum = windowSum;
    for (int i = k; i < arr.size(); i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = max(maxSum, windowSum);
    }
    
    return maxSum;
}

// Longest Substring Without Repeating Characters
int lengthOfLongestSubstring(string s) {
    unordered_set<char> charSet;
    int left = 0, maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.count(s[right])) {
            charSet.erase(s[left]);
            left++;
        }
        charSet.insert(s[right]);
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`
                    }
                }
            },
            dataStructures: {
                'arrays': "Contiguous memory locations storing elements of same type. O(1) access, O(n) search.",
                'linked lists': "Linear data structure with nodes containing data and pointers. O(1) insertion/deletion at head.",
                'trees': "Hierarchical structure with nodes. Binary trees, BST, AVL, etc. Great for searching and sorting.",
                'graphs': "Networks of vertices and edges. Used for modeling relationships and pathfinding.",
                'stacks': "LIFO data structure. Perfect for function calls, expression evaluation, backtracking.",
                'queues': "FIFO data structure. Used in BFS, task scheduling, buffering.",
                'hash maps': "Key-value pairs with O(1) average access time. Great for lookups and counting."
            },
            cppSpecific: {
                'stl': {
                    explanation: "Standard Template Library provides powerful containers and algorithms",
                    containers: "vector, deque, list, set, map, unordered_set, unordered_map, stack, queue, priority_queue",
                    algorithms: "sort, binary_search, lower_bound, upper_bound, accumulate, transform",
                    code: `// Common STL Usage Examples
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <set>

// Vector operations
vector<int> v = {3, 1, 4, 1, 5};
sort(v.begin(), v.end());
auto it = lower_bound(v.begin(), v.end(), 3);

// Hash Map
unordered_map<int, int> freq;
for (int num : v) {
    freq[num]++;
}

// Set operations
set<int> uniqueElements(v.begin(), v.end());

// Priority Queue (Max Heap)
priority_queue<int> maxHeap;
for (int num : v) {
    maxHeap.push(num);
}`
                },
                'pointers': {
                    explanation: "Pointers store memory addresses and enable efficient memory management",
                    code: `// Pointer basics
int x = 10;
int* ptr = &x;  // ptr stores address of x
*ptr = 20;      // Dereference: change value at address

// Dynamic memory allocation
int* arr = new int[5];
// Use arr...
delete[] arr;  // Don't forget to deallocate

// Smart pointers (C++11+)
#include <memory>
unique_ptr<int> smartPtr = make_unique<int>(42);
shared_ptr<int> sharedPtr = make_shared<int>(100);`
                }
            },
            studyPlans: {
                beginner: [
                    "Start with Arrays and Strings (C++ vectors and string class)",
                    "Learn basic sorting algorithms (use STL sort)",
                    "Practice with easy problems daily",
                    "Focus on understanding time complexity",
                    "Master STL containers: vector, map, set"
                ],
                intermediate: [
                    "Master Trees and Graphs",
                    "Learn Dynamic Programming patterns",
                    "Practice medium difficulty problems",
                    "Study advanced STL: algorithms, iterators",
                    "Learn about pointers and memory management"
                ],
                advanced: [
                    "Advanced algorithms (segment trees, etc.)",
                    "Competitive programming techniques",
                    "Hard problems and optimization",
                    "System design and scalability",
                    "Template metaprogramming and advanced C++"
                ]
            },
            interview: {
                preparation: [
                    "Practice coding 1-2 hours daily (focus on C++)",
                    "Mock interviews with peers",
                    "Review fundamental concepts",
                    "Learn to explain your thought process",
                    "Practice on whiteboard/paper",
                    "Master STL and its time complexities"
                ],
                tips: [
                    "Always clarify the problem first",
                    "Think out loud during coding",
                    "Start with brute force, then optimize",
                    "Use appropriate STL containers",
                    "Test your code with examples",
                    "Discuss time and space complexity",
                    "Handle edge cases (null pointers, empty arrays)"
                ]
            }
        };
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatContainer = document.getElementById('ai-chat-container');
        const chatToggle = document.getElementById('chat-toggle');
        
        if (this.isOpen) {
            chatContainer.classList.add('show');
            chatToggle.style.display = 'none';
            this.showWelcomeMessage();
        } else {
            chatContainer.classList.remove('show');
            chatToggle.style.display = 'flex';
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('ai-chat-container').classList.remove('show');
        document.getElementById('chat-toggle').style.display = 'flex';
    }

    minimizeChat() {
        this.isMinimized = !this.isMinimized;
        const chatContainer = document.getElementById('ai-chat-container');
        chatContainer.classList.toggle('minimized');
        
        const minimizeIcon = document.querySelector('.chat-minimize i');
        minimizeIcon.className = this.isMinimized ? 'fas fa-plus' : 'fas fa-minus';
    }

    showWelcomeMessage() {
        if (this.messageHistory.length === 0) {
            // Show welcome message only once
            setTimeout(() => {
                this.addMessage('ai', "Hello! 👋 I'm your LeetCode AI assistant. I can help you with algorithms, data structures, problem-solving strategies, and interview preparation. What would you like to know?");
            }, 500);
        }
    }

    askQuestion(question) {
        document.getElementById('chat-input').value = question;
        this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';
        document.getElementById('chat-send').disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI processing time
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage('ai', response);
        }, 1000 + Math.random() * 2000); // 1-3 seconds
    }

    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;

        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageElement.innerHTML = `
            <div class="message-avatar ${sender}">
                <i class="fas ${sender === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.messageHistory.push({ sender, content, time });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Hide welcome section if messages exist
        if (this.messageHistory.length > 0) {
            document.querySelector('.chat-welcome').style.display = 'none';
        }
    }

    formatMessage(content) {
        // Convert code blocks
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        
        // Convert inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert newlines to <br>
        content = content.replace(/\n/g, '<br>');
        
        // Convert **bold** to <strong>
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return content;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai';
        typingElement.id = 'typing-indicator';

        typingElement.innerHTML = `
            <div class="message-avatar ai">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>AI is thinking</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Language detection in message
        if (lowerMessage.includes('c++') || lowerMessage.includes('cpp')) {
            this.setPreferredLanguage('cpp');
        } else if (lowerMessage.includes('python')) {
            this.setPreferredLanguage('python');
        } else if (lowerMessage.includes('java') && !lowerMessage.includes('javascript')) {
            this.setPreferredLanguage('java');
        } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
            this.setPreferredLanguage('javascript');
        }

        // STL and C++ specific queries
        if (lowerMessage.includes('stl') || lowerMessage.includes('standard template library')) {
            const stlInfo = this.knowledgeBase.cppSpecific.stl;
            return `**🔧 C++ Standard Template Library (STL)**

${stlInfo.explanation}

**Main Containers:** ${stlInfo.containers}
**Common Algorithms:** ${stlInfo.algorithms}

**STL Usage Examples:**
\`\`\`cpp
${stlInfo.code}
\`\`\`

**💡 Pro Tip:** STL containers and algorithms are highly optimized. Always prefer them over manual implementations!`;
        }

        if (lowerMessage.includes('pointer') && (lowerMessage.includes('c++') || this.preferredLanguage === 'cpp')) {
            const pointerInfo = this.knowledgeBase.cppSpecific.pointers;
            return `**🎯 C++ Pointers Guide**

${pointerInfo.explanation}

**Pointer Examples:**
\`\`\`cpp
${pointerInfo.code}
\`\`\`

**💡 Memory Management Tips:**
• Always initialize pointers
• Use smart pointers when possible
• Match every \`new\` with \`delete\`
• Prefer \`vector\` over raw arrays`;
        }

        // Algorithm explanations with language preference
        if (lowerMessage.includes('binary search')) {
            const info = this.knowledgeBase.algorithms['binary search'];
            const code = info.code[this.preferredLanguage] || info.code.cpp;
            const langName = this.getLanguageName(this.preferredLanguage);
            
            return `**🔍 Binary Search Algorithm**

${info.explanation}

**Time Complexity:** ${info.timeComplexity}
**Space Complexity:** ${info.spaceComplexity}

**${langName} Implementation:**
\`\`\`${this.preferredLanguage === 'cpp' ? 'cpp' : this.preferredLanguage}
${code}
\`\`\`

**💡 Pro Tip:** ${info.tips}`;
        }

        if (lowerMessage.includes('dynamic programming') || lowerMessage.includes('dp')) {
            const info = this.knowledgeBase.algorithms['dynamic programming'];
            const code = info.code[this.preferredLanguage] || info.code.cpp;
            const langName = this.getLanguageName(this.preferredLanguage);
            
            return `**🧠 Dynamic Programming (DP)**

${info.explanation}

**Approach:**
${info.approach}

**Common Examples:** ${info.examples}

**${langName} Implementation Examples:**
\`\`\`${this.preferredLanguage === 'cpp' ? 'cpp' : this.preferredLanguage}
${code}
\`\`\`

**💡 Pro Tip:** ${info.tips}`;
        }

        if (lowerMessage.includes('two pointer')) {
            const info = this.knowledgeBase.algorithms['two pointers'];
            const code = info.code[this.preferredLanguage] || info.code.cpp;
            const langName = this.getLanguageName(this.preferredLanguage);
            
            return `**👆 Two Pointers Technique**

${info.explanation}

**Common Use Cases:** ${info.useCases}

**${langName} Implementation:**
\`\`\`${this.preferredLanguage === 'cpp' ? 'cpp' : this.preferredLanguage}
${code}
\`\`\`

**💡 Perfect for:** Sorted arrays, palindromes, sum problems, and sliding window scenarios!`;
        }

        if (lowerMessage.includes('sliding window')) {
            const info = this.knowledgeBase.algorithms['sliding window'];
            const code = info.code[this.preferredLanguage] || info.code.cpp;
            const langName = this.getLanguageName(this.preferredLanguage);
            
            return `**🪟 Sliding Window Technique**

${info.explanation}

**${langName} Implementation Examples:**
\`\`\`${this.preferredLanguage === 'cpp' ? 'cpp' : this.preferredLanguage}
${code}
\`\`\`

**💡 When to Use:** Fixed/variable size subarrays, substring problems, optimization problems`;
        }

        // C++ specific study plan
        if (lowerMessage.includes('study plan') || lowerMessage.includes('how to start')) {
            const plans = this.knowledgeBase.studyPlans;
            const langSpecificTip = this.preferredLanguage === 'cpp' ? 
                "\n**🚀 C++ Specific Tips:**\n• Master STL containers and algorithms\n• Understand pointers and memory management\n• Practice with competitive programming style\n• Learn about templates and operator overloading" : "";
            
            return `**📚 LeetCode Study Plans**

**For Beginners:**
${plans.beginner.map(item => `• ${item}`).join('\n')}

**For Intermediate:**
${plans.intermediate.map(item => `• ${item}`).join('\n')}

**For Advanced:**
${plans.advanced.map(item => `• ${item}`).join('\n')}${langSpecificTip}

Which level matches your current skills?`;
        }

        // Interview preparation with C++ focus
        if (lowerMessage.includes('interview') || lowerMessage.includes('preparation')) {
            const interview = this.knowledgeBase.interview;
            const langSpecificTips = this.preferredLanguage === 'cpp' ?
                "\n**🎯 C++ Interview Specifics:**\n• Know STL complexities by heart\n• Be ready to explain pointers vs references\n• Understand memory management\n• Practice writing clean, readable C++ code" : "";
            
            return `**🎯 Coding Interview Preparation**

**Preparation Strategy:**
${interview.preparation.map(item => `• ${item}`).join('\n')}

**During the Interview:**
${interview.tips.map(item => `• ${item}`).join('\n')}${langSpecificTips}

**Remember:** Practice makes perfect! Start with easy problems and gradually increase difficulty.`;
        }

        // Language-specific help
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            const langName = this.getLanguageName(this.preferredLanguage);
            return `**🤖 I'm here to help you with ${langName} and LeetCode!**

**📚 I can assist with:**
• **Algorithm explanations** (with ${langName} code examples)
• **Data structure guidance** (${langName} implementations)
• **STL mastery** (for C++ users)
• **Problem-solving strategies** and techniques
• **Interview preparation** tips and mock questions
• **Study plans** tailored to your level
• **Code optimization** and complexity analysis
• **Debugging** assistance and best practices

**🔧 Current language preference:** ${langName}
*You can change this anytime by clicking the language buttons above!*

Just ask me anything about coding, algorithms, or LeetCode problems!`;
        }

        // C++ vector and STL questions
        if (lowerMessage.includes('vector') && this.preferredLanguage === 'cpp') {
            return `**📊 C++ Vector Guide**

**Declaration & Initialization:**
\`\`\`cpp
vector<int> v1;                    // Empty vector
vector<int> v2(5);                // Size 5, default values
vector<int> v3(5, 10);            // Size 5, all elements = 10
vector<int> v4 = {1, 2, 3, 4, 5}; // Initializer list
\`\`\`

**Common Operations:**
\`\`\`cpp
v.push_back(x);     // Add element to end - O(1)
v.pop_back();       // Remove last element - O(1)
v.size();           // Get size - O(1)
v.empty();          // Check if empty - O(1)
v[i];               // Access element - O(1)
v.at(i);            // Safe access with bounds checking
v.clear();          // Remove all elements
\`\`\`

**💡 Pro Tips:**
• Use \`reserve()\` if you know the approximate size
• Prefer \`emplace_back()\` over \`push_back()\` for objects
• Use range-based for loops: \`for(auto x : v)\``;
        }

        // Time complexity with C++ STL focus
        if (lowerMessage.includes('time complexity') || lowerMessage.includes('big o')) {
            const cppComplexities = this.preferredLanguage === 'cpp' ? 
                "\n**🔧 C++ STL Complexities:**\n• vector access: O(1), push_back: O(1) amortized\n• map: O(log n) for all operations\n• unordered_map: O(1) average, O(n) worst\n• set: O(log n) for insert/find/erase\n• sort(): O(n log n)" : "";

            return `**⏰ Time Complexity (Big O) Guide**

**Common Complexities (Best to Worst):**
• **O(1)** - Constant: Array access, hash table lookup
• **O(log n)** - Logarithmic: Binary search, balanced tree operations
• **O(n)** - Linear: Simple loops, array traversal
• **O(n log n)** - Linearithmic: Efficient sorting (merge sort, quick sort)
• **O(n²)** - Quadratic: Nested loops, bubble sort
• **O(2^n)** - Exponential: Recursive fibonacci, subset generation${cppComplexities}

**💡 Tips:**
• Always aim for the most efficient solution
• Consider trade-offs between time and space complexity
• Practice analyzing your code's complexity`;
        }

        // Default encouraging responses with language awareness
        const langName = this.getLanguageName(this.preferredLanguage);
        const encouragingResponses = [
            `Great question! I'll help you with ${langName} solutions. Could you be more specific about what aspect you'd like to focus on?`,
            `I'd love to help with ${langName}! Can you provide more details about the specific problem or concept you're working on?`,
            `That's a good topic to explore! What specific part would you like me to explain with ${langName} examples?`,
            `Excellent! I can definitely assist with ${langName} code. Could you share more context about your current understanding or where you're stuck?`,
            `I'm here to help you master that concept in ${langName}! What would be most helpful - an explanation, examples, or practice problems?`
        ];

        return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
    }
}
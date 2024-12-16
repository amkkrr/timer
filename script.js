const toggleButton = document.getElementById('toggleButton');
const timerDisplay = document.getElementById('timerDisplay');
const purposeContainer = document.getElementById('purposeContainer');
const purposeInput = document.getElementById('purposeInput');
const submitPurpose = document.getElementById('submitPurpose');
const records = document.getElementById('records');

let timerInterval = null;
let startTime = null;
let elapsedTime = 0;

// 添加多设备兼容的事件绑定
function handleToggle() {
    if (!timerInterval) {
        startTimer();
    } else {
        stopTimer();
    }
}

// 检测是否为触摸设备
const isTouchDevice = 'ontouchstart' in window;

// 根据设备类型绑定事件
if (isTouchDevice) {
    toggleButton.addEventListener('touchstart', handleToggle);
} else {
    toggleButton.addEventListener('click', handleToggle);
}


function startTimer() {
    startTime = Date.now() - elapsedTime;
    toggleButton.textContent = '停止计时';
    toggleButton.classList.add('stop');
    timerInterval = setInterval(updateTimer, 1000);
    purposeContainer.style.display = 'none';
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = Date.now() - startTime;
    toggleButton.textContent = '开始计时';
    toggleButton.classList.remove('stop');
    timerDisplay.textContent = formatTime(elapsedTime);
    purposeContainer.style.display = 'flex';
}

function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

submitPurpose.addEventListener('click', () => {
    const purpose = purposeInput.value.trim();
    if (purpose === '') {
        alert('请填写计时目的');
        return;
    }

    const endTime = new Date(startTime + elapsedTime);
    const startDate = new Date(startTime);

    const record = document.createElement('div');
    record.classList.add('record');
    record.innerHTML = `
        <div class="startTime">${startDate.toLocaleString()}</div>
        <div class="endTime">${endTime.toLocaleString()}</div>
        <div class="duration">${formatTime(elapsedTime)}</div>
        <div class="purpose">${purpose}</div>
        <div class="actions"><button class="deleteButton">删除</button></div>
    `;
    records.prepend(record);

    // 清空输入并隐藏目的输入区域
    purposeInput.value = '';
    purposeContainer.style.display = 'none';
    timerDisplay.textContent = '00:00:00';
    elapsedTime = 0;
});

// 保持计时即使页面被切换到后台
document.addEventListener('visibilitychange', () => {
    if (timerInterval) {
        updateTimer();
    }
});

// 使用事件委托处理删除按钮点击事件
records.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('deleteButton')) {
        if (confirm('确认删除该记录吗？')) {
            e.target.closest('.record').remove();
        }
    }
});

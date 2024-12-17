// script.js 完整代码
import { addRecord, getAllRecords, deleteRecord } from './db.js';

const toggleButton = document.getElementById('toggleButton');
const timerDisplay = document.getElementById('timerDisplay');
const purposeContainer = document.getElementById('purposeContainer');
const purposeInput = document.getElementById('purposeInput');
const submitPurpose = document.getElementById('submitPurpose');
const records = document.getElementById('records');

let timerInterval = null;
let startTime = null;
let elapsedTime = 0;

function handleToggle() {
    try {
        if (!timerInterval) {
            startTimer();
        } else {
            stopTimer();
        }
    } catch (error) {
        console.error("handleToggle时发生错误：", error);
    }
}

window.addEventListener('load', async () => {
    try {
        const allRecords = await getAllRecords();
        allRecords.forEach(record => {
            try {
                addRecordToUI(record);
            } catch (uiError) {
                console.error("加载记录到UI时发生错误：", uiError, "记录：", record);
            }
        });
    } catch (error) {
        console.error("加载记录时发生错误：", error);
    }
});

// 添加记录到UI
function addRecordToUI(record) {
    try {
        const recordElement = document.createElement('div');
        recordElement.classList.add('record');
        recordElement.innerHTML = `
            <div class="startTime">${new Date(record.startTime).toLocaleString()}</div>
            <div class="endTime">${new Date(record.endTime).toLocaleString()}</div>
            <div class="duration">${formatTime(record.duration)}</div>
            <div class="purpose">${record.purpose}</div>
            <div class="actions"><button class="deleteButton" data-id="${record.id}">删除</button></div>
        `;
        records.prepend(recordElement);
    } catch (error) {
        console.error("addRecordToUI时发生错误：", error, "记录：", record);
    }
}

function startTimer() {
    try {
        startTime = Date.now() - elapsedTime;
        toggleButton.textContent = '停止计时';
        toggleButton.classList.add('stop');
        timerInterval = setInterval(updateTimer, 1000);
        purposeContainer.style.display = 'none';
    } catch (error) {
        console.error("startTimer时发生错误：", error);
    }
}

function stopTimer() {
    try {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = Date.now() - startTime;
        toggleButton.textContent = '开始计时';
        toggleButton.classList.remove('stop');
        timerDisplay.textContent = formatTime(elapsedTime);
        purposeContainer.style.display = 'flex';
    } catch (error) {
        console.error("stopTimer时发生错误：", error);
    }
}

function updateTimer() {
    try {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        timerDisplay.textContent = formatTime(elapsedTime);
    } catch (error) {
        console.error("updateTimer时发生错误：", error);
    }
}

function formatTime(ms) {
    try {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error("formatTime时发生错误：", error, "ms：", ms);
        return "00:00:00";
    }
}

submitPurpose.addEventListener('click', async () => {
    try {
        const purpose = purposeInput.value.trim();
        if (purpose === '') {
            alert('请填写计时目的');
            return;
        }

        const record = {
            startTime: startTime,
            endTime: startTime + elapsedTime,
            duration: elapsedTime,
            purpose: purpose
        };

        try {
            const id = await addRecord(record);
            record.id = id; // 添加记录后获取 ID
            try {
                addRecordToUI(record);
            } catch (uiError) {
                console.error("提交计时记录后添加到UI时发生错误：", uiError, "记录：", record);
            }
        } catch (dbError) {
            console.error("提交计时记录到数据库时发生错误：", dbError, "记录：", record);
        }

        // 清空输入并重置计时器
        purposeInput.value = '';
        purposeContainer.style.display = 'none';
        timerDisplay.textContent = '00:00:00';
        elapsedTime = 0;
    } catch (error) {
        console.error("submitPurpose事件处理时发生错误：", error);
    }
});

records.addEventListener('click', async (e) => {
    try {
        if (e.target && e.target.classList.contains('deleteButton')) {
            const recordElement = e.target.closest('.record');
            const id = e.target.dataset.id;

            if (confirm('确认删除该记录吗？')) {
                try {
                    await deleteRecord(Number(id));
                    recordElement.remove();
                } catch (error) {
                    console.error("删除记录时发生错误：", error, "记录ID：", id);
                }
            }
        }
    } catch (error) {
        console.error("records点击事件处理时发生错误：", error);
    }
});

// 额外为按钮绑定添加异常捕获
toggleButton.addEventListener('click', () => {
    try {
        handleToggle();
    } catch (error) {
        console.error("点击toggleButton处理时发生错误：", error);
    }
});

document.getElementById('exportButton').addEventListener('click', async () => {
    try {
        const records = await getAllRecords();
        if (records.length === 0) {
            alert("没有数据可导出！");
            return;
        }

        const markdown = generateMarkdown(records);
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                + `-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const exported_filename = `计时数据导出-${timestamp}.md`;
        downloadMarkdown(markdown, exported_filename);
    } catch (error) {
        console.error("导出数据时发生错误：", error);
    }
});

function generateMarkdown(records) {
    try {
        const header = "| 开始时间 | 结束时间 | 用时 | 计时目的 |\n|---|---|---|---|";
        const rows = records.map(record => {
            return `| ${new Date(record.startTime).toLocaleString()} | ${new Date(record.endTime).toLocaleString()} | ${formatTime(record.duration)} | ${record.purpose || "无"} |`;
        });
        return `${header}\n${rows.join('\n')}`;
    } catch (error) {
        console.error("生成Markdown时发生错误：", error, "记录：", records);
        throw error;
    }
}

function downloadMarkdown(content, filename) {
    try {
        const blob = new Blob([content], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } catch (error) {
        console.error("下载Markdown文件时发生错误：", error);
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration);
      })
      .catch(error => {
        console.log('Service Worker 注册失败:', error);
      });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        console.log('用户接受安装');
      }
      deferredPrompt = null;
    });
  });
});

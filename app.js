function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('ja-JP', { hour12: false });
}

function calculateAgeFromBirthDate(birthDateStr) {
    const today = new Date();
    const birthDate = new Date(birthDateStr);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

function toggleTheme(isDark = null) {
    const body = document.body;
    const toggle = document.getElementById('themeToggle');

    if (isDark === null) {
        isDark = toggle.checked;
    } else {
        toggle.checked = isDark;
    }

    body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === 履歴の保存・取得・表示 ===
function getHistory() {
    const json = localStorage.getItem('userHistory');
    return json ? JSON.parse(json) : [];
}

function saveToHistory(user) {
    const history = getHistory();
    const time = getCurrentTime();

    if (!history.length || history[history.length - 1].fullName !== user.fullName) {
        history.push({ ...user, time });
    }

    const MAX_HISTORY = 10;
    const trimmed = history.slice(-MAX_HISTORY);
    localStorage.setItem('userHistory', JSON.stringify(trimmed));
}

function renderHistory() {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    history.forEach((entry, index) => {
        const li = document.createElement('li');
        const textSpan = document.createElement('span');
        textSpan.textContent = `${entry.time} - ${entry.fullName}（${entry.gender}, ${entry.age}歳）`;

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const editBtn = document.createElement('button');
        editBtn.textContent = '編集';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => showEditField(index, entry));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('本当に削除しますか？')) {
                deleteFromHistory(index);
            }
        });

        buttonGroup.appendChild(editBtn);
        buttonGroup.appendChild(deleteBtn);
        li.appendChild(textSpan);
        li.appendChild(buttonGroup);
        historyList.appendChild(li);
    });
}

function showEditField(index, entry) {
    const historyList = document.getElementById('historyList');
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.classList.add('edit-left');

    const timeLabel = document.createElement('span');
    timeLabel.textContent = entry.time;
    timeLabel.classList.add('edit-time');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = entry.fullName;
    nameInput.classList.add('edit-input');

    const genderInput = document.createElement('select');
    ['男性', '女性', 'その他'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (entry.gender === opt) option.selected = true;
        genderInput.appendChild(option);
    });
    genderInput.classList.add('edit-input');

    const birthInput = document.createElement('input');
    birthInput.type = 'date';
    birthInput.value = entry.birthDate || '';
    birthInput.classList.add('edit-input');

    left.appendChild(timeLabel);
    left.appendChild(nameInput);
    left.appendChild(genderInput);
    left.appendChild(birthInput);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newGender = genderInput.value;
        const newBirthDate = birthInput.value.trim();

        if (!newName || !newGender || !newBirthDate) {
            showMessage('※すべての項目を入力してください。', true);
            return;
        }

        const newAge = calculateAgeFromBirthDate(newBirthDate);

        const history = getHistory();
        history[index] = {
            fullName: newName,
            gender: newGender,
            birthDate: newBirthDate,
            age: newAge,
            time: entry.time
        };
        localStorage.setItem('userHistory', JSON.stringify(history));
        renderHistory();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.addEventListener('click', renderHistory);

    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);

    li.appendChild(left);
    li.appendChild(buttonGroup);
    historyList.replaceChild(li, historyList.children[index]);
}

function deleteFromHistory(index) {
    const history = getHistory();
    history.splice(index, 1);
    localStorage.setItem('userHistory', JSON.stringify(history));
    renderHistory();
}

function filterHistory(keyword) {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    const filtered = history.filter(entry =>
        entry.fullName.includes(keyword)
    );

    if (filtered.length === 0) {
        const li = document.createElement('li');
        li.textContent = '該当する履歴はありません';
        historyList.appendChild(li);
        return;
    }

    filtered.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.time} - ${entry.fullName}（${entry.gender}, ${entry.age}歳）`;
        historyList.appendChild(li);
    });
}

// メッセージ表示
let messageClearTimer = null;
function showMessage(text, isError = false) {
    const messageElement = document.getElementById('message');
    clearTimeout(messageClearTimer);
    messageElement.classList.remove('error');
    if (isError) messageElement.classList.add('error');
    messageElement.textContent = text;
    messageElement.classList.add('show');
    messageClearTimer = setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000);
}

// 入力送信処理
function handleSubmit() {
    const fullName = document.getElementById('fullName').value.trim();
    const gender = document.getElementById('gender').value;
    const birthDate = document.getElementById('birthDate').value.trim(); // ←追加

    if (!fullName || !gender || !birthDate) {
        showMessage('※すべての項目を入力してください。', true);
        return;
    }

    const age = calculateAgeFromBirthDate(birthDate); // ←年齢を計算

    const user = { fullName, gender, age, birthDate }; // ←birthDateも保存
    localStorage.setItem('savedUser', JSON.stringify(user));
    showMessage(`こんにちは、${fullName}さん！`);
    saveToHistory(user);
    renderHistory();

    document.getElementById('fullName').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('birthDate').value = '';
}

// DOM読み込み後の初期化
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    toggleTheme(savedTheme === 'dark');

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.addEventListener('change', () => toggleTheme());
    }

    renderHistory();
});

// イベント登録
document.getElementById('myButton').addEventListener('click', handleSubmit);
document.getElementById('resetButton').addEventListener('click', () => {
    if (confirm('データをリセットします。よろしいですか？')) {
        localStorage.removeItem('userHistory');
        renderHistory();
        showMessage('データをリセットしました。');
    }
});

document.getElementById('searchButton').addEventListener('click', () => {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        showMessage('※検索ワードを入力してください。', true);
        renderHistory();
        return;
    }
    filterHistory(keyword);
});

document.getElementById('clearSearchButton').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    renderHistory();

document.getElementById('fullName').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

});

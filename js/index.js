// Объявляем переменные в глобальной области видимости
let profitPerTap = 1;     // Прибыль за клик
let hourlyProfit = 3600;  // Часовая прибыль
let coinCounter = 0;      // Количество монет
let progressCounter = 1000; // Прогресс (энергия)
let maxProgress = 1000;   // Максимальный прогресс (максимальная энергия)

// Элементы для отображения значений на странице
let profitPerTapElement;
let hourlyProfitElement;
let coinCounterElement;
let progressCounterElement; // Элемент для отображения прогресса (энергии)

// Объявляем переменные для бустера "turbo"
let isTurboActive = false;
let turboBoosterEndTime = 0;
let turboIntervalId = null; // Переменная для хранения ID интервала
let turboTimerElement; // Элемент для отображения обратного отсчета

// Функция для показа модального окна из iframe
window.showModalFromIframe = function (data) {
    const modal = document.querySelector('.modal-window');
    const overlay = document.querySelector('.modal-overlay');

    // Проверяем, существует ли ID
    if (!data.id) {
        console.error('ID карточки не передан в функцию showModalFromIframe.');
        return;
    }

    const modalImage = modal.querySelector('.modal-image');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDescription = modal.querySelector('.modal-description');
    const modalProfit = modal.querySelector('.modal-profit');
    const modalPrice = modal.querySelector('.modal-price');

    // Устанавливаем данные в модальное окно
    modalImage.src = data.image || '';  // Устанавливаем источник изображения
    modalTitle.textContent = data.name || 'Название не указано';
    modalDescription.textContent = data.description || 'Описание отсутствует';
    modalProfit.textContent = `+${data.profit || 0}`;
    modalPrice.textContent = `${data.price || 0}`;

    // Сохраняем текущую карточку для обновления данных
    modal.dataset.cardId = data.id;

    // Добавляем класс для показа окна с анимацией
    modal.classList.add('show');
    modal.classList.remove('hide');
    overlay.style.display = 'block';

    console.log('Модальное окно показано с данными:', data);
};

// Функция для закрытия модального окна
function closeModal() {
    const modal = document.querySelector('.modal-window');
    const overlay = document.querySelector('.modal-overlay');

    // Добавляем класс для скрытия окна с анимацией
    modal.classList.add('hide');
    modal.classList.remove('show');

    // Скроем overlay с задержкой, чтобы завершилась анимация
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500); // Время совпадает с длительностью анимации
}

document.querySelector('.close-btn').addEventListener('click', closeModal);

// Закрытие модального окна при клике на overlay
document.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Логика для кнопки "Купить" в модальном окне
document.querySelector('.buy-btn').addEventListener('click', function () {
    const modal = document.querySelector('.modal-window');
    const cardId = modal.dataset.cardId;

    // Проверяем, что ID карточки существует
    if (!cardId) {
        console.error('Не удалось найти ID карточки в модальном окне.');
        return;
    }

    // Отправляем сообщение в iframe для обновления уровня карточки
    const iframe = document.querySelector('iframe'); // Убедитесь, что выбираете правильный iframe
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'updateCardLevel', cardId: cardId }, '*');
        console.log(`Отправлено сообщение в iframe для обновления уровня карточки с ID ${cardId}`);
    } else {
        console.error('Iframe не найден или нет доступа к его contentWindow.');
        return;
    }

    // Закрываем модальное окно после отправки сообщения
    closeModal();
});

// Функция для загрузки активных бустеров
function loadActiveBoosters() {
    const boosters = localStorage.getItem('activeBoosters');
    if (boosters) {
        const activeBoosters = JSON.parse(boosters);
        const now = Date.now();

        // Проверяем, активен ли бустер "turbo"
        for (let boosterId in activeBoosters) {
            if (activeBoosters.hasOwnProperty(boosterId)) {
                const endTime = activeBoosters[boosterId];
                if (endTime > now) {
                    if (boosterId === '4') {
                        isTurboActive = true;
                        turboBoosterEndTime = endTime;
                        startTurboBoosterTimer(); // Запускаем таймер
                        showVideoBackground(); // Показываем видеофон
                    }
                }
            }
        }
    }
}

// Функция для запуска таймера бустера "turbo"
function startTurboBoosterTimer() {
    const fixedTimeInSeconds = 30;  // Время действия бустера — 30 секунд

    // Проверяем, сохранено ли время окончания в localStorage
    const savedEndTime = localStorage.getItem('turboBoosterEndTime');
    const now = Date.now();

    if (savedEndTime && savedEndTime > now) {
        // Если время окончания сохранено и еще не истекло, продолжаем с оставшегося времени
        turboBoosterEndTime = parseInt(savedEndTime, 10);
    } else {
        // Устанавливаем новое время окончания и сохраняем в localStorage
        turboBoosterEndTime = now + fixedTimeInSeconds * 1000;
        localStorage.setItem('turboBoosterEndTime', turboBoosterEndTime);
    }

    // Показать таймер
    turboTimerElement.style.display = 'block';
    updateTurboTimerDisplay();  // Сразу обновляем отображение таймера

    // Очищаем старый интервал, если он был
    if (turboIntervalId) {
        clearInterval(turboIntervalId);
    }

    // Запускаем новый интервал для обновления таймера каждую секунду
    turboIntervalId = setInterval(() => {
        const now = Date.now();
        if (now >= turboBoosterEndTime) {
            isTurboActive = false;
            clearInterval(turboIntervalId);  // Останавливаем таймер
            localStorage.removeItem('turboBoosterEndTime');  // Удаляем время окончания из localStorage
            turboTimerElement.style.display = 'none';  // Скрываем таймер после завершения
            hideVideoBackground();  // Скрываем видео после завершения
        } else {
            updateTurboTimerDisplay();  // Обновляем оставшееся время
        }
    }, 1000);
}

// Функция для обновления обратного отсчета таймера бустера "turbo"
function updateTurboTimerDisplay() {
    const remainingTime = Math.max(0, Math.floor((turboBoosterEndTime - Date.now()) / 1000));
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    turboTimerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Функции для показа и скрытия видеофона
function showVideoBackground() {
    const videoContainer = document.getElementById('video-background-container');
    if (videoContainer) {
        videoContainer.style.display = 'block';
    }
}

function hideVideoBackground() {
    const videoContainer = document.getElementById('video-background-container');
    if (videoContainer) {
        videoContainer.style.display = 'none'; // Скрываем видео
    }
}


// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    profitPerTapElement = document.getElementById('profit-per-tap');
    hourlyProfitElement = document.getElementById('hourly-profit');
    coinCounterElement = document.getElementById('coin-counter');
    progressCounterElement = document.getElementById('progress-counter');
    turboTimerElement = document.getElementById('turbo-timer1'); // Элемент для таймера

    // Изначально скрываем таймер бустера
    turboTimerElement.style.display = 'none';

    // Устанавливаем начальные значения прибыли на экране
    profitPerTapElement.textContent = profitPerTap;
    hourlyProfitElement.textContent = hourlyProfit;
    progressCounterElement.textContent = progressCounter + '/' + maxProgress;

    // Функция для переключения вкладок
    const tabButtons = document.querySelectorAll('.interactive-tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(tabName) {
        tabPanes.forEach(pane => {
            pane.style.display = (pane.id === tabName) ? 'block' : 'none';
        });

        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);  
        });
    });

    switchTab('home');

    const boosterButton = document.querySelector('.booster-button-container');
    boosterButton.addEventListener('click', function () {
        window.location.href = './html/booster.html';
    });

    function saveState() {
        localStorage.setItem('coinCounter', coinCounter);
        localStorage.setItem('progressCounter', progressCounter);
        localStorage.setItem('maxProgress', maxProgress);
        localStorage.setItem('hourlyProfit', hourlyProfit);
        localStorage.setItem('profitPerTap', profitPerTap);
    }

    function loadState() {
        const savedCoins = localStorage.getItem('coinCounter');
        const savedProgress = localStorage.getItem('progressCounter');
        const savedMaxProgress = localStorage.getItem('maxProgress');
        const savedHourlyProfit = localStorage.getItem('hourlyProfit');
        const savedProfitPerTap = localStorage.getItem('profitPerTap');

        if (savedCoins !== null) {
            coinCounter = parseInt(savedCoins, 10);
            coinCounterElement.textContent = coinCounter;
        }

        if (savedProgress !== null) {
            progressCounter = parseInt(savedProgress, 10);
            progressCounterElement.textContent = `${progressCounter}/${maxProgress}`;
        }

        if (savedMaxProgress !== null) {
            maxProgress = parseInt(savedMaxProgress, 10);
        }

        if (savedHourlyProfit !== null) {
            hourlyProfit = parseInt(savedHourlyProfit, 10);
            hourlyProfitElement.textContent = hourlyProfit;
        }

        if (savedProfitPerTap !== null) {
            profitPerTap = parseInt(savedProfitPerTap, 10);
            profitPerTapElement.textContent = profitPerTap;
        }
    }

    loadState();
    loadActiveBoosters();

    function startProgressRecovery() {
        const recoveryRate = maxProgress * 0.004;

        setInterval(() => {
            if (progressCounter < maxProgress) {
                progressCounter += recoveryRate;
                if (progressCounter > maxProgress) {
                    progressCounter = maxProgress;
                }

                progressCounterElement.textContent = Math.floor(progressCounter) + '/' + maxProgress;
                localStorage.setItem('progressCounter', Math.floor(progressCounter));
            }
        }, 1000);
    }

    startProgressRecovery();

    function startPassiveIncome() {
        setInterval(() => {
            const incomePerSecond = hourlyProfit / 3600;
            coinCounter = parseInt(localStorage.getItem('coinCounter'), 10) || 0;

            coinCounter += incomePerSecond;

            localStorage.setItem('coinCounter', coinCounter);
            coinCounterElement.textContent = Math.floor(coinCounter);
        }, 1000);
    }

    startPassiveIncome();

    const clickableImage = document.getElementById('interactive-clickable-image');

    if (clickableImage) {
        clickableImage.addEventListener('click', (event) => {
            if (progressCounter >= profitPerTap || isTurboActive) { // Тратим энергию на каждый клик
                coinCounter = parseInt(localStorage.getItem('coinCounter'), 10) || 0;

                // Прибыль за клик
                let coinsToAdd = profitPerTap;

                if (isTurboActive) {
                    coinsToAdd *= 2; // Удваиваем прибыль за клик, если активен бустер
                }

                coinCounter += coinsToAdd;

                // Энергия уменьшается всегда, если бустер не активен
                if (!isTurboActive) {
                    progressCounter -= profitPerTap;
                }

                // Обновляем элементы на странице
                coinCounterElement.textContent = Math.floor(coinCounter);
                progressCounterElement.textContent = Math.floor(progressCounter) + '/' + maxProgress;

                // Сохраняем новые значения в localStorage
                localStorage.setItem('coinCounter', coinCounter);
                localStorage.setItem('progressCounter', progressCounter);

                // Анимация клика
                const rect = clickableImage.getBoundingClientRect();
                const offsetX = event.clientX - rect.left - rect.width / 2;
                const offsetY = event.clientY - rect.top - rect.height / 2;

                const maxAngle = 15;
                const xAngle = -(offsetY / (rect.height / 2)) * maxAngle;
                const yAngle = (offsetX / (rect.width / 2)) * maxAngle;

                clickableImage.style.transform = `rotateX(${xAngle}deg) rotateY(${yAngle}deg)`;

                setTimeout(() => {
                    clickableImage.style.transform = 'rotateX(0deg) rotateY(0deg)';
                }, 200);
            } else {
                alert("Недостаточно энергии для выполнения действия");
            }
        });
    }

    window.addEventListener('message', function (event) {

            if (isTurboActive) {
        startTurboBoosterTimer();
    }
        const data = event.data;

        if (data && data.action === 'updateHourlyProfit') {
            hourlyProfit = data.newHourlyProfit;
            if (hourlyProfitElement) {
                hourlyProfitElement.textContent = hourlyProfit;
            }
            localStorage.setItem('hourlyProfit', hourlyProfit);
        }

        if (data && data.action === 'coinCounterUpdated') {
            coinCounter = data.coinCounter;
            coinCounterElement.textContent = coinCounter;
        }
    });

    window.addEventListener('storage', function (event) {
        if (event.key === 'coinCounter') {
            coinCounter = parseInt(event.newValue, 10) || 0;
            coinCounterElement.textContent = coinCounter;
        }

        if (event.key === 'progressCounter') {
            progressCounter = parseInt(event.newValue, 10) || 0;
            progressCounterElement.textContent = Math.floor(progressCounter) + '/' + maxProgress;
        }

        if (event.key === 'maxProgress') {
            maxProgress = parseInt(event.newValue, 10) || 0;
            progressCounterElement.textContent = Math.floor(progressCounter) + '/' + maxProgress;
        }

        if (event.key === 'activeBoosters') {
            loadActiveBoosters();
        }
    });
});

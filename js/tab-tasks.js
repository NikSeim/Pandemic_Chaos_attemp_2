document.addEventListener('DOMContentLoaded', () => {
    initializeTaskEventHandlers(); // Инициализация обработчиков событий при загрузке вкладки
    checkForStreakReset(); // Проверка сброса стрика при открытии приложения
});

function initializeTaskEventHandlers() {
    const tasks = document.querySelectorAll('.task-box');
    const modal = document.getElementById('tasks-modal');
    const closeModal = document.querySelector('.tasks-close');
    const claimButtonModal = document.querySelector('.tasks-claim-button-modal');
    const overlay = document.getElementById('tasks-overlay');
    const resetButton = document.getElementById('reset-days');
    const messageBox = document.getElementById('tasks-message-box');
    const allRewardsClaimed = document.getElementById('tasks-all-rewards-claimed');
    let claimTimeout;

    tasks.forEach(task => {
        task.addEventListener('click', showModal);
    });

    closeModal.addEventListener('click', closeModalWindow);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModalWindow();
        }
    });

    claimButtonModal.addEventListener('click', () => {
        const claimedDayIndex = parseInt(localStorage.getItem('claimedDayIndex')) || 0;
        const currentDayBox = document.querySelector(`.day-box:nth-child(${claimedDayIndex + 1})`);

        if (currentDayBox && !claimButtonModal.disabled) {
            currentDayBox.classList.remove('next');
            currentDayBox.classList.add('disabled');

            localStorage.setItem('claimedDayIndex', claimedDayIndex + 1);
            localStorage.setItem('lastClaimTime', Date.now());

            clearTimeout(claimTimeout);

            generateDays();
            checkClaimButtonState();
        }
    });

    resetButton.addEventListener('click', () => {
        resetStreak();
        messageBox.innerHTML = "Прогресс сброшен на первый день.";
    });

    function generateDays() {
        const daysContainer = document.getElementById('tasks-days-container');
        daysContainer.innerHTML = '';
        messageBox.innerHTML = '';
        allRewardsClaimed.style.display = 'none';

        const claimedDayIndex = parseInt(localStorage.getItem('claimedDayIndex')) || 0;

        for (let i = 1; i <= 12; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = `${i} day`;

            const coinImg = document.createElement('img');
            coinImg.src = "https://github.com/NikSeim/images/raw/main/tokendisgn.webp";
            coinImg.alt = "Coin";

            const dayCoins = document.createElement('div');
            dayCoins.classList.add('day-coins');
            dayCoins.textContent = `+${i * 1000} coins`;

            dayBox.appendChild(dayNumber);
            dayBox.appendChild(coinImg);
            dayBox.appendChild(dayCoins);

            if (i <= claimedDayIndex) {
                dayBox.classList.add('disabled');
            } else if (i === claimedDayIndex + 1) {
                dayBox.classList.add('next');
            }

            daysContainer.appendChild(dayBox);
        }

        checkClaimButtonState();
    }

    function checkClaimButtonState() {
        const claimedDayIndex = parseInt(localStorage.getItem('claimedDayIndex')) || 0;
        const lastClaimTime = parseInt(localStorage.getItem('lastClaimTime')) || 0;
        const currentTime = Date.now();
        const dayInMillis = 20000;
        const timeSinceLastClaim = currentTime - lastClaimTime;

        if (claimedDayIndex >= 12) {
            claimButtonModal.style.display = 'none';
            allRewardsClaimed.style.display = 'block';
            return;
        }

        if (timeSinceLastClaim >= 10 * 1000) {
            activateNextDay();
            claimButtonModal.classList.remove('disabled');
            claimButtonModal.disabled = false;
            claimButtonModal.textContent = "Claim";

            const timeLeftForReset = dayInMillis - timeSinceLastClaim;
            clearTimeout(claimTimeout);
            claimTimeout = setTimeout(() => {
                if (!claimButtonModal.disabled) {
                    resetStreak();
                    messageBox.innerHTML = "Ваш стрик был сброшен из-за отсутствия активности.";
                }
            }, timeLeftForReset);
        } else {
            claimButtonModal.classList.add('disabled');
            claimButtonModal.disabled = true;
            claimButtonModal.textContent = "Come back later";
            const timeLeft = 10 * 1000 - timeSinceLastClaim;
            setTimeout(checkClaimButtonState, timeLeft);
        }
    }

    function activateNextDay() {
        const claimedDayIndex = parseInt(localStorage.getItem('claimedDayIndex')) || 0;
        const nextDayBox = document.querySelector(`.day-box:nth-child(${claimedDayIndex + 1})`);

        if (nextDayBox) {
            nextDayBox.classList.remove('next');
            nextDayBox.classList.add('active');
        }
    }

    function showModal() {
        generateDays();
        overlay.style.display = 'block';
        modal.classList.remove('slide-down');
        modal.classList.add('slide-up');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    function closeModalWindow() {
        modal.classList.remove('slide-up');
        modal.classList.add('slide-down');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            overlay.style.display = 'none';
            modal.style.display = 'none';
        }, 300);
    }

    function resetStreak() {
        localStorage.setItem('claimedDayIndex', 0);
        localStorage.removeItem('lastClaimTime');
        generateDays();
    }

    function checkForStreakReset() {
        const lastClaimTime = parseInt(localStorage.getItem('lastClaimTime')) || 0;
        const currentTime = Date.now();

        // Количество миллисекунд в одном дне
        const dayInMillis = 10000;

        // Количество прошедших дней с последнего посещения
        const daysSinceLastClaim = Math.floor((currentTime - lastClaimTime) / dayInMillis);

        if (daysSinceLastClaim >= 32) {
            // Сброс стрика если прошло больше 32 дней
            resetStreak();
            messageBox.innerHTML = "Ваш стрик был сброшен, так как вы не заходили более 32 дней.";
        } else if (daysSinceLastClaim > 1) {
            // Продолжить стрик, если прошло менее 32 дней
            messageBox.innerHTML = `Прошло ${daysSinceLastClaim} дня(ей) с вашего последнего посещения. Ваш стрик продолжается.`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // Запрещаем вызов контекстного меню
        });

        img.setAttribute('draggable', false);  // Отключаем перетаскивание изображения
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Отключаем контекстное меню при нажатии правой кнопкой мыши
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // Блокируем контекстное меню
        });

        // Отключаем перетаскивание изображения
        img.setAttribute('draggable', false);

        // Отключаем долгие нажатия на мобильных устройствах
        img.addEventListener('touchstart', (e) => {
            let timeoutId = setTimeout(() => {
                e.preventDefault();  // Блокируем вызов контекстного меню при долгом нажатии
            }, 300);  // 300 мс — время долгого нажатия, можно настроить

            // Сбрасываем таймер, если палец убран раньше
            img.addEventListener('touchend', () => clearTimeout(timeoutId));
            img.addEventListener('touchmove', () => clearTimeout(timeoutId));
        });
    });
});

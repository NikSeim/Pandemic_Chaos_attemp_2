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


document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copy-button');
    const copyNotification = document.getElementById('copy-notification');
    const friendsList = document.getElementById('friends-list');

    // Логика копирования реферальной ссылки
    copyButton.addEventListener('click', () => {
        const referralLink = 'https://t.me/ldfbhuibf_bot?start=referral_code'; // Подставьте динамический реферальный код
        navigator.clipboard.writeText(referralLink).then(() => {
            // Показываем уведомление о копировании
            copyNotification.classList.add('show');
            setTimeout(() => {
                copyNotification.classList.remove('show');
            }, 2000); // Скрываем через 2 секунды
        }).catch(err => {
            console.error('Ошибка при копировании: ', err);
        });
    });

    // Пример данных, которые могут приходить с сервера (замените на реальный запрос)
    const invitedFriends = [
        { name: 'User1', date: '2024-10-01', bonus: 5000 },
        { name: 'User2', date: '2024-10-05', bonus: 5000 }
    ];

    // Отображаем список друзей
    invitedFriends.forEach(friend => {
        const li = document.createElement('li');
        li.textContent = `${friend.name} - Присоединился: ${friend.date}, Бонус: ${friend.bonus}`;
        friendsList.appendChild(li);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const referralListElement = document.getElementById('referral-list');
    const collectRewardButton = document.getElementById('collect-reward-button');
    
    // Инициализация WebApp для получения данных о пользователе
    window.Telegram.WebApp.ready();

    const userId = getTelegramUserId(); // Получаем user_id из WebApp
    
    // Получаем список рефералов и их вознаграждения
    function loadReferrals() {
        fetch(`/get_referrals?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                referralListElement.innerHTML = ''; // Очищаем список
                data.referrals.forEach(referral => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Реферал: ${referral.user_id}, Награда: ${referral.reward_pending} монет`;
                    referralListElement.appendChild(listItem);
                });
            })
            .catch(error => console.error('Ошибка при загрузке рефералов:', error));
    }

    // Обрабатываем нажатие на кнопку "Забрать вознаграждение"
    collectRewardButton.addEventListener('click', () => {
        fetch('/collect_reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadReferrals(); // Обновляем список рефералов
        })
        .catch(error => console.error('Ошибка при сборе вознаграждения:', error));
    });

    // Инициализируем загрузку списка рефералов при загрузке страницы
    loadReferrals();
});

function getTelegramUserId() {
    // Используем данные из WebApp для получения информации о пользователе
    const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
    
    if (initDataUnsafe && initDataUnsafe.user && initDataUnsafe.user.id) {
        return initDataUnsafe.user.id; // Возвращаем user_id пользователя из Телеграма
    } else {
        console.error("Не удалось получить данные пользователя из Telegram WebApp");
        return null; // Обрабатываем случай, если данные пользователя не найдены
    }
}




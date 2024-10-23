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
    const copyButton = document.getElementById('copy-button');
    const copyNotification = document.getElementById('copy-notification');
    const friendsList = document.getElementById('friends-list');
    const referralLinkElement = document.getElementById('referral-link');

    // Получение реферального кода с сервера
    const userId = getUserId();  // Получите ID пользователя (замените на реальный метод)
    let referralCode = '';

    // Запрос на получение реферального кода с сервера
    fetch(`/get_referral_code?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            referralCode = data.referral_code;
            const referralLink = `https://t.me/ldfbhuibf_bot/?ref=${referralCode}`;
            referralLinkElement.textContent = referralLink;
        });

    // Копирование ссылки в буфер обмена
    copyButton.addEventListener('click', () => {
        const referralLink = referralLinkElement.textContent;
        navigator.clipboard.writeText(referralLink).then(() => {
            copyNotification.classList.add('show');
            setTimeout(() => {
                copyNotification.classList.remove('show');
            }, 2000);
        }).catch(err => {
            console.error('Ошибка при копировании: ', err);
        });
    });

    // Получение списка приглашённых друзей с сервера
    fetch('/get_invited_friends?user_id=' + userId)
        .then(response => response.json())
        .then(data => {
            data.invited_friends.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = `${friend.name} - Присоединился: ${friend.date}, Бонус: ${friend.bonus}`;
                friendsList.appendChild(li);
            });
        });
});


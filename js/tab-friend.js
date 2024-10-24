document.addEventListener('DOMContentLoaded', () => {
    // Получаем необходимые элементы
    const copyButton = document.getElementById('copy-button');
    const copyNotification = document.getElementById('copy-notification');
    const referralLinkElement = document.getElementById('referral-link');
    const friendsList = document.getElementById('friends-list');
    const referralListElement = document.getElementById('referral-list');
    const collectRewardButton = document.getElementById('collect-reward-button');
    const userId = getTelegramUserId();  // Получаем user_id через WebApp

    // Инициализация WebApp для Телеграма
    window.Telegram.WebApp.ready();

    // Логика копирования реферальной ссылки
    function loadReferralLink() {
        fetch(`/get_referral_code?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                const referralCode = data.referral_code;  // Получаем реферальный код с сервера
                const referralLink = `https://t.me/ldfbhuibf_bot?start=${referralCode}`;  // Динамически создаем ссылку
                referralLinkElement.textContent = referralLink;  // Показываем ссылку в элементе на странице
                referralLinkElement.href = referralLink;  // Устанавливаем ссылку для клика

                // Копирование ссылки при нажатии на кнопку
                copyButton.addEventListener('click', () => {
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
            })
            .catch(error => console.error('Ошибка при получении реферального кода:', error));
    }

    // Функция для загрузки списка друзей с сервера
    function loadFriendsList() {
        fetch(`/get_referrals?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                friendsList.innerHTML = '';  // Очищаем список перед обновлением
                data.referrals.forEach(friend => {
                    const li = document.createElement('li');
                    li.textContent = `${friend.user_id} - Присоединился: ${friend.date}, Бонус: ${friend.reward_pending} монет`;
                    friendsList.appendChild(li);
                });
            })
            .catch(error => console.error('Ошибка при загрузке списка друзей:', error));
    }

    // Функция для загрузки рефералов и их вознаграждений
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
    collectRewardButton?.addEventListener('click', () => {
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

    // Отключение контекстного меню и перетаскивания изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // Запрещаем вызов контекстного меню
        });
        img.setAttribute('draggable', false);  // Отключаем перетаскивание изображения

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

    // Инициализируем загрузку реферальной ссылки, списка друзей и рефералов
    loadReferralLink();
    loadFriendsList();
    loadReferrals();
});

// Получаем user_id через WebApp Телеграма
function getTelegramUserId() {
    const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
    
    if (initDataUnsafe && initDataUnsafe.user && initDataUnsafe.user.id) {
        return initDataUnsafe.user.id; // Возвращаем user_id пользователя из Телеграма
    } else {
        console.error("Не удалось получить данные пользователя из Telegram WebApp");
        return null;
    }
}

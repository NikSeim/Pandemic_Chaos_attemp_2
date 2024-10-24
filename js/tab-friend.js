document.addEventListener('DOMContentLoaded', () => {
    // Получаем необходимые элементы
    const copyButton = document.getElementById('copy-button');
    const copyNotification = document.getElementById('copy-notification');
    const referralLinkElement = document.getElementById('referral-link');
    const referralLinkDisplay = document.getElementById('referral-link-display'); // Новый элемент для отображения ссылки
    const friendsList = document.getElementById('friends-list');
    const referralListElement = document.getElementById('referral-list');
    const collectRewardButton = document.getElementById('collect-reward-button');
    const userId = getTelegramUserId();  // Получаем user_id через WebApp

    // Инициализация WebApp для Телеграма
    window.Telegram.WebApp.ready();

    // Логика копирования реферальной ссылки и вывода её под кнопкой и в консоль
    function loadReferralLink() {
        fetch(`/get_referral_code?user_id=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении реферального кода: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const referralCode = data.referral_code;  // Получаем реферальный код с сервера
                const referralLink = `https://t.me/ldfbhuibf_bot?start=${referralCode}`;  // Динамически создаем ссылку
                
                // Показываем ссылку в элементе на странице
                referralLinkElement.textContent = referralLink;
                referralLinkElement.href = referralLink;  // Устанавливаем ссылку для клика

                // Выводим ссылку под кнопкой
                referralLinkDisplay.textContent = `Ваша реферальная ссылка: ${referralLink}`;

                // Выводим ссылку в консоль
                console.log(`Реферальная ссылка: ${referralLink}`);
            })
            .catch(error => console.error(error));
    }

    // Функция для загрузки списка друзей с сервера
    function loadFriendsList() {
        fetch(`/get_referrals?user_id=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке списка друзей: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                friendsList.innerHTML = '';  // Очищаем список перед обновлением
                data.referrals.forEach(friend => {
                    const li = document.createElement('li');
                    li.textContent = `${friend.user_id} - Присоединился: ${friend.date}, Бонус: ${friend.reward_pending} монет`;
                    friendsList.appendChild(li);
                });
            })
            .catch(error => console.error(error));
    }

    // Функция для загрузки рефералов и их вознаграждений
    function loadReferrals() {
        fetch(`/get_referrals?user_id=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке рефералов: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                referralListElement.innerHTML = ''; // Очищаем список
                data.referrals.forEach(referral => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Реферал: ${referral.user_id}, Награда: ${referral.reward_pending} монет`;
                    referralListElement.appendChild(listItem);
                });
            })
            .catch(error => console.error(error));
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

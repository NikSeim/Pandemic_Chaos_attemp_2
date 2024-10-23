document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.section');
    const coinCounterElement = document.getElementById('coin-counter');

    // Функция для обновления количества монет из localStorage
    function updateCoins() {
        const storedCoins = localStorage.getItem('coinCounter');
        if (storedCoins !== null) {
            coinCounterElement.textContent = Math.floor(storedCoins);
        } else {
            console.log('Монеты не найдены в localStorage. Устанавливаем начальные 0.');
            coinCounterElement.textContent = '0';
        }
    }

    // Проверяем наличие элемента
    if (coinCounterElement) {
        // Обновляем количество монет сразу после загрузки
        updateCoins();

        // Обновляем количество монет каждую секунду
        setInterval(updateCoins, 1000);
    } else {
        console.error('Элемент с id="coin-counter" не найден!');
    }

    // Логика переключения вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем класс 'active' у всех кнопок
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Скрываем все секции
            sections.forEach(section => section.style.display = 'none');

            // Добавляем класс 'active' к нажатой кнопке
            this.classList.add('active');

            // Получаем атрибут data-section для определения, какую секцию показать
            const sectionId = this.getAttribute('data-section');
            const activeSection = document.getElementById(sectionId);

            // Отображаем соответствующую секцию
            if (activeSection) {
                activeSection.style.display = 'block';
            }
        });
    });

    // Обработка кликов по карточкам
    const rectangles = document.querySelectorAll('.rect-card');

    if (rectangles.length > 0) {
        rectangles.forEach(rect => {
            const price = rect.getAttribute('data-price');
            const priceValue = parseInt(price, 10) || 0;
            const priceElement = rect.querySelector('.rect-info.price');
            const lvl = parseInt(rect.getAttribute('data-lvl'), 10);
            const profit = rect.getAttribute('data-profit');
            const profitNumberElement = rect.querySelector('.profit-number');
            const lvlElement = rect.querySelector('.rect-info.lvl'); // Элемент для отображения уровня

            if (priceElement) {
                priceElement.textContent = priceValue;
            }

            // Обновляем значение profit-number из data-profit
            if (profitNumberElement) {
                profitNumberElement.textContent = profit;
            }

            // Устанавливаем отображаемый уровень в соответствии с data-lvl
            if (lvlElement) {
                lvlElement.textContent = `LvL ${lvl}`;
            }

            // Определяем статус блокировки карточки
            if (shouldUnlockCard(rect)) {
                unlockCard(rect);
            } else {
                lockCard(rect, rect.getAttribute('data-lock'));
            }

            // Назначаем обработчик для всех карточек
            setupCardClickHandler(rect);

            // Подключаем наблюдатель изменений для `data-lock` и `data-lvl`
            observeLockChanges(rect);
        });
    } else {
        console.error('Не найдено карточек для обработки кликов.');
    }

    // Функция для определения, должна ли карточка быть разблокирована
    function shouldUnlockCard(rect) {
        const lockStatus = rect.getAttribute('data-lock');
        if (!lockStatus || lockStatus === 'unlock') {
            // Нет условий для блокировки, карточка разблокирована
            return true;
        }

        // Проверяем, соответствует ли формат 'CardName lvl N'
        const lockConditionMatch = lockStatus.match(/^(.+?) lvl (\d+)$/);
        if (lockConditionMatch) {
            const requiredCardName = lockConditionMatch[1].trim();
            const requiredLevel = parseInt(lockConditionMatch[2], 10);

            // Находим требуемую карточку по имени
            const requiredCard = document.querySelector(`.rect-card[data-name="${requiredCardName}"]`);
            if (requiredCard) {
                const requiredCardLevel = parseInt(requiredCard.getAttribute('data-lvl'), 10) || 0;
                return requiredCardLevel >= requiredLevel;
            } else {
                console.error(`Требуемая карточка "${requiredCardName}" не найдена.`);
                return false;
            }
        } else {
            // Если формат lockStatus не соответствует ожиданиям, считаем карточку заблокированной
            return false;
        }
    }

    // Функция для блокировки карточки
    function lockCard(rect, lockStatus) {
        // Проверяем, не заблокирована ли карточка уже
        if (rect.classList.contains('locked')) {
            return;
        }
        rect.classList.add('locked');

        const overlayImage = '../Images/chain_lock.jpg';
        const overlayImageElement = document.createElement('div');
        overlayImageElement.classList.add('overlay-lock');
        overlayImageElement.style.backgroundImage = `url(${overlayImage})`;
        overlayImageElement.style.backgroundSize = 'contain'; // Изображение замка будет масштабироваться
        overlayImageElement.style.backgroundRepeat = 'no-repeat';
        overlayImageElement.style.position = 'absolute';
        overlayImageElement.style.top = '50%';
        overlayImageElement.style.left = '50%';
        overlayImageElement.style.width = '50%'; // Размер замка относительно контейнера
        overlayImageElement.style.height = '50%';
        overlayImageElement.style.transform = 'translate(-50%, -60%)'; // Центрирование по осям X и Y
        overlayImageElement.style.zIndex = '10';
        overlayImageElement.style.pointerEvents = 'none';

        // Полупрозрачный слой для затемнения изображения
        const darkOverlay = document.createElement('div');
        darkOverlay.classList.add('dark-overlay');
        darkOverlay.style.position = 'absolute';
        darkOverlay.style.top = '0';
        darkOverlay.style.left = '0';
        darkOverlay.style.width = '100%';
        darkOverlay.style.height = '100%';
        darkOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Полупрозрачный черный цвет
        darkOverlay.style.zIndex = '5';
        darkOverlay.style.pointerEvents = 'none';

        // Изменяем текст под картинкой, используя значение атрибута data-lock
        const lockText = lockStatus || 'Недоступно'; // Берем значение data-lock или 'Недоступно' по умолчанию
        const textElement = rect.querySelector('.rect-info.price'); // Ищем элемент с классом .rect-info.price
        if (textElement) {
            textElement.textContent = lockText; // Устанавливаем текст из data-lock
        }

        // Скрываем иконку справа от текста, если она есть
        const imageElement = rect.querySelector('#imageRight');
        if (imageElement) {
            imageElement.style.visibility = 'hidden'; // Скрываем иконку
        }

        // Затемняем основное изображение
        const rectImage = rect.querySelector('.rect-image');
        if (rectImage) {
            rectImage.style.filter = 'brightness(50%)'; // Уменьшаем яркость для затемнения
        }

        // Меняем цвет заднего фона карточки
        rect.style.backgroundColor = '#0f0f0f'; // Устанавливаем темный цвет фона

        // Устанавливаем относительное позиционирование для родителя и добавляем элементы
        rect.style.position = 'relative';
        rect.appendChild(darkOverlay);
        rect.appendChild(overlayImageElement);

        // Блокируем клики на карточке
        rect.style.pointerEvents = 'none';
    }

    // Функция для разблокировки карточки
    function unlockCard(rect) {
        rect.style.pointerEvents = 'auto'; // Разрешаем взаимодействие
        rect.style.backgroundColor = ''; // Убираем затемнение фона

        // Убираем затемнение и замок, если они были добавлены ранее
        const existingOverlay = rect.querySelector('.overlay-lock');
        if (existingOverlay) {
            rect.removeChild(existingOverlay);
        }
        const existingDarkOverlay = rect.querySelector('.dark-overlay');
        if (existingDarkOverlay) {
            rect.removeChild(existingDarkOverlay);
        }
        const rectImage = rect.querySelector('.rect-image');
        if (rectImage) {
            rectImage.style.filter = ''; // Убираем затемнение изображения
        }

        // Восстанавливаем цену, если она есть
        const priceElement = rect.querySelector('.rect-info.price');
        const priceValue = rect.getAttribute('data-price');
        if (priceElement && priceValue) {
            priceElement.textContent = priceValue;
        }

        // Отображаем иконку справа, если она есть
        const imageElement = rect.querySelector('#imageRight');
        if (imageElement) {
            imageElement.style.visibility = 'visible';
        }

        rect.classList.remove('locked');
    }

    // Функция для установки обработчика на карточку
    function setupCardClickHandler(rect) {
        rect.addEventListener('click', () => {
            if (rect.classList.contains('locked')) {
                console.log('Карточка заблокирована, модальное окно не показывается.');
                return;
            }

            const parentSection = rect.closest('.section');
            if (parentSection && parentSection.style.display === 'none') {
                console.error('Карточка находится в скрытой секции и не может быть обработана.');
                return;
            }

            // Получаем данные из атрибутов карточки
            const id = rect.getAttribute('data-id'); // Получаем ID карточки
            const name = rect.getAttribute('data-name');
            const description = rect.getAttribute('data-description');
            const price = rect.getAttribute('data-price');
            const image = rect.getAttribute('data-image');  // Получаем путь к изображению
            const profit = rect.getAttribute('data-profit');

            console.log('Карточка нажата. Отправляем данные в родительское окно:', { id, name, description, profit, price, image });

            // Проверяем, что id существует, перед отправкой в модальное окно
            if (!id) {
                console.error('ID карточки не найден.');
                return;
            }

            // Вызываем функцию родительского окна для отображения модального окна
            window.parent.showModalFromIframe({
                id: id, // Передаем ID карточки
                name: name,
                description: description,
                profit: profit,
                price: price,
                image: image  // Передаем путь к изображению
            });
        });
    }

    // Наблюдатель для изменения атрибута `data-lock` и `data-lvl`
    function observeLockChanges(rect) {
        const lockStatus = rect.getAttribute('data-lock');
        let requiredCard = null;

        // Парсим data-lock чтобы найти зависимые карточки
        const lockConditionMatch = lockStatus ? lockStatus.match(/^(.+?) lvl (\d+)$/) : null;
        if (lockConditionMatch) {
            const requiredCardName = lockConditionMatch[1].trim();
            requiredCard = document.querySelector(`.rect-card[data-name="${requiredCardName}"]`);
        }

        const observerCallback = (mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'data-lock' || mutation.attributeName === 'data-lvl')) {
                    // Переоценка условий разблокировки
                    if (shouldUnlockCard(rect)) {
                        unlockCard(rect);
                    } else {
                        lockCard(rect, rect.getAttribute('data-lock'));
                    }
                }
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(rect, { attributes: true, attributeFilter: ['data-lock', 'data-lvl'] });

        if (requiredCard) {
            const requiredCardObserver = new MutationObserver(observerCallback);
            requiredCardObserver.observe(requiredCard, { attributes: true, attributeFilter: ['data-lvl'] });
        }
    }

    // Обработчик сообщений из основного окна
    window.addEventListener('message', function (event) {
        const data = event.data;
        if (data && data.action === 'updateCardLevel' && data.cardId) {
            // Ищем карточку по ID
            const card = document.querySelector(`.rect-card[data-id="${data.cardId}"]`);
            if (!card) {
                console.error(`Карточка с ID ${data.cardId} не найдена в iframe.`);
                return;
            }

            // Получаем цену и profit карточки
            const price = parseInt(card.getAttribute('data-price'), 10);
            const profit = parseInt(card.getAttribute('data-profit'), 10);

            // Считываем текущее количество монет из localStorage
            let coinCounter = parseInt(localStorage.getItem('coinCounter'), 10) || 0;

            // Проверяем баланс монет
            if (coinCounter < price) {
                console.warn('Недостаточно средств для следующей покупки.');

                // Делаем карточку серой и блокируем клики
                card.style.filter = 'grayscale(100%)';
                card.style.pointerEvents = 'none';

                // Изменяем текст кнопки на "Недостаточно средств"
                const buyButton = document.querySelector('.buy-btn');
                if (buyButton) {
                    buyButton.textContent = 'Недостаточно средств';
                    buyButton.disabled = true;
                }
                return; // Прекращаем выполнение, если недостаточно средств
            }

            // Уменьшаем количество монет на цену карточки
            coinCounter -= price;

            // Сохраняем новое значение монет в localStorage
            localStorage.setItem('coinCounter', coinCounter);

            // Обновляем отображение количества монет на странице
            if (coinCounterElement) {
                coinCounterElement.textContent = Math.floor(coinCounter);
            }

            console.log(`Монеты уменьшены на ${price}. Остаток: ${coinCounter}`);

            // Обновляем уровень карточки
            let currentLvl = parseInt(card.getAttribute('data-lvl'), 10) || 0;
            currentLvl += 1;
            card.setAttribute('data-lvl', currentLvl);

            // Обновляем отображение уровня на карточке
            const lvlElement = card.querySelector('.rect-info.lvl');
            if (lvlElement) {
                lvlElement.textContent = `LvL ${currentLvl}`;
            }

            console.log(`Уровень карточки с ID ${data.cardId} повышен до ${currentLvl} в iframe.`);

            // Добавляем profit карточки к текущему hourly profit
            let currentHourlyProfit = parseInt(localStorage.getItem('hourlyProfit'), 10) || 0;
            let newHourlyProfit = currentHourlyProfit + profit;

            // Отправляем сообщение в основное окно для обновления hourlyProfit
            window.parent.postMessage({
                action: 'updateHourlyProfit',
                newHourlyProfit: newHourlyProfit
            }, '*');

            // Проверяем, нужно ли разблокировать другие карточки
            checkUnlockConditions();
        }

        // Обработка обновления отображения hourlyProfit (опционально)
        if (data && data.action === 'hourlyProfitUpdated') {
            // Обновляем отображение hourlyProfit
            const hourlyProfitElement = document.getElementById('hourly-profit');
            if (hourlyProfitElement) {
                hourlyProfitElement.textContent = data.hourlyProfit;
            }
        }
    });

    // Функция для проверки условий разблокировки карточек
    function checkUnlockConditions() {
        rectangles.forEach(rect => {
            if (shouldUnlockCard(rect)) {
                unlockCard(rect);
            } else {
                lockCard(rect, rect.getAttribute('data-lock'));
            }
        });
    }
});

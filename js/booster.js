// booster.js

document.addEventListener('DOMContentLoaded', function () {
    console.log("Boosters page loaded.");

    // Find the close button
    const closeButton = document.querySelector('.close-button');

    // Add event listener to the close button
    closeButton.addEventListener('click', function () {
        // Redirect the user to the main page
        window.location.href = '../index.html'; // Navigate to index.html at the project root
    });

    // Get the number of coins from localStorage
    let userCoins = localStorage.getItem('coinCounter');
    if (!userCoins) {
        alert('Error: Coin count not found in localStorage.');
        userCoins = 0; // Initial value if no coins
    } else {
        userCoins = parseInt(userCoins); // Convert to number
    }

    // Get current values of profitPerTap, energy, progressCounter, and maxProgress from localStorage
    let profitPerTap = localStorage.getItem('profitPerTap');
    let energy = localStorage.getItem('energy');
    let progressCounter = localStorage.getItem('progressCounter');
    let maxProgress = localStorage.getItem('maxProgress');

    if (!profitPerTap) {
        profitPerTap = 1; // Initial value for profitPerTap
        localStorage.setItem('profitPerTap', profitPerTap);
    } else {
        profitPerTap = parseInt(profitPerTap);
    }

    if (!energy) {
        energy = 1000; // Initial value for energy
        localStorage.setItem('energy', energy);
    } else {
        energy = parseInt(energy);
    }

    if (!progressCounter) {
        progressCounter = 100; // Initial value for progressCounter
        localStorage.setItem('progressCounter', progressCounter);
    } else {
        progressCounter = parseInt(progressCounter);
    }

    if (!maxProgress) {
        maxProgress = 100; // Initial value for maxProgress
        localStorage.setItem('maxProgress', maxProgress);
    } else {
        maxProgress = parseInt(maxProgress);
    }

    // Display the number of coins on the screen, if required
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
        coinsDisplay.textContent = `You have ${userCoins} coins`;
    }

    // Function to save booster state to localStorage
    function saveBoosterState(boosterId, lvl, price) {
        const boosterData = {
            lvl: lvl,
            price: price
        };
        localStorage.setItem(`booster_${boosterId}`, JSON.stringify(boosterData));
    }

    // Function to load booster state from localStorage
    function loadBoosterState(boosterId) {
        const boosterData = localStorage.getItem(`booster_${boosterId}`);
        if (boosterData) {
            return JSON.parse(boosterData);
        }
        return null; // Return null if no data
    }

    // Get all booster elements
    const boosterItems = document.querySelectorAll('.booster-item');
    const boosterItemsBooster = document.querySelectorAll('.booster-item-booster'); // Elements for booster-item-booster
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const modalImage = document.getElementById('modal-image'); // Large image
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalClose = document.querySelector('.modal-close');
    const modalBuyBtn = document.querySelector('.modal-buy-btn');
    const modalImg = document.querySelector('.modal-coin-icon');
    let currentBooster; // Variable to store the current selected booster

    // Object to store active boosters with timers
    let activeBoosters = {};

    // Function to save active boosters to localStorage
    function saveActiveBoosters() {
        localStorage.setItem('activeBoosters', JSON.stringify(activeBoosters));
    }

    // Function to load active boosters from localStorage
    function loadActiveBoosters() {
        const boosters = localStorage.getItem('activeBoosters');
        if (boosters) {
            activeBoosters = JSON.parse(boosters);

            // Check each booster for expiration
            const now = Date.now();
            for (let boosterId in activeBoosters) {
                if (activeBoosters.hasOwnProperty(boosterId)) {
                    if (activeBoosters[boosterId] <= now) {
                        // Booster expired, remove it
                        delete activeBoosters[boosterId];
                    }
                }
            }

            // Save the updated list of active boosters
            saveActiveBoosters();
        }
    }

    // Load active boosters on startup
    loadActiveBoosters();

    // Hide small images if they exist somewhere else
    const smallImages = document.querySelectorAll('.small-image'); // If there are small images in the modal
    smallImages.forEach(img => {
        img.style.display = 'none'; // Hide them
    });

    // Update levels and prices from localStorage for each booster on page load
    boosterItems.forEach(item => {
        const boosterId = item.getAttribute('data-id');
        const lvlElement = item.querySelector('.lvl');

        // Load booster state from localStorage
        const boosterState = loadBoosterState(boosterId);
        if (boosterState) {
            // If data found, update booster level and price
            item.setAttribute('data-lvl', boosterState.lvl);
            item.setAttribute('data-price', boosterState.price);

            if (lvlElement) {
                lvlElement.textContent = `Lvl ${boosterState.lvl}`;
            }
        } else {
            // If no data, set initial values
            const lvl = item.getAttribute('data-lvl');
            const price = item.getAttribute('data-price');
            if (lvlElement) {
                lvlElement.textContent = `Lvl ${lvl}`;
            }
            saveBoosterState(boosterId, lvl, price); // Save initial values to localStorage
        }
    });

    // Click handler for each booster
    function handleBoosterClick(item) {
        currentBooster = item; // Save the current booster
        const boosterId = item.getAttribute('data-id');
        const boosterName = item.querySelector('.booster-name').textContent;
        const boosterLvl = item.getAttribute('data-lvl') || 'No level';
        const boosterPrice = item.getAttribute('data-price') || '0';
        const boosterDescription = item.getAttribute('data-description') || 'No description';
        const boosterImage = item.getAttribute('data-img') || '../Images/index/booster_icon.webp'; // Image for the large display


        // Update data in the modal window
        modalImage.src = boosterImage; // Large image
        modalTitle.textContent = boosterName;
        modalDescription.textContent = `Description: ${boosterDescription}`;

        // Check if it's a regular booster or booster-item-booster
        if (item.classList.contains('booster-item-booster')) {
            modalBuyBtn.textContent = 'Activate'; // Change button text to "Activate"
            modalPrice.style.display = 'none';    // Hide the price
            modalImg.style.display = 'none';      // Hide the coin icon

            // Check if the booster is activated
            if (activeBoosters[boosterId]) {
                const endTime = activeBoosters[boosterId];

                // Update the button in the modal window
                updateModalButton(boosterId, endTime);

                // Update the button every second
                const intervalId = setInterval(() => {
                    if (currentBooster.getAttribute('data-id') !== boosterId) {
                        clearInterval(intervalId); // Stop interval if another booster is opened
                        return;
                    }
                    updateModalButton(boosterId, endTime);

                    if (!activeBoosters[boosterId]) {
                        clearInterval(intervalId); // Stop interval when booster is deactivated
                    }
                }, 1000);

                // Clear interval when closing the modal window
                const clearIntervalHandler = () => clearInterval(intervalId);
                modalClose.addEventListener('click', clearIntervalHandler, { once: true });
                overlay.addEventListener('click', clearIntervalHandler, { once: true });
            } else {
                // If booster is not activated, set default button
                modalBuyBtn.textContent = 'Activate';
                modalBuyBtn.disabled = false;
                modalBuyBtn.style.backgroundColor = '';
            }
        } else {
            // For regular boosters
            modalBuyBtn.textContent = 'Buy';             // Default text
            modalPrice.textContent = `${boosterPrice} coins`;
            modalPrice.style.display = 'block';          // Show the price
            modalImg.style.display = 'block';            // Show the coin icon

            // Reset button state
            modalBuyBtn.disabled = false;
            modalBuyBtn.style.backgroundColor = '';
        }

        // Show the modal window and overlay
        modal.classList.add('open');
        overlay.classList.add('open');
    }

    boosterItems.forEach(item => {
        item.addEventListener('click', function () {
            handleBoosterClick(item);
        });
    });

    // Click handler for booster-item-booster elements
    boosterItemsBooster.forEach(item => {
        item.addEventListener('click', function () {
            handleBoosterClick(item);
        });
    });

    // Close modal window when clicking on the close icon
    modalClose.addEventListener('click', function () {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    });

    // Close modal window when clicking on the overlay
    overlay.addEventListener('click', function () {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    });

    // Function to update the button in the modal window
    function updateModalButton(boosterId, endTime) {
        const now = Date.now();
        let remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));

        if (remainingTime > 0) {
            modalBuyBtn.textContent = formatTime(remainingTime);
            modalBuyBtn.disabled = true;
            modalBuyBtn.style.backgroundColor = '#808080';
        } else {
            modalBuyBtn.textContent = 'Activate';
            modalBuyBtn.disabled = false;
            modalBuyBtn.style.backgroundColor = '';
            delete activeBoosters[boosterId];
            saveActiveBoosters(); // Save changes
        }
    }
    
    // Function to format time into HH:MM:SS
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    }

    // Logic for buying/activating
    modalBuyBtn.addEventListener('click', function () {
        if (currentBooster) {
            const boosterId = currentBooster.getAttribute('data-id');
            const boosterName = currentBooster.querySelector('.booster-name').textContent.toLowerCase();
            let boosterPrice = parseInt(currentBooster.getAttribute('data-price')) || 0;
            let boosterLvl = parseInt(currentBooster.getAttribute('data-lvl')) || 0;
            const boosterTime = currentBooster.getAttribute('data-time') || '60'; // Timer duration

            if (!currentBooster.classList.contains('booster-item-booster')) {
                // Logic for buying regular boosters
                if (userCoins >= boosterPrice) {
                    // Deduct cost from user's coins
                    userCoins -= boosterPrice;

                    // Update coins in localStorage
                    localStorage.setItem('coinCounter', userCoins);

                    // Increase booster level
                    boosterLvl += 1;
                    currentBooster.setAttribute('data-lvl', boosterLvl);
                    currentBooster.querySelector('.lvl').textContent = `Lvl ${boosterLvl}`;

                    // Double the price
                    boosterPrice *= 2;
                    currentBooster.setAttribute('data-price', boosterPrice);

                    // Update price in the modal window
                    modalPrice.textContent = `${boosterPrice} coins`;

                    // Save updated booster data to localStorage
                    saveBoosterState(boosterId, boosterLvl, boosterPrice);

                    // Update profitPerTap if it's the "Profit per Tap" booster
                    if (boosterName.includes('profit per tap')) {
                        profitPerTap += 1; // Increase by 1 per level
                        localStorage.setItem('profitPerTap', profitPerTap);
                    }

                    // Update energy, progressCounter, and maxProgress if it's the "Energy" booster
                    if (boosterName.includes('energy') && !boosterName.includes('profit per tap')) {
                        energy += 1000;          // Increase energy by 1000 per level
                        progressCounter += 1000; // Increase progressCounter by 1000 per level
                        maxProgress += 1000;     // Increase maxProgress by 1000 per level
                        localStorage.setItem('energy', energy);
                        localStorage.setItem('progressCounter', progressCounter);
                        localStorage.setItem('maxProgress', maxProgress);
                    }

                    // Update coin display
                    if (coinsDisplay) {
                        coinsDisplay.textContent = `You have ${userCoins} coins`;
                    }

                } else {
                    alert('Not enough coins to purchase!');
                }
            } else {
                // Logic for activating booster-item-booster
                const boosterBtn = modalBuyBtn;

                // Activate booster
                boosterBtn.disabled = true;
                boosterBtn.style.backgroundColor = '#808080';

                const boosterTimeInSeconds = parseTimeToSeconds(boosterTime);
                const endTime = Date.now() + boosterTimeInSeconds * 1000; // Правильный расчет времени окончания
                activeBoosters[boosterId] = endTime;

                // Save active boosters
                saveActiveBoosters();

                // Update button in the modal window
                updateModalButton(boosterId, endTime);

                // If it's the "ful energy" booster, restore energy
                if (boosterName === 'ful energy') {
                    energy = maxProgress;
                    progressCounter = maxProgress;
                    localStorage.setItem('energy', energy);
                    localStorage.setItem('progressCounter', progressCounter);
                }

                // If it's the "turbo" booster, redirect to index.html
                if (boosterName === 'turbo') {
                    // Close the modal window
                    modal.classList.remove('open');
                    overlay.classList.remove('open');

                    // Redirect to index.html
                    window.location.href = '../index.html';
                } else {
                    // Close the modal window
                    modal.classList.remove('open');
                    overlay.classList.remove('open');
                }
            }
        }
    });

    // Function to convert time from "HH:MM:SS" format to seconds
    function parseTimeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
        } else {
            seconds = parts[0];
        }
        return seconds;
    }

    function resetBoosterTimer(boosterId) {
        // Удаляем бустер из activeBoosters и localStorage
        delete activeBoosters[boosterId];
        localStorage.setItem('activeBoosters', JSON.stringify(activeBoosters));
    
        // Убираем отображение таймера с интерфейса
        const timerElement = document.getElementById(`timer-${boosterId}`);
        if (timerElement) {
            timerElement.textContent = '';  // Очищаем текстовое содержимое таймера
        }
    
        console.log(`Таймер бустера ${boosterId} был сброшен.`);
    }
    resetBoosterTimer(4);

    console.log(`Booster time set to ${boosterTimeInSeconds} seconds.`);
    console.log(`Booster will end at: ${new Date(endTime)}`);

});

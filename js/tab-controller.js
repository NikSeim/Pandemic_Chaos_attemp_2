// Функция для загрузки контента вкладки
function loadTabContent(tabUrl) {
    const tabContent = document.getElementById("tab-content");
    const mainContent = document.getElementById("main-content");

    if (tabUrl === "home") {
        // Показываем основной контент и скрываем вкладки
        mainContent.style.display = "block";
        tabContent.style.display = "none";
    } else {
        // Скрываем основной контент и показываем блок вкладок
        mainContent.style.display = "none";
        tabContent.style.display = "block";

        // Загружаем содержимое вкладки
        fetch(`HTML/${tabUrl}`)
            .then((response) => response.text())
            .then((html) => {
                tabContent.innerHTML = html;
            })
            .catch((error) => {
                console.log("Ошибка загрузки вкладки:", error);
                tabContent.innerHTML = "<p>Ошибка загрузки контента.</p>";
            });
    }
}

// Назначаем обработчики событий для кнопок вкладок
document.querySelectorAll(".interactive-tab-button").forEach((button) => {
    button.addEventListener("click", function () {
        // Убираем класс 'active' у всех кнопок
        document.querySelectorAll(".interactive-tab-button").forEach((btn) => {
            btn.classList.remove("active");
        });

        // Добавляем 'active' для нажатой кнопки
        this.classList.add("active");

        // Загружаем контент соответствующей вкладки
        loadTabContent(this.getAttribute("data-tab"));
    });
});
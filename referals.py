import uuid
import sqlite3

# Подключение к базе данных SQLite
conn = sqlite3.connect('game.db', check_same_thread=False)

# Создание таблиц, если их еще нет
def create_tables():
    with conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id BIGINT NOT NULL,
            referral_code TEXT UNIQUE,
            ip_address TEXT UNIQUE,
            referrer_id INTEGER,
            balance INTEGER DEFAULT 0
        )
        ''')
        print("Таблица пользователей готова")

# Получение или создание реферального кода для пользователя
def get_or_create_referral_code(user_id):
    cur = conn.cursor()
    # Проверяем, есть ли у пользователя реферальный код
    cur.execute('SELECT referral_code FROM users WHERE user_id = ?', (user_id,))
    result = cur.fetchone()
    
    if result:
        # Если код уже существует, возвращаем его
        return result[0]
    
    # Генерация нового уникального кода
    referral_code = str(uuid.uuid4())
    cur.execute('INSERT INTO users (user_id, referral_code) VALUES (?, ?)', (user_id, referral_code))
    conn.commit()
    
    return referral_code

# Регистрация нового пользователя по реферальной ссылке
def register_referral(ip_address, referral_code):
    cur = conn.cursor()
    
    # Проверяем, существует ли уже этот IP в базе данных
    cur.execute('SELECT id FROM users WHERE ip_address = ?', (ip_address,))
    if cur.fetchone() is not None:
        return "IP уже зарегистрирован"

    # Ищем пригласившего по реферальному коду
    cur.execute('SELECT id FROM users WHERE referral_code = ?', (referral_code,))
    referrer = cur.fetchone()
    
    if referrer is None:
        return "Неверный реферальный код"
    
    # Добавляем нового пользователя с указанным IP и привязываем его к пригласившему
    cur.execute('INSERT INTO users (ip_address, referrer_id) VALUES (?, ?)', (ip_address, referrer[0]))
    conn.commit()
    
    return "Новый пользователь зарегистрирован по реферальной ссылке"

# Отслеживание прокачки карточки и начисление вознаграждения
def track_card_upgrade(ip_address):
    cur = conn.cursor()
    
    # Проверяем, есть ли пользователь с этим IP
    cur.execute('SELECT referrer_id FROM users WHERE ip_address = ?', (ip_address,))
    result = cur.fetchone()
    
    if result is None:
        return "Пользователь не найден"
    
    referrer_id = result[0]
    
    if referrer_id is not None:
        # Начисляем вознаграждение пригласившему
        reward_referrer(referrer_id)
    
    return "Вознаграждение за прокачку начислено"

# Начисление вознаграждения пригласившему
def reward_referrer(referrer_id):
    cur = conn.cursor()
    # Увеличиваем баланс пригласившего на 10000 единиц
    cur.execute('UPDATE users SET balance = balance + 10000 WHERE id = ?', (referrer_id,))
    conn.commit()

# Инициализация базы данных
if __name__ == "__main__":
    create_tables()

import uuid
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# Подключение к базе данных SQLite
conn = sqlite3.connect('game.db', check_same_thread=False)

# Создание таблиц, если их еще нет
def create_tables():
    with conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id BIGINT NOT NULL UNIQUE,
            referral_code TEXT UNIQUE,
            referrer_id INTEGER,
            balance INTEGER DEFAULT 0,
            reward_pending INTEGER DEFAULT 0
        )
        ''')
        print("Таблица пользователей готова")

# Получение или создание реферального кода для пользователя
def get_or_create_referral_code(user_id):
    cur = conn.cursor()
    cur.execute('SELECT referral_code FROM users WHERE user_id = ?', (user_id,))
    result = cur.fetchone()
    
    if result:
        return result[0]  # Если код уже существует, возвращаем его
    
    referral_code = str(uuid.uuid4())  # Генерация нового уникального кода
    cur.execute('INSERT INTO users (user_id, referral_code) VALUES (?, ?)', (user_id, referral_code))
    conn.commit()
    
    return referral_code

# Регистрация нового пользователя по реферальной ссылке
def register_referral(user_id, referral_code):
    cur = conn.cursor()
    
    cur.execute('SELECT id FROM users WHERE user_id = ?', (user_id,))
    if cur.fetchone() is not None:
        return "Пользователь уже зарегистрирован"

    cur.execute('SELECT id FROM users WHERE referral_code = ?', (referral_code,))
    referrer = cur.fetchone()
    
    if referrer is None:
        return "Неверный реферальный код"
    
    cur.execute('INSERT INTO users (user_id, referrer_id) VALUES (?, ?)', (user_id, referrer[0]))
    conn.commit()
    
    return "Новый пользователь зарегистрирован по реферальной ссылке"

# Начисление вознаграждения пригласившему
def reward_referrer(referrer_id, reward_amount=100000):  # Устанавливаем новую награду в 200 монет
    cur = conn.cursor()
    cur.execute('UPDATE users SET reward_pending = reward_pending + ? WHERE id = ?', (reward_amount, referrer_id))
    conn.commit()

# Обработка покупки и начисление вознаграждения
def track_purchase(user_id):
    cur = conn.cursor()
    cur.execute('SELECT referrer_id FROM users WHERE user_id = ?', (user_id,))
    result = cur.fetchone()
    
    if result is None:
        return "Пользователь не найден"
    
    referrer_id = result[0]
    
    if referrer_id is not None:
        reward_referrer(referrer_id)
    
    return "Покупка совершена, вознаграждение начислено"

# Получение списка рефералов для отображения во вкладке "Друзья"
@app.route('/get_referrals', methods=['GET'])
def get_referrals():
    user_id = request.args.get('user_id')
    cur = conn.cursor()
    cur.execute('''
        SELECT u.user_id, u.reward_pending
        FROM users u
        JOIN users ref ON u.referrer_id = ref.id
        WHERE ref.user_id = ?
    ''', (user_id,))
    referrals = cur.fetchall()
    
    referral_list = [{'user_id': ref[0], 'reward_pending': ref[1]} for ref in referrals]
    return jsonify({'referrals': referral_list})

# Обработка начисления вознаграждения при нажатии на кнопку "Забрать"
@app.route('/collect_reward', methods=['POST'])
def collect_reward():
    data = request.json
    user_id = data.get('user_id')
    
    cur = conn.cursor()
    cur.execute('SELECT reward_pending FROM users WHERE user_id = ?', (user_id,))
    result = cur.fetchone()
    
    if result is None:
        return jsonify({'message': 'Пользователь не найден'})
    
    pending_reward = result[0]
    
    if pending_reward > 0:
        cur.execute('UPDATE users SET balance = balance + reward_pending, reward_pending = 0 WHERE user_id = ?', (user_id,))
        conn.commit()
        return jsonify({'message': 'Вознаграждение успешно начислено', 'balance': pending_reward})
    else:
        return jsonify({'message': 'Нет доступных вознаграждений'})

# Запуск сервера
if __name__ == "__main__":
    create_tables()
    app.run(debug=True)

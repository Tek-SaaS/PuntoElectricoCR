import os
import json
import time
import hmac
import hashlib
import base64
import sqlite3
import requests
from functools import wraps
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# ── CONFIG ────────────────────────────────────────────────
OCM_KEY = os.environ.get('OCM_KEY', '')
OCM_URL = 'https://api.openchargemap.io/v3/poi/'
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
DB_PATH = os.environ.get('DB_PATH', 'punto_electrico.db')
TOKEN_TTL = 60 * 60 * 24 * 7  # 7 días

# ── DB ────────────────────────────────────────────────────
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    con.commit()
    con.close()

# ── JWT SIMPLE (HS256) ────────────────────────────────────
def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def b64url_decode(s):
    pad = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def make_token(user_id):
    header = b64url_encode(json.dumps({'alg':'HS256','typ':'JWT'}).encode())
    payload_data = {'sub': user_id, 'exp': int(time.time()) + TOKEN_TTL}
    payload = b64url_encode(json.dumps(payload_data).encode())
    signing = f'{header}.{payload}'.encode()
    sig = hmac.new(SECRET_KEY.encode(), signing, hashlib.sha256).digest()
    return f'{header}.{payload}.{b64url_encode(sig)}'

def verify_token(token):
    try:
        header, payload, sig = token.split('.')
        signing = f'{header}.{payload}'.encode()
        expected = hmac.new(SECRET_KEY.encode(), signing, hashlib.sha256).digest()
        if not hmac.compare_digest(b64url_decode(sig), expected):
            return None
        data = json.loads(b64url_decode(payload))
        if data.get('exp', 0) < time.time():
            return None
        return data
    except Exception:
        return None

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'Falta token'}), 401
        data = verify_token(auth[7:])
        if not data:
            return jsonify({'error': 'Token inválido'}), 401
        db = get_db()
        row = db.execute('SELECT id, name, email, created_at FROM users WHERE id = ?', (data['sub'],)).fetchone()
        if not row:
            return jsonify({'error': 'Usuario no existe'}), 401
        g.user = dict(row)
        return f(*args, **kwargs)
    return wrapper

# ── RUTAS BASE ────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        'status': 'Punto Eléctrico CR — API funcionando',
        'endpoints': ['/api/estaciones', '/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/health']
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'ocm_key_configured': bool(OCM_KEY)})

# ── OCM PROXY ─────────────────────────────────────────────
@app.route('/api/estaciones')
def obtener_estaciones():
    try:
        params = {
            'output': 'json',
            'countrycode': 'CR',
            'maxresults': '500',
            'compact': 'false',
            'verbose': 'true',
            'key': OCM_KEY,
        }
        r = requests.get(OCM_URL, params=params, timeout=10)
        r.raise_for_status()
        return jsonify(r.json())
    except requests.exceptions.Timeout:
        return jsonify({'error': 'OCM timeout'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

# ── AUTH ──────────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name or not email or len(password) < 6:
        return jsonify({'error': 'Datos inválidos'}), 400

    db = get_db()
    exists = db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if exists:
        return jsonify({'error': 'El correo ya está registrado'}), 409

    pwd_hash = generate_password_hash(password)
    cur = db.execute(
        'INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        (name, email, pwd_hash, time.strftime('%Y-%m-%dT%H:%M:%SZ'))
    )
    db.commit()
    user_id = cur.lastrowid
    user = {'id': user_id, 'name': name, 'email': email}
    return jsonify({'token': make_token(user_id), 'user': user}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    db = get_db()
    row = db.execute('SELECT id, name, email, password_hash FROM users WHERE email = ?', (email,)).fetchone()
    if not row or not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    user = {'id': row['id'], 'name': row['name'], 'email': row['email']}
    return jsonify({'token': make_token(row['id']), 'user': user})

@app.route('/api/auth/me')
@require_auth
def me():
    return jsonify(g.user)

# ── ARRANQUE ──────────────────────────────────────────────
init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
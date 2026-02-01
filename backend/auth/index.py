import json
import os
import urllib.parse
import urllib.request
import psycopg2
from datetime import datetime, timedelta
import jwt

def handler(event: dict, context) -> dict:
    """API для авторизации через Яндекс ID и регистрации пользователей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('params', {}).get('path', '')
    
    if path == '/yandex/login':
        return yandex_login(event)
    elif path == '/yandex/callback':
        return yandex_callback(event)
    elif method == 'POST' and path == '/register':
        return register_user(event)
    elif method == 'POST' and path == '/login':
        return login_user(event)
    elif method == 'GET' and path == '/me':
        return get_current_user(event)
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Endpoint not found'}),
        'isBase64Encoded': False
    }

def yandex_login(event: dict) -> dict:
    """Перенаправление на Яндекс OAuth"""
    client_id = os.environ.get('YANDEX_CLIENT_ID')
    redirect_uri = event.get('queryStringParameters', {}).get('redirect_uri', '')
    
    if not client_id:
        return error_response('YANDEX_CLIENT_ID not configured', 500)
    
    auth_url = (
        f'https://oauth.yandex.ru/authorize?'
        f'response_type=code&'
        f'client_id={client_id}&'
        f'redirect_uri={urllib.parse.quote(redirect_uri)}'
    )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'auth_url': auth_url}),
        'isBase64Encoded': False
    }

def yandex_callback(event: dict) -> dict:
    """Обработка callback от Яндекс OAuth"""
    code = event.get('queryStringParameters', {}).get('code')
    
    if not code:
        return error_response('No authorization code', 400)
    
    client_id = os.environ.get('YANDEX_CLIENT_ID')
    client_secret = os.environ.get('YANDEX_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return error_response('OAuth credentials not configured', 500)
    
    token_url = 'https://oauth.yandex.ru/token'
    token_data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret
    }).encode()
    
    try:
        req = urllib.request.Request(token_url, data=token_data, method='POST')
        with urllib.request.urlopen(req) as response:
            token_response = json.loads(response.read().decode())
        
        access_token = token_response.get('access_token')
        
        info_url = 'https://login.yandex.ru/info'
        info_req = urllib.request.Request(
            info_url,
            headers={'Authorization': f'OAuth {access_token}'}
        )
        
        with urllib.request.urlopen(info_req) as response:
            user_info = json.loads(response.read().decode())
        
        yandex_id = user_info.get('id')
        email = user_info.get('default_email')
        first_name = user_info.get('first_name', '')
        last_name = user_info.get('last_name', '')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT id, email FROM {os.environ.get('MAIN_DB_SCHEMA')}.users WHERE yandex_id = %s",
            (yandex_id,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.execute(
                f"""INSERT INTO {os.environ.get('MAIN_DB_SCHEMA')}.users 
                (email, first_name, last_name, yandex_id) 
                VALUES (%s, %s, %s, %s) RETURNING id, email""",
                (email, first_name, last_name, yandex_id)
            )
            user = cur.fetchone()
            conn.commit()
        
        cur.close()
        conn.close()
        
        jwt_token = create_jwt_token({'user_id': user[0], 'email': user[1]})
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': jwt_token,
                'user': {'id': user[0], 'email': user[1]}
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(f'OAuth error: {str(e)}', 500)

def register_user(event: dict) -> dict:
    """Регистрация нового пользователя"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        first_name = body.get('first_name')
        last_name = body.get('last_name')
        birth_date = body.get('birth_date')
        
        if not email:
            return error_response('Email is required', 400)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT id FROM {os.environ.get('MAIN_DB_SCHEMA')}.users WHERE email = %s",
            (email,)
        )
        
        if cur.fetchone():
            cur.close()
            conn.close()
            return error_response('User already exists', 409)
        
        cur.execute(
            f"""INSERT INTO {os.environ.get('MAIN_DB_SCHEMA')}.users 
            (email, first_name, last_name, birth_date) 
            VALUES (%s, %s, %s, %s) RETURNING id, email""",
            (email, first_name, last_name, birth_date)
        )
        
        user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        jwt_token = create_jwt_token({'user_id': user[0], 'email': user[1]})
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': jwt_token,
                'user': {'id': user[0], 'email': user[1]}
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def login_user(event: dict) -> dict:
    """Вход пользователя по email"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        
        if not email:
            return error_response('Email is required', 400)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT id, email FROM {os.environ.get('MAIN_DB_SCHEMA')}.users WHERE email = %s",
            (email,)
        )
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return error_response('User not found', 404)
        
        jwt_token = create_jwt_token({'user_id': user[0], 'email': user[1]})
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': jwt_token,
                'user': {'id': user[0], 'email': user[1]}
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def get_current_user(event: dict) -> dict:
    """Получить данные текущего пользователя"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return error_response('Unauthorized', 401)
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        payload = verify_jwt_token(token)
        user_id = payload.get('user_id')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"""SELECT id, email, first_name, last_name, birth_date 
            FROM {os.environ.get('MAIN_DB_SCHEMA')}.users WHERE id = %s""",
            (user_id,)
        )
        
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return error_response('User not found', 404)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': user[0],
                'email': user[1],
                'first_name': user[2],
                'last_name': user[3],
                'birth_date': str(user[4]) if user[4] else None
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(f'Invalid token: {str(e)}', 401)

def get_db_connection():
    """Подключение к БД"""
    return psycopg2.connect(os.environ.get('DATABASE_URL'))

def create_jwt_token(payload: dict) -> str:
    """Создать JWT токен"""
    secret = os.environ.get('JWT_SECRET', 'volm-secret-key-2024')
    payload['exp'] = datetime.utcnow() + timedelta(days=30)
    return jwt.encode(payload, secret, algorithm='HS256')

def verify_jwt_token(token: str) -> dict:
    """Проверить JWT токен"""
    secret = os.environ.get('JWT_SECRET', 'volm-secret-key-2024')
    return jwt.decode(token, secret, algorithms=['HS256'])

def error_response(message: str, status_code: int) -> dict:
    """Генерация ответа с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }

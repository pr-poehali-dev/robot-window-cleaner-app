import json
import os
import psycopg2
import jwt
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления роботами-мойщиками окон"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = get_user_from_token(event)
    if not user_id:
        return error_response('Unauthorized', 401)
    
    path = event.get('params', {}).get('path', '')
    robot_id = event.get('pathParams', {}).get('id')
    
    if method == 'GET' and not robot_id:
        return list_robots(user_id)
    elif method == 'GET' and robot_id:
        return get_robot(user_id, robot_id)
    elif method == 'POST' and path == '/connect':
        return connect_robot(event, user_id)
    elif method == 'PUT' and robot_id:
        return update_robot(event, user_id, robot_id)
    elif method == 'POST' and path.endswith('/control'):
        return control_robot(event, user_id, robot_id)
    elif method == 'DELETE' and robot_id:
        return delete_robot(user_id, robot_id)
    
    return error_response('Endpoint not found', 404)

def list_robots(user_id: int) -> dict:
    """Получить список роботов пользователя"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"""SELECT id, name, model, has_cleaning, battery_level, status, 
            current_task, is_active, created_at 
            FROM {os.environ.get('MAIN_DB_SCHEMA')}.robots 
            WHERE user_id = %s AND (archived IS NULL OR archived = false)
            ORDER BY created_at DESC""",
            (user_id,)
        )
        
        robots = []
        for row in cur.fetchall():
            robots.append({
                'id': row[0],
                'name': row[1],
                'model': row[2],
                'has_cleaning': row[3],
                'battery_level': row[4],
                'status': row[5],
                'current_task': row[6],
                'is_active': row[7],
                'created_at': row[8].isoformat() if row[8] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'robots': robots}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def get_robot(user_id: int, robot_id: str) -> dict:
    """Получить данные конкретного робота"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"""SELECT id, name, model, has_cleaning, battery_level, status, 
            current_task, is_active, created_at 
            FROM {os.environ.get('MAIN_DB_SCHEMA')}.robots 
            WHERE id = %s AND user_id = %s AND (archived IS NULL OR archived = false)""",
            (robot_id, user_id)
        )
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return error_response('Robot not found', 404)
        
        robot = {
            'id': row[0],
            'name': row[1],
            'model': row[2],
            'has_cleaning': row[3],
            'battery_level': row[4],
            'status': row[5],
            'current_task': row[6],
            'is_active': row[7],
            'created_at': row[8].isoformat() if row[8] else None
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(robot),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def connect_robot(event: dict, user_id: int) -> dict:
    """Подключить нового робота"""
    try:
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', 'VÖLM Robot')
        model = body.get('model', 'VLM-2024')
        has_cleaning = body.get('has_cleaning', True)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT COUNT(*) FROM {os.environ.get('MAIN_DB_SCHEMA')}.robots WHERE user_id = %s AND (archived IS NULL OR archived = false)",
            (user_id,)
        )
        
        count = cur.fetchone()[0]
        
        if count >= 2:
            cur.close()
            conn.close()
            return error_response('Maximum 2 robots allowed', 400)
        
        robot_number = count + 1
        robot_name = f"{name} #{robot_number}"
        
        cur.execute(
            f"""INSERT INTO {os.environ.get('MAIN_DB_SCHEMA')}.robots 
            (user_id, name, model, has_cleaning, battery_level, status, current_task, is_active) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
            RETURNING id, name, model, has_cleaning, battery_level, status, current_task, is_active, created_at""",
            (user_id, robot_name, model, has_cleaning, 100, 'online', 'idle', False)
        )
        
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        robot = {
            'id': row[0],
            'name': row[1],
            'model': row[2],
            'has_cleaning': row[3],
            'battery_level': row[4],
            'status': row[5],
            'current_task': row[6],
            'is_active': row[7],
            'created_at': row[8].isoformat() if row[8] else None
        }
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(robot),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def update_robot(event: dict, user_id: int, robot_id: str) -> dict:
    """Обновить данные робота"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT id FROM {os.environ.get('MAIN_DB_SCHEMA')}.robots WHERE id = %s AND user_id = %s",
            (robot_id, user_id)
        )
        
        if not cur.fetchone():
            cur.close()
            conn.close()
            return error_response('Robot not found', 404)
        
        updates = []
        values = []
        
        if 'has_cleaning' in body:
            updates.append('has_cleaning = %s')
            values.append(body['has_cleaning'])
        
        if 'battery_level' in body:
            updates.append('battery_level = %s')
            values.append(body['battery_level'])
        
        if 'status' in body:
            updates.append('status = %s')
            values.append(body['status'])
        
        if 'current_task' in body:
            updates.append('current_task = %s')
            values.append(body['current_task'])
        
        if 'is_active' in body:
            updates.append('is_active = %s')
            values.append(body['is_active'])
        
        if not updates:
            cur.close()
            conn.close()
            return error_response('No fields to update', 400)
        
        updates.append('updated_at = CURRENT_TIMESTAMP')
        values.append(robot_id)
        values.append(user_id)
        
        query = f"""UPDATE {os.environ.get('MAIN_DB_SCHEMA')}.robots 
                   SET {', '.join(updates)} 
                   WHERE id = %s AND user_id = %s 
                   RETURNING id, name, model, has_cleaning, battery_level, status, current_task, is_active"""
        
        cur.execute(query, values)
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        robot = {
            'id': row[0],
            'name': row[1],
            'model': row[2],
            'has_cleaning': row[3],
            'battery_level': row[4],
            'status': row[5],
            'current_task': row[6],
            'is_active': row[7]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(robot),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def control_robot(event: dict, user_id: int, robot_id: str) -> dict:
    """Управление роботом (start/stop/pause)"""
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action not in ['start', 'stop', 'pause']:
            return error_response('Invalid action. Use: start, stop, pause', 400)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"SELECT id, has_cleaning FROM {os.environ.get('MAIN_DB_SCHEMA')}.robots WHERE id = %s AND user_id = %s",
            (robot_id, user_id)
        )
        
        robot = cur.fetchone()
        
        if not robot:
            cur.close()
            conn.close()
            return error_response('Robot not found', 404)
        
        if not robot[1] and action == 'start':
            cur.close()
            conn.close()
            return error_response('This robot does not have cleaning capability', 400)
        
        task_map = {
            'start': ('cleaning', True),
            'pause': ('paused', True),
            'stop': ('idle', False)
        }
        
        current_task, is_active = task_map[action]
        
        cur.execute(
            f"""UPDATE {os.environ.get('MAIN_DB_SCHEMA')}.robots 
            SET current_task = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s AND user_id = %s 
            RETURNING id, name, model, has_cleaning, battery_level, status, current_task, is_active""",
            (current_task, is_active, robot_id, user_id)
        )
        
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        robot_data = {
            'id': row[0],
            'name': row[1],
            'model': row[2],
            'has_cleaning': row[3],
            'battery_level': row[4],
            'status': row[5],
            'current_task': row[6],
            'is_active': row[7]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(robot_data),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def delete_robot(user_id: int, robot_id: str) -> dict:
    """Удалить робота (мягкое удаление)"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            f"""UPDATE {os.environ.get('MAIN_DB_SCHEMA')}.robots 
            SET archived = true, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s AND user_id = %s 
            RETURNING id""",
            (robot_id, user_id)
        )
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if not result:
            return error_response('Robot not found', 404)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Robot deleted successfully'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return error_response(str(e), 500)

def get_user_from_token(event: dict):
    """Извлечь user_id из JWT токена"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        secret = os.environ.get('JWT_SECRET', 'volm-secret-key-2024')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload.get('user_id')
    except:
        return None

def get_db_connection():
    """Подключение к БД"""
    return psycopg2.connect(os.environ.get('DATABASE_URL'))

def error_response(message: str, status_code: int) -> dict:
    """Генерация ответа с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }

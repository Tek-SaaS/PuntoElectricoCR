import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite que Vercel (frontend) hable con Render (backend)

# ════════════════════════════════════════════════════════════
#  CONFIGURACIÓN
# ════════════════════════════════════════════════════════════

# La clave se lee desde variable de entorno (SEGURA en Render)
OCM_KEY = os.environ.get('OCM_KEY', '')
OCM_URL = 'https://api.openchargemap.io/v3/poi/'

# ════════════════════════════════════════════════════════════
#  RUTAS
# ════════════════════════════════════════════════════════════

@app.route('/')
def home():
    return jsonify({
        'status': '✅ Punto Eléctrico CR - API funcionando',
        'endpoints': {
            '/api/estaciones': 'Obtener todas las estaciones de CR',
        }
    })

@app.route('/api/estaciones')
def obtener_estaciones():
    """
    Endpoint que tu frontend llamará en lugar de llamar a OCM directamente.
    El frontend solo ve esta URL, no ve la API Key.
    """
    try:
        # Parámetros que OCM espera
        params = {
            'output': 'json',
            'countrycode': 'CR',
            'maxresults': '500',
            'compact': 'false',
            'verbose': 'true',
            'key': OCM_KEY,  # ← La clave está SEGURA en el backend
        }

        # Llamar a OCM desde el servidor (no desde el navegador)
        response = requests.get(OCM_URL, params=params, timeout=10)
        response.raise_for_status()

        # Devolver los datos al frontend exactamente como los recibe OCM
        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'La API de Open Charge Map no respondió a tiempo',
            'detail': 'Timeout'
        }), 504

    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Error al conectar con Open Charge Map',
            'detail': str(e)
        }), 500

    except Exception as e:
        return jsonify({
            'error': 'Error interno del servidor',
            'detail': str(e)
        }), 500

@app.route('/api/estaciones/<int:station_id>')
def obtener_estacion(station_id):
    """
    Endpoint opcional para obtener una estación específica por ID.
    """
    try:
        params = {
            'output': 'json',
            'countrycode': 'CR',
            'verbose': 'true',
            'key': OCM_KEY,
        }
        # Nota: OCM no tiene un endpoint directo por ID, pero podemos filtrar.
        # Esta es una implementación simplificada.
        response = requests.get(f"{OCM_URL}?id={station_id}", params=params, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    """Endpoint para verificar que el backend está vivo"""
    return jsonify({
        'status': 'healthy',
        'ocm_key_configured': bool(OCM_KEY)
    })

# ════════════════════════════════════════════════════════════
#  ARRANQUE
# ════════════════════════════════════════════════════════════

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

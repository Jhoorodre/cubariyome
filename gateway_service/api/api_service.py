# gateway_service/api/api_service.py

import requests
from django.conf import settings

def execute_suwayomi_query(query: str, variables: dict = None):
    """
    Executa uma query GraphQL no servidor Suwayomi e retorna a resposta em JSON.
    Lê a URL e o timeout do arquivo de settings do Django.
    """
    api_url = settings.SUWAYOMI_API_URL
    timeout = getattr(settings, 'SUWAYOMI_TIMEOUT', 10)

    if not api_url:
        raise ValueError("A variável SUWAYOMI_API_URL não está configurada no ambiente.")

    headers = {
        'Content-Type': 'application/json'
    }
    payload = {
        'query': query,
        'variables': variables or {}
    }
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        raise ConnectionError(f"Timeout ao tentar conectar com o Suwayomi em {api_url}")
    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"Erro de conexão com o Suwayomi Server: {e}")

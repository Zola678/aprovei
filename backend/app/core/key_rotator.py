import time
import os
import json
from collections import defaultdict
from app.core.config import settings

# Dicionário para gerir timestamps de cooldown de cada chave
KEY_COOLDOWNS = defaultdict(float)

def load_backup_keys() -> list:
    """
    Carrega as chaves secundárias do ficheiro storage/gemini_keys_pool.json (ignorado pelo git).
    """
    keys_path = "storage/gemini_keys_pool.json"
    if os.path.exists(keys_path):
        try:
            with open(keys_path, "r", encoding="utf-8") as f:
                keys = json.load(f)
                if isinstance(keys, list):
                    return [k.strip() for k in keys if k and k.strip()]
        except Exception as e:
            print(f"[KEY ROTATOR] Erro ao carregar chaves secundárias do json: {e}")
    return []

def get_primary_key() -> str:
    """
    Obtém a chave primária atualizada em tempo real (sem necessidade de reiniciar o container).
    Procura no config.json do Lunar local e depois no ficheiro .env do backend.
    """
    # 1. Tentar ler do config.json do Lunar local (montado em /app/lunar_local)
    lunar_config_path = "/app/lunar_local/config.json"
    if os.path.exists(lunar_config_path):
        try:
            with open(lunar_config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                key = cfg.get("gemini_api_key")
                if key and key.strip() and not key.strip().startswith("AQUI"):
                    return key.strip()
        except Exception as e:
            print(f"[KEY ROTATOR] Erro ao ler chave do Lunar local: {e}")
            
    # 2. Tentar ler do ficheiro .env do backend em tempo real
    env_path = ".env"
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY="):
                        key = line.split("=", 1)[1].strip()
                        # Remover possíveis aspas
                        key = key.replace('"', '').replace("'", "")
                        if key:
                            return key
        except Exception as e:
            print(f"[KEY ROTATOR] Erro ao ler chave do .env: {e}")
            
    # 3. Fallback para as definições de inicialização
    return settings.GEMINI_API_KEY or ""

class DynamicKeysPool(list):
    def _get_pool(self) -> list:
        primary_key = get_primary_key()
        backup_keys = load_backup_keys()
        current_pool = []
        if primary_key:
            current_pool.append(primary_key)
        for key in backup_keys:
            if key not in current_pool:
                current_pool.append(key)
        return current_pool

    def __len__(self):
        return len(self._get_pool())

    def __bool__(self):
        return len(self._get_pool()) > 0

    def __iter__(self):
        return iter(self._get_pool())

    def __getitem__(self, index):
        return self._get_pool()[index]

    def __contains__(self, item):
        return item in self._get_pool()

    def __repr__(self):
        return repr(self._get_pool())

    def __str__(self):
        return str(self._get_pool())

# Para compatibilidade com as importações externas existentes em ai.py e lunar.py
GEMINI_KEYS_POOL = DynamicKeysPool()

def get_next_available_key() -> str:
    """
    Retorna a próxima chave disponível. Constrói o pool dinamicamente para
    inserir a chave primária atualizada em tempo real na primeira posição.
    """
    primary_key = get_primary_key()
    backup_keys = load_backup_keys()
    
    # Construir o pool de chaves atual
    current_pool = []
    if primary_key:
        current_pool.append(primary_key)
        
    for key in backup_keys:
        if key not in current_pool:
            current_pool.append(key)
            
    # Se não temos nenhuma chave no pool (raro), devolve uma string vazia
    if not current_pool:
        return ""
        
    now = time.time()
    
    # 1. Procurar chave ativa fora de cooldown
    for key in current_pool:
        if KEY_COOLDOWNS[key] < now:
            return key
            
    # 2. Se todas estão em cooldown, escolher a que sai mais cedo
    sorted_keys = sorted(current_pool, key=lambda k: KEY_COOLDOWNS[k])
    earliest_key = sorted_keys[0]
    
    wait_time = max(0.0, KEY_COOLDOWNS[earliest_key] - now)
    print(f"[KEY ROTATOR] Todas as chaves em cooldown. Usando chave com menor espera ({wait_time:.1f}s)")
    
    return earliest_key

def mark_key_cooldown(key: str, duration: float = 65.0):
    """
    Coloca uma chave em cooldown por um determinado número de segundos.
    """
    KEY_COOLDOWNS[key] = time.time() + duration
    print(f"[KEY ROTATOR] Chave {key[:10]}... colocada em COOLDOWN por {duration} segundos.")

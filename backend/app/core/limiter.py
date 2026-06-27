from slowapi import Limiter
from slowapi.util import get_remote_address

# Limiter básico baseado no IP do cliente
limiter = Limiter(key_func=get_remote_address)

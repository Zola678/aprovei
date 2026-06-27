from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PaymentInitiateRequest(BaseModel):
    # O cliente envia o que quer comprar (ex: 'premium_subscription', 'exam_pack')
    # Não envia o preço para garantir que seja inalterável pelo front-end
    item_type: str
    item_id: Optional[int] = None

class PaymentResponse(BaseModel):
    id: int
    amount: Decimal
    status: str
    gateway_transaction_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    # Informações para o utilizador pagar no app externo (Ex: Multicaixa Express)
    payment_reference: Optional[str] = None
    payment_entity: Optional[str] = None

    class Config:
        from_attributes = True

class WebhookPayload(BaseModel):
    gateway_transaction_id: str
    status: str
    # Outros campos dependendo do gateway oficial

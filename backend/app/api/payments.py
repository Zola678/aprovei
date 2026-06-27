from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid
from decimal import Decimal
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import Payment, User
from app.schemas.payment import PaymentInitiateRequest, PaymentResponse, WebhookPayload
from app.api.deps import get_current_user

router = APIRouter()

# Dicionário fictício de preços no servidor (Inalterável pelo cliente)
# Em produção, você consultaria do seu banco de dados ou regra de negócio
PRICES_DB = {
    "premium_subscription": Decimal("5000.00"),
    "exam_pack": Decimal("2500.00")
}

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    request: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Inicia um pagamento para um serviço.
    O preço é determinado pelo servidor, garantindo que o cliente não o altera.
    """
    # 1. Determinar o preço internamente
    amount = PRICES_DB.get(request.item_type)
    if not amount:
        raise HTTPException(status_code=400, detail="Item de compra inválido ou indisponível.")

    # 2. Comunicar com a API do Gateway Externo (ex: Proxypay / Multicaixa)
    # Simulamos aqui uma chamada bem-sucedida para gerar a referência
    mock_gateway_id = f"GTW-{uuid.uuid4().hex[:8].upper()}"
    mock_reference = f"{uuid.uuid4().int % 1000000000:09d}" # Referência de 9 dígitos
    mock_entity = "00000" # Entidade fictícia

    # 3. Gerar transação pendente no nosso sistema
    new_payment = Payment(
        user_id=current_user.id,
        amount=amount,
        status="pending",
        gateway_transaction_id=mock_gateway_id,
        description=f"Pagamento para {request.item_type}"
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)

    # 4. Retornar os detalhes para o cliente abrir o App Oficial (Multicaixa Express)
    return {
        "id": new_payment.id,
        "amount": new_payment.amount,
        "status": new_payment.status,
        "gateway_transaction_id": new_payment.gateway_transaction_id,
        "description": new_payment.description,
        "created_at": new_payment.created_at,
        "payment_reference": mock_reference,
        "payment_entity": mock_entity
    }

@router.post("/webhook")
async def payment_webhook(
    payload: WebhookPayload,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Ponto de acesso (Webhook) para o Gateway de Pagamentos (ex: Multicaixa Express)
    notificar o nosso sistema que o cliente concluiu o pagamento na app oficial.
    """
    # IMPORTANTE Em produção: Validar a origem da requisição (assinatura do gateway/IP)
    
    result = await db.execute(select(Payment).where(Payment.gateway_transaction_id == payload.gateway_transaction_id))
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado.")

    if payload.status.lower() == "completed":
        payment.status = "completed"
        # Lógica para liberar o acesso ao serviço comprado (ativar plano premium)
        stmt_user = select(User).where(User.id == payment.user_id)
        result_user = await db.execute(stmt_user)
        user = result_user.scalar_one_or_none()
        if user:
            user.is_premium = True
    elif payload.status.lower() == "failed":
        payment.status = "failed"

    await db.commit()
    return {"message": "Status do pagamento atualizado com sucesso."}

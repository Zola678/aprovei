from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import ForumPost as PostModel, ForumComment as CommentModel, User as UserModel, PostLike, CallConfirmation
from app.schemas.forum import ForumPost, ForumPostCreate, ForumComment, ForumCommentCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=list[ForumPost])
async def list_posts(
    category: str = Query(None, description="Filtrar por categoria"),
    db: AsyncSession = Depends(get_db)
):
    query = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments).selectinload(CommentModel.author),
        selectinload(PostModel.confirmations)
    ).order_by(PostModel.created_at.desc())
    
    if category:
        query = query.where(PostModel.category == category)
        
    result = await db.execute(query)
    posts = result.scalars().all()
    
    # Auto-start calls with >= 5 confirmations
    updated = False
    for post in posts:
        if post.is_call and post.call_status == "scheduled" and len(post.confirmations) >= 5:
            post.call_status = "live"
            post.call_url = f"/stream/{post.id}"
            db.add(post)
            updated = True
    if updated:
        await db.commit()
        
    return posts

@router.get("/{post_id}", response_model=ForumPost)
async def get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments).selectinload(CommentModel.author),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == post_id)
    
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
        
    # Auto-start calls with >= 5 confirmations
    if post.is_call and post.call_status == "scheduled" and len(post.confirmations) >= 5:
        post.call_status = "live"
        post.call_url = f"/stream/{post.id}"
        db.add(post)
        await db.commit()
        await db.refresh(post)
        
    return post

@router.post("/", response_model=ForumPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: ForumPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    new_post = PostModel(
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
        user_id=current_user.id,
        is_call=post_in.is_call,
        call_title=post_in.call_title,
        call_scheduled_at=post_in.call_scheduled_at
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    
    # Recarregar relacionamentos
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == new_post.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.post("/{post_id}/comments", response_model=ForumComment, status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: int,
    comment_in: ForumCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # Verificar se post existe
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
        
    new_comment = CommentModel(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    # Recarregar relacionamento do autor
    stmt = select(CommentModel).options(selectinload(CommentModel.author)).where(CommentModel.id == new_comment.id)
    result = await db.execute(stmt)
    return result.scalars().first()

@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(PostModel).where(PostModel.id == post_id)
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
        
    # Verificar se o utilizador já deu like
    like_stmt = select(PostLike).where(PostLike.user_id == current_user.id, PostLike.post_id == post_id)
    like_res = await db.execute(like_stmt)
    existing_like = like_res.scalars().first()
    
    if existing_like:
        # Descurtir (remover like)
        await db.delete(existing_like)
        post.likes = max(0, post.likes - 1)
        liked = False
    else:
        # Curtir (adicionar like)
        new_like = PostLike(user_id=current_user.id, post_id=post_id)
        db.add(new_like)
        post.likes += 1
        liked = True
        
    await db.commit()
    return {"likes": post.likes, "isLiked": liked}

@router.post("/{post_id}/confirm-call", response_model=ForumPost)
async def confirm_call(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == post_id)
    
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
    if not post.is_call:
        raise HTTPException(status_code=400, detail="Esta discussão não é uma chamada agendada.")
        
    # Verificar se já confirmou
    existing = [c for c in post.confirmations if c.user_id == current_user.id]
    if not existing:
        new_conf = CallConfirmation(post_id=post_id, user_id=current_user.id)
        db.add(new_conf)
        await db.commit()
        
        # Recarregar com a nova confirmação
        stmt_reload = select(PostModel).options(
            selectinload(PostModel.author),
            selectinload(PostModel.comments),
            selectinload(PostModel.confirmations)
        ).where(PostModel.id == post_id)
        res_reload = await db.execute(stmt_reload)
        post = res_reload.scalars().first()
        
    # Auto-start calls with >= 5 confirmations
    if post.call_status == "scheduled" and len(post.confirmations) >= 5:
        post.call_status = "live"
        post.call_url = f"/stream/{post.id}"
        db.add(post)
        await db.commit()
        
    return post

@router.post("/{post_id}/unconfirm-call", response_model=ForumPost)
async def unconfirm_call(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == post_id)
    
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
    if not post.is_call:
        raise HTTPException(status_code=400, detail="Esta discussão não é uma chamada agendada.")
        
    # Verificar se confirmou
    existing = [c for c in post.confirmations if c.user_id == current_user.id]
    if existing:
        for conf in existing:
            await db.delete(conf)
        await db.commit()
        
        # Recarregar
        stmt_reload = select(PostModel).options(
            selectinload(PostModel.author),
            selectinload(PostModel.comments),
            selectinload(PostModel.confirmations)
        ).where(PostModel.id == post_id)
        res_reload = await db.execute(stmt_reload)
        post = res_reload.scalars().first()
        
    return post

@router.post("/{post_id}/start-call", response_model=ForumPost)
async def start_call(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == post_id)
    
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
    if not post.is_call:
        raise HTTPException(status_code=400, detail="Esta discussão não é uma chamada agendada.")
        
    # Manual start call
    post.call_status = "live"
    post.call_url = f"/stream/{post.id}"
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@router.post("/{post_id}/end-call", response_model=ForumPost)
async def end_call(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(PostModel).options(
        selectinload(PostModel.author),
        selectinload(PostModel.comments),
        selectinload(PostModel.confirmations)
    ).where(PostModel.id == post_id)
    
    result = await db.execute(stmt)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Discussão não encontrada.")
    if not post.is_call:
        raise HTTPException(status_code=400, detail="Esta discussão não é uma chamada agendada.")
        
    post.call_status = "ended"
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

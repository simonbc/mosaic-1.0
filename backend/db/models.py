# models.py

from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Handle(Base):
    __tablename__ = 'handles'
    id = Column(Integer, primary_key=True)
    handle = Column(String, nullable=False)
    public_key = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint('handle', name='uq_handle'),
    )

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True, autoincrement=True)
    handle = Column(String, ForeignKey('handles.handle'))
    slug = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    byline = Column(Text)

    revisions = relationship("Revision", back_populates="post", cascade="all, delete-orphan")

class Revision(Base):
    __tablename__ = 'revisions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey('posts.id'))
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    post = relationship("Post", back_populates="revisions")

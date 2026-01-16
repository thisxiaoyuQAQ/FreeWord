import { NextResponse } from 'next/server';
import { Word, LanguageTypes } from '../../../types';

// 模拟数据 - 实际项目中应该使用数据库
let words: Word[] = [
  {
    id: '1',
    language: LanguageTypes.ENGLISH,
    data: { word: 'hello', chinese: '你好' },
    createdAt: new Date(),
    reviewCount: 0,
    lastReviewed: null,
    nextReview: null,
    interval: 1,
    easeFactor: 2.5,
    isFavorite: false
  },
  {
    id: '2',
    language: LanguageTypes.ENGLISH,
    data: { word: 'world', chinese: '世界' },
    createdAt: new Date(),
    reviewCount: 0,
    lastReviewed: null,
    nextReview: null,
    interval: 1,
    easeFactor: 2.5,
    isFavorite: false
  }
];

// GET - 获取所有单词
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language');

  let filteredWords = [...words];
  if (language) {
    filteredWords = filteredWords.filter(word => word.language === language);
  }

  return NextResponse.json(filteredWords);
}

// POST - 添加单词
export async function POST(request: Request) {
  const newWord = await request.json();
  words.push({
    ...newWord,
    id: Date.now().toString(),
    createdAt: new Date(),
    reviewCount: 0,
    lastReviewed: null,
    nextReview: null,
    interval: 1,
    easeFactor: 2.5,
    isFavorite: false
  });

  return NextResponse.json(newWord, { status: 201 });
}

// PUT - 更新单词
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing word id' }, { status: 400 });
  }

  const updatedWord = await request.json();
  const wordIndex = words.findIndex(word => word.id === id);
  
  if (wordIndex === -1) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  words[wordIndex] = { ...words[wordIndex], ...updatedWord };
  return NextResponse.json(words[wordIndex]);
}

// DELETE - 删除单词
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing word id' }, { status: 400 });
  }

  const wordIndex = words.findIndex(word => word.id === id);
  
  if (wordIndex === -1) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  words.splice(wordIndex, 1);
  return NextResponse.json({ message: 'Word deleted successfully' });
}
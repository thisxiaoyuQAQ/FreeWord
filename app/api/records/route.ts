import { NextResponse } from 'next/server';
import { LearningRecord } from '../../../types';

// 模拟数据 - 实际项目中应该使用数据库
let records: LearningRecord[] = [];

// GET - 获取所有学习记录
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wordId = searchParams.get('wordId');
  const today = searchParams.get('today');

  let filteredRecords = [...records];
  
  // 按单词ID过滤
  if (wordId) {
    filteredRecords = filteredRecords.filter(record => record.wordId === wordId);
  }
  
  // 按今日过滤
  if (today === 'true') {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    filteredRecords = filteredRecords.filter(record => new Date(record.timestamp) >= todayDate);
  }

  return NextResponse.json(filteredRecords);
}

// POST - 添加学习记录
export async function POST(request: Request) {
  const newRecord = await request.json();
  const record: LearningRecord = {
    ...newRecord,
    timestamp: new Date()
  };
  
  records.push(record);
  return NextResponse.json(record, { status: 201 });
}

// GET - 获取今日学习记录数量
export async function GET_COUNT(request: Request) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRecords = records.filter(record => new Date(record.timestamp) >= today);
  return NextResponse.json({ count: todayRecords.length });
}
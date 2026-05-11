import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { addDoc, collection } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const requestRef = await addDoc(collection(db, 'requests'), {
      ...body,
      status: 'new',
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      requestId: requestRef.id,
      message: 'Заявка успешно отправлена'
    })
  } catch (error: any) {
    console.error('REQUEST_ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Ошибка при отправке заявки'
      },
      { status: 500 }
    )
  }
}
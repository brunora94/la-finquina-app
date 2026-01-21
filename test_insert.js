
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function testInsert() {
    const newCrop = {
        name: 'Test CamelCase',
        plantedDate: '2026-01-21',
        type: 'huerto',
        health: 'excelente',
        irrigation: 'Goteo'
    }

    console.log('Intentando insertar:', newCrop)
    const { data, error } = await supabase.from('crops').insert([newCrop]).select()

    if (error) {
        console.error('❌ ERROR al insertar:', error.message)
        console.error('Detalles:', error)
    } else {
        console.log('✅ Inserción exitosa:', data)
    }
}

testInsert()

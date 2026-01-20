
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function verify() {
    console.log('Verificando conexión con:', process.env.VITE_SUPABASE_URL)

    const { data: tasks, error: tasksError } = await supabase.from('tasks').select('id').limit(1)
    if (tasksError) console.error('❌ Error en tabla TASKS:', tasksError.message)
    else console.log('✅ Tabla TASKS conectada')

    const { data: crops, error: cropsError } = await supabase.from('crops').select('id').limit(1)
    if (cropsError) console.error('❌ Error en tabla CROPS:', cropsError.message)
    else console.log('✅ Tabla CROPS conectada')

    const { data: expenses, error: expensesError } = await supabase.from('expenses').select('id').limit(1)
    if (expensesError) console.error('❌ Error en tabla EXPENSES:', expensesError.message)
    else console.log('✅ Tabla EXPENSES conectada')
}

verify()

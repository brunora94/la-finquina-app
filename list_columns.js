
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function listColumns() {
    const { data, error } = await supabase.from('crops').select('*').limit(1)
    if (data && data.length > 0) {
        console.log('Columnas actuales:', Object.keys(data[0]))
    } else {
        console.log('No se pudo recuperar ningún registro.')
    }
}

listColumns()

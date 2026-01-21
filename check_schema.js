
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkSchema() {
    console.log('--- Comprobando Tabla CROPS ---')
    const { data, error } = await supabase.from('crops').select('*').limit(1)

    if (error) {
        console.error('❌ Error al consultar crops:', error)
    } else {
        console.log('✅ Conexión exitosa. Columnas detectadas en el primer registro (o vacía):')
        if (data && data.length > 0) {
            console.log(Object.keys(data[0]))
        } else {
            console.log('La tabla está vacía, intentando insertar un registro de prueba mínimo...')
            const { error: insertError } = await supabase.from('crops').insert([{ name: 'Test Schema' }])
            if (insertError) {
                console.error('❌ Error al insertar:', insertError.message)
                console.error('Detalles del error:', insertError)
            } else {
                console.log('✅ Inserción de prueba mínima funcionó.')
            }
        }
    }
}

checkSchema()

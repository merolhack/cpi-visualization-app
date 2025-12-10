import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Definición de cabeceras para CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Usa SERVICE_ROLE para omitir RLS
)

Deno.serve(async (req) => {
  // Manejo de preflight request para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Iniciando cron calculate-real-cpi...");

    // 1. Obtener todos los criterios activos
    const { data: criteria, error: criteriaError } = await supabaseClient
      .from('cpi_criteria')
      .select('criterion_id, criterion_name')
      .eq('is_active_criterion', true);

    if (criteriaError) throw criteriaError;
    if (!criteria || criteria.length === 0) {
      console.warn("No se encontraron criterios activos.");
      return new Response(JSON.stringify({ message: "No active criteria found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Obtener todos los países
    const { data: countries, error: countriesError } = await supabaseClient
      .from('cpi_countries')
      .select('country_id, country_name');

    if (countriesError) throw countriesError;

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
    let processedCount = 0;

    // 3. Iterar por País, Criterio y Mes
    for (const country of countries || []) {
      for (const criterion of criteria) {
        // Obtener pesos para este criterio
        const { data: weights, error: weightsError } = await supabaseClient
          .from('cpi_weights')
          .select('category_id, weight_value')
          .eq('criterion_id', criterion.criterion_id);

        if (weightsError) {
            console.error(`Error obteniendo pesos para criterio ${criterion.criterion_id}:`, weightsError);
            continue;
        }
        
        // Suma total de pesos (denominador)
        const totalWeight = weights?.reduce((sum, w) => sum + Number(w.weight_value), 0) || 0;
        
        if (totalWeight === 0) {
             console.warn(`Peso total es 0 para criterio ${criterion.criterion_id}. Saltando.`);
             continue;
        }

        for (const month of months) {
            // Obtener inflación por categoría para este país/mes/año
            const { data: catInflation, error: catInflationError } = await supabaseClient
                .from('cpi_category_inflation')
                .select('category_id, ci_inflation_rate')
                .eq('country_id', country.country_id)
                .eq('month', month)
                .eq('year', currentYear)
                .not('ci_inflation_rate', 'is', null);

            if (catInflationError) {
                 console.error(`Error obteniendo inflación categoría ${country.country_name} ${month}/${currentYear}:`, catInflationError);
                 continue;
            }

            if (!catInflation || catInflation.length === 0) continue;

            // 4. Calcular Inflación Ponderada
            // Fórmula: Suma(Inflación_Categoria * Peso_Categoria) / Suma_Total_Pesos
            let weightedSum = 0;
            let usedWeightsSum = 0;

            for (const inf of catInflation) {
                const weightObj = weights?.find(w => w.category_id === inf.category_id);
                if (weightObj) {
                    weightedSum += Number(inf.ci_inflation_rate) * Number(weightObj.weight_value);
                    usedWeightsSum += Number(weightObj.weight_value);
                }
            }

            // Normalizar si no tenemos datos de todas las categorías (opcional, pero recomendado aritméticamente)
            // Aquí usamos el totalWeight teórico según la definición del sistema
            if (usedWeightsSum > 0) {
                const realCpi = weightedSum / usedWeightsSum; // O / totalWeight dependiendo de la rigurosidad estadística deseada

                // 5. Guardar resultado en cpi_real_cpi (Upsert)
                const { error: upsertError } = await supabaseClient
                    .from('cpi_real_cpi')
                    .upsert({
                        country_id: country.country_id,
                        criterion_id: criterion.criterion_id,
                        month: month,
                        year: currentYear,
                        real_cpi_inflation_rate: realCpi,
                        update_date: new Date().toISOString()
                    }, { onConflict: 'country_id, criterion_id, month, year' });
                
                if (upsertError) {
                    console.error("Error guardando IRPC:", upsertError);
                } else {
                    processedCount++;
                    console.log(`IRPC calculado para ${country.country_name}, Criterio: ${criterion.criterion_name}, Mes: ${month}: ${realCpi.toFixed(4)}%`);
                }
            }
        }
      }
    }

    return new Response(JSON.stringify({ message: "Cálculo de IRPC completado", processed: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Error crítico en calculate-real-cpi:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

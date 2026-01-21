
/**
 * Motor de reglas biológicas para La Finquina
 * Genera sugerencias de tareas basadas en el tipo de cultivo y su edad.
 */

export const getAgendaSuggestions = (crops = []) => {
    const suggestions = [];
    const today = new Date();

    crops.forEach(crop => {
        if (!crop.plantedDate) return;

        const planted = new Date(crop.plantedDate);
        const daysSincePlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24));
        const name = crop.name.toLowerCase();

        // REGLAS PARA HUERTO (Hortalizas)
        if (crop.type === 'huerto') {
            // Reglas para Tomates
            if (name.includes('tomate')) {
                if (daysSincePlanting >= 15 && daysSincePlanting <= 25) {
                    suggestions.push({
                        id: `sug-tom-ent-${crop.id}`,
                        text: `Entutorar ${crop.name}`,
                        category: 'cultivo',
                        section: `Fila ${crop.row_number || '?'}`,
                        reason: "Hace ~20 días que plantaste, ya necesitan soporte."
                    });
                }
                if (daysSincePlanting >= 30 && daysSincePlanting <= 40) {
                    suggestions.push({
                        id: `sug-tom-abo-${crop.id}`,
                        text: `Abonado de cobertura para ${crop.name}`,
                        category: 'cultivo',
                        section: `Fila ${crop.row_number || '?'}`,
                        reason: "Etapa de pre-floración detectada."
                    });
                }
            }

            // Reglas para Lechugas
            if (name.includes('lechuga')) {
                if (daysSincePlanting >= 45 && daysSincePlanting <= 60) {
                    suggestions.push({
                        id: `sug-lec-cos-${crop.id}`,
                        text: `Vigilar punto de cosecha de ${crop.name}`,
                        category: 'cultivo',
                        section: `Fila ${crop.row_number || '?'}`,
                        reason: "Ciclo de maduración casi completado (~50 días)."
                    });
                }
            }

            // Reglas Generales de Huerto (Tratamientos)
            if (daysSincePlanting % 15 === 0 && daysSincePlanting > 0) {
                suggestions.push({
                    id: `sug-gen-pre-${crop.id}`,
                    text: `Revisión de plagas en ${crop.name}`,
                    category: 'mantenimiento',
                    section: `Fila ${crop.row_number || '?'}`,
                    reason: "Revisión quincenal de rutina recomendada."
                });
            }
        }

        // REGLAS PARA FRUTALES
        if (crop.type === 'frutal') {
            const month = today.getMonth(); // 0-11 (Enero es 0)

            // Regla de Poda (Invierno: Dic, Ene, Feb)
            if ([11, 0, 1].includes(month)) {
                suggestions.push({
                    id: `sug-fru-pod-${crop.id}`,
                    text: `Poda de invierno para ${crop.name}`,
                    category: 'mantenimiento',
                    section: crop.variety || 'Sector Frutales',
                    reason: "Estamos en parada vegetativa, momento ideal para podar."
                });
            }

            // Regla de Tratamiento de Invierno (Cobre/Aceite)
            if ([0, 1].includes(month)) {
                suggestions.push({
                    id: `sug-fru-inv-${crop.id}`,
                    text: `Tratamiento fitosanitario de invierno para ${crop.name}`,
                    category: 'mantenimiento',
                    section: crop.variety || 'Sector Frutales',
                    reason: "Prevenir huevos de pulgón y hongos invernales."
                });
            }
        }
    });

    return suggestions;
};

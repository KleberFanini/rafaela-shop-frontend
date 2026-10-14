/**
 * Mapeia nomes de cores (Português/Inglês, fitness e semijoias) para códigos hexadecimais ou gradientes CSS.
 */
export function getColorStyle(colorName?: string | null): string {
  if (!colorName) return '#9ca3af';
  const c = colorName.trim().toLowerCase();

  const exactMap: Record<string, string> = {
    // Básicos e Neutros
    'preto': '#111827',
    'preta': '#111827',
    'black': '#111827',
    'branco': '#ffffff',
    'branca': '#ffffff',
    'white': '#ffffff',
    'off white': '#f8fafc',
    'offwhite': '#f8fafc',
    'off-white': '#f8fafc',
    'gelo': '#f1f5f9',

    // Cinzas
    'cinza': '#6b7280',
    'cinza claro': '#d1d5db',
    'cinza escuro': '#374151',
    'chumbo': '#334155',
    'mescla': '#94a3b8',
    'grafite': '#1e293b',
    'gray': '#6b7280',
    'silver': '#cbd5e1',

    // Azuis
    'azul': '#2563eb',
    'azul marinho': '#1e3a8a',
    'marinho': '#1e3a8a',
    'azul bic': '#1d4ed8',
    'azul celeste': '#38bdf8',
    'azul bebê': '#bae6fd',
    'azul royal': '#1e40af',
    'azul petróleo': '#0e7490',
    'petróleo': '#0e7490',
    'navy': '#0f172a',
    'blue': '#2563eb',
    'turquesa': '#06b6d4',

    // Verdes
    'verde': '#16a34a',
    'verde militar': '#4d5b40',
    'militar': '#4d5b40',
    'verde oliva': '#556b2f',
    'oliva': '#556b2f',
    'verde bandeira': '#15803d',
    'verde esmeralda': '#059669',
    'esmeralda': '#059669',
    'verde água': '#5eead4',
    'menta': '#86efac',
    'lima': '#84cc16',
    'verde limão': '#a3e635',
    'green': '#16a34a',
    'musgo': '#3f4f2c',

    // Rosas & Vermelhos
    'rosa': '#f472b6',
    'rose': '#e8a598',
    'rosê': '#e8a598',
    'pink': '#ec4899',
    'rosa bebê': '#fbcfe8',
    'rosa chiclete': '#f472b6',
    'fúcsia': '#d946ef',
    'fucsia': '#d946ef',
    'magenta': '#d946ef',
    'vermelho': '#dc2626',
    'vermelha': '#dc2626',
    'red': '#dc2626',
    'vinho': '#7f1d1d',
    'bordeaux': '#581c87',
    'marsala': '#6b2144',
    'bordô': '#7f1d1d',
    'cereja': '#9f1239',
    'rubi': '#be123c',

    // Roxos & Lilás
    'roxo': '#9333ea',
    'lilás': '#c084fc',
    'lilas': '#c084fc',
    'lavanda': '#e9d5ff',
    'violeta': '#7c3aed',
    'ametista': '#8b5cf6',
    'purple': '#9333ea',

    // Amarelos & Laranjas
    'amarelo': '#facc15',
    'mostarda': '#ca8a04',
    'amarelo claro': '#fef08a',
    'amarelo neon': '#facc15',
    'laranja': '#f97316',
    'laranja neon': '#fb923c',
    'coral': '#fb7185',
    'terracota': '#c2410c',
    'salmão': '#fda4af',
    'salmao': '#fda4af',
    'pêssego': '#fed7aa',

    // Nudes & Terrosos
    'bege': '#d4b996',
    'nude': '#e2c9b4',
    'areia': '#e7d8c9',
    'creme': '#fef3c7',
    'marrom': '#78350f',
    'caramelo': '#b45309',
    'chocolate': '#451a03',
    'camel': '#c19a6b',
    'café': '#38220f',

    // Metálicos & Semijoias
    'dourado': 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
    'ouro': 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
    'gold': 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
    'ouro 18k': 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)',
    'prata': 'linear-gradient(135deg, #94a3b8, #e2e8f0, #cbd5e1)',
    'prateado': 'linear-gradient(135deg, #94a3b8, #e2e8f0, #cbd5e1)',
    'ouro rosé': 'linear-gradient(135deg, #fb7185, #f43f5e, #fda4af)',
    'ouro rose': 'linear-gradient(135deg, #fb7185, #f43f5e, #fda4af)',
    'ródio': '#94a3b8',
    'rodio': '#94a3b8',
    'ródio negro': '#334155',
    'bronze': '#b45309',

    // Estampados & Especiais
    'estampado': 'linear-gradient(135deg, #ec4899, #3b82f6, #eab308)',
    'estampada': 'linear-gradient(135deg, #ec4899, #3b82f6, #eab308)',
    'multicolor': 'linear-gradient(135deg, #ef4444, #3b82f6, #10b981)',
    'colorido': 'linear-gradient(135deg, #ef4444, #3b82f6, #10b981)',
    'tie dye': 'linear-gradient(135deg, #a855f7, #06b6d4, #f43f5e)',
    'onça': 'radial-gradient(circle, #78350f 25%, #d4b996 75%)',
    'animal print': 'radial-gradient(circle, #78350f 25%, #d4b996 75%)',
    'camuflado': 'linear-gradient(135deg, #4d5b40, #334155, #78350f)'
  };

  if (exactMap[c]) return exactMap[c];

  // Checagem parcial se o texto contém algum nome chave
  for (const [key, val] of Object.entries(exactMap)) {
    if (c.includes(key)) {
      return val;
    }
  }

  return '#9ca3af';
}

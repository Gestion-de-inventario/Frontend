export interface MenuTemplate {
  name: string;
  emoji: string;
  description: string;
  ingredients: TemplateIngredient[];
}

export interface TemplateIngredient {
  productName: string; // debe coincidir con el nombre en BD
  amount: number;
  unit: string;
}

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    name: 'Arroz con Pollo',
    emoji: '🍗',
    description: 'Clásico guiso con arroz y pollo',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'POLLO', amount: 8, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'ZANAHORIA', amount: 2, unit: 'kg' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Estofado de Carne',
    emoji: '🥩',
    description: 'Estofado con papa y arroz',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'CARNE', amount: 8, unit: 'kg' },
      { productName: 'PAPA', amount: 5, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Lentejas con Arroz',
    emoji: '🫘',
    description: 'Menestra de lentejas con arroz',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'LENTEJA', amount: 5, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Frejoles con Arroz',
    emoji: '🫘',
    description: 'Menestra de frejoles con arroz',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'FREJOL', amount: 5, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Garbanzos con Arroz',
    emoji: '🫘',
    description: 'Menestra de garbanzos con arroz',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'GARBANZOS', amount: 5, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Sopa de Sémola',
    emoji: '🍲',
    description: 'Sopa espesa de sémola con verduras',
    ingredients: [
      { productName: 'SÉMOLA', amount: 3, unit: 'kg' },
      { productName: 'PAPA', amount: 3, unit: 'kg' },
      { productName: 'ZANAHORIA', amount: 2, unit: 'kg' },
      { productName: 'CEBOLLA', amount: 1, unit: 'kg' },
      { productName: 'ACEITE', amount: 0.5, unit: 'l' },
    ],
  },
  {
    name: 'Crema de Zapallo',
    emoji: '🎃',
    description: 'Crema espesa de zapallo',
    ingredients: [
      { productName: 'ZAPALLO', amount: 8, unit: 'kg' },
      { productName: 'PAPA', amount: 3, unit: 'kg' },
      { productName: 'CEBOLLA', amount: 1, unit: 'kg' },
      { productName: 'ACEITE', amount: 0.5, unit: 'l' },
    ],
  },
  {
    name: 'Pescado con Arroz',
    emoji: '🐟',
    description: 'Latas de atún con arroz y ensalada',
    ingredients: [
      { productName: 'ARROZ', amount: 10, unit: 'kg' },
      { productName: 'LATAS DE ATUN', amount: 25, unit: 'und' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 2, unit: 'kg' },
    ],
  },
  {
    name: 'Fideos con Huevo',
    emoji: '🍝',
    description: 'Fideos guisados con huevo',
    ingredients: [
      { productName: 'FIDEOS', amount: 8, unit: 'kg' },
      { productName: 'HUEVO', amount: 50, unit: 'und' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
  {
    name: 'Chuño con Carne',
    emoji: '🥔',
    description: 'Guiso de chuño con carne',
    ingredients: [
      { productName: 'CHUÑO', amount: 5, unit: 'kg' },
      { productName: 'CARNE', amount: 6, unit: 'kg' },
      { productName: 'PAPA', amount: 4, unit: 'kg' },
      { productName: 'ACEITE', amount: 1, unit: 'l' },
      { productName: 'CEBOLLA', amount: 2, unit: 'kg' },
      { productName: 'TOMATE', amount: 1, unit: 'kg' },
    ],
  },
];
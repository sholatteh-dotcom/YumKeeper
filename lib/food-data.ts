export type StorageLocation = 'fridge' | 'freezer' | 'pantry' | 'cellar';
export type ExpiryStatus = 'fresh' | 'expiring_soon' | 'expired';

export interface FoodItem {
  id: string;
  name: string;
  category: StorageLocation;
  quantity: number;
  unit: string;
  purchaseDate: string; // ISO date string
  expiryDate: string;   // ISO date string
  notes?: string;
  emoji: string;
  preservationMethod?: string;
  createdAt: string;
}

export interface PreservationTip {
  id: string;
  title: string;
  description: string;
  category: PreservationCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: string;
  bestFoods: string[];
  steps: string[];
  equipment: string[];
  proTips: string[];
  emoji: string;
}

export type PreservationCategory =
  | 'all'
  | 'freezing'
  | 'canning'
  | 'pickling'
  | 'drying'
  | 'fermenting'
  | 'vacuum_sealing'
  | 'smoking';

export const UNITS = ['pcs', 'kg', 'g', 'lbs', 'oz', 'L', 'mL', 'cups', 'bunches', 'bags', 'cans', 'jars'];

export const STORAGE_LOCATIONS: { key: StorageLocation; label: string; emoji: string; color: string }[] = [
  { key: 'fridge', label: 'Fridge', emoji: '🧊', color: '#3B82F6' },
  { key: 'freezer', label: 'Freezer', emoji: '❄️', color: '#06B6D4' },
  { key: 'pantry', label: 'Pantry', emoji: '🏠', color: '#92400E' },
  { key: 'cellar', label: 'Cellar', emoji: '🍷', color: '#7C3AED' },
];

export const FOOD_SUGGESTIONS: { name: string; emoji: string; defaultDays: number; category: StorageLocation }[] = [
  { name: 'Apples', emoji: '🍎', defaultDays: 30, category: 'fridge' },
  { name: 'Bananas', emoji: '🍌', defaultDays: 5, category: 'pantry' },
  { name: 'Strawberries', emoji: '🍓', defaultDays: 5, category: 'fridge' },
  { name: 'Blueberries', emoji: '🫐', defaultDays: 7, category: 'fridge' },
  { name: 'Grapes', emoji: '🍇', defaultDays: 10, category: 'fridge' },
  { name: 'Oranges', emoji: '🍊', defaultDays: 21, category: 'fridge' },
  { name: 'Lemons', emoji: '🍋', defaultDays: 21, category: 'fridge' },
  { name: 'Tomatoes', emoji: '🍅', defaultDays: 7, category: 'pantry' },
  { name: 'Carrots', emoji: '🥕', defaultDays: 21, category: 'fridge' },
  { name: 'Broccoli', emoji: '🥦', defaultDays: 5, category: 'fridge' },
  { name: 'Spinach', emoji: '🥬', defaultDays: 5, category: 'fridge' },
  { name: 'Lettuce', emoji: '🥗', defaultDays: 7, category: 'fridge' },
  { name: 'Cucumber', emoji: '🥒', defaultDays: 7, category: 'fridge' },
  { name: 'Bell Pepper', emoji: '🫑', defaultDays: 10, category: 'fridge' },
  { name: 'Onions', emoji: '🧅', defaultDays: 60, category: 'pantry' },
  { name: 'Garlic', emoji: '🧄', defaultDays: 90, category: 'pantry' },
  { name: 'Potatoes', emoji: '🥔', defaultDays: 30, category: 'pantry' },
  { name: 'Chicken Breast', emoji: '🍗', defaultDays: 2, category: 'fridge' },
  { name: 'Ground Beef', emoji: '🥩', defaultDays: 2, category: 'fridge' },
  { name: 'Salmon', emoji: '🐟', defaultDays: 2, category: 'fridge' },
  { name: 'Eggs', emoji: '🥚', defaultDays: 21, category: 'fridge' },
  { name: 'Milk', emoji: '🥛', defaultDays: 7, category: 'fridge' },
  { name: 'Cheese', emoji: '🧀', defaultDays: 14, category: 'fridge' },
  { name: 'Yogurt', emoji: '🫙', defaultDays: 14, category: 'fridge' },
  { name: 'Butter', emoji: '🧈', defaultDays: 30, category: 'fridge' },
  { name: 'Bread', emoji: '🍞', defaultDays: 5, category: 'pantry' },
  { name: 'Rice', emoji: '🍚', defaultDays: 365, category: 'pantry' },
  { name: 'Pasta', emoji: '🍝', defaultDays: 730, category: 'pantry' },
  { name: 'Olive Oil', emoji: '🫒', defaultDays: 365, category: 'pantry' },
  { name: 'Honey', emoji: '🍯', defaultDays: 1825, category: 'pantry' },
  { name: 'Frozen Peas', emoji: '🟢', defaultDays: 180, category: 'freezer' },
  { name: 'Ice Cream', emoji: '🍦', defaultDays: 60, category: 'freezer' },
  { name: 'Frozen Pizza', emoji: '🍕', defaultDays: 90, category: 'freezer' },
];

export const PRESERVATION_TIPS: PreservationTip[] = [
  {
    id: 'freezing-basics',
    title: 'Freezing Basics',
    description: 'Freezing is one of the simplest and most effective preservation methods, locking in nutrients and flavor for months.',
    category: 'freezing',
    difficulty: 'Easy',
    timeRequired: '15–30 min',
    bestFoods: ['Berries', 'Vegetables', 'Meat', 'Bread', 'Soups'],
    steps: [
      'Clean and prepare your food — wash, peel, and cut as needed.',
      'Blanch vegetables in boiling water for 2–5 minutes to preserve color and nutrients.',
      'Cool quickly in an ice bath to stop the cooking process.',
      'Pat dry thoroughly — excess moisture causes freezer burn.',
      'Portion into meal-sized amounts before freezing.',
      'Use freezer-safe bags or containers, removing as much air as possible.',
      'Label with the food name and date before placing in freezer.',
      'Freeze at 0°F (−18°C) or below.',
    ],
    equipment: ['Freezer bags', 'Airtight containers', 'Permanent marker', 'Ice bath bowl'],
    proTips: [
      'Flash-freeze berries on a baking sheet before bagging to prevent clumping.',
      'Freeze soups and sauces in ice cube trays for easy portioning.',
      'Most vegetables last 8–12 months; meat up to 12 months.',
    ],
    emoji: '❄️',
  },
  {
    id: 'water-bath-canning',
    title: 'Water Bath Canning',
    description: 'A classic method for high-acid foods like jams, jellies, and pickles that creates a vacuum seal for long shelf life.',
    category: 'canning',
    difficulty: 'Medium',
    timeRequired: '1–3 hours',
    bestFoods: ['Tomatoes', 'Jams', 'Jellies', 'Pickles', 'Fruit'],
    steps: [
      'Sterilize jars and lids in boiling water for 10 minutes.',
      'Prepare your recipe — cook fruit, make jam, or prepare pickles.',
      'Fill hot jars with hot food, leaving ¼ inch headspace.',
      'Remove air bubbles by running a thin spatula around the inside.',
      'Wipe jar rims clean with a damp cloth.',
      'Apply lids and rings — finger-tight only.',
      'Lower jars into boiling water bath, ensuring they are covered by 1–2 inches of water.',
      'Process for the time specified in your recipe.',
      'Remove and cool on a towel for 12–24 hours. Check seals.',
    ],
    equipment: ['Canning jars with lids', 'Large pot with rack', 'Jar lifter', 'Funnel', 'Bubble remover'],
    proTips: [
      'Only use tested recipes for safe canning — improper acidity can cause spoilage.',
      'A properly sealed lid will not flex when pressed in the center.',
      'Sealed jars last 1–2 years in a cool, dark pantry.',
    ],
    emoji: '🫙',
  },
  {
    id: 'quick-pickling',
    title: 'Quick Pickling',
    description: 'Create tangy, crunchy pickled vegetables in just 24 hours using a simple vinegar brine — no canning required.',
    category: 'pickling',
    difficulty: 'Easy',
    timeRequired: '20 min + 24h rest',
    bestFoods: ['Cucumbers', 'Onions', 'Carrots', 'Radishes', 'Jalapeños'],
    steps: [
      'Wash and slice vegetables into desired shapes.',
      'Pack tightly into clean glass jars.',
      'Combine 1 cup vinegar, 1 cup water, 1 tbsp salt, 1 tbsp sugar in a saucepan.',
      'Add spices: garlic, peppercorns, dill, or chili flakes.',
      'Bring brine to a boil, stirring until salt and sugar dissolve.',
      'Pour hot brine over vegetables, leaving ½ inch headspace.',
      'Let cool to room temperature, then seal and refrigerate.',
      'Wait at least 24 hours before eating for best flavor.',
    ],
    equipment: ['Glass jars with lids', 'Saucepan', 'Measuring cups', 'Knife and cutting board'],
    proTips: [
      'Use white or apple cider vinegar (5% acidity) for best results.',
      'Quick pickles last 2–4 weeks in the refrigerator.',
      'Add a grape leaf or oak leaf to keep pickles crispy.',
    ],
    emoji: '🥒',
  },
  {
    id: 'dehydrating',
    title: 'Food Dehydrating',
    description: 'Remove moisture from foods to create lightweight, shelf-stable snacks and ingredients that last for months.',
    category: 'drying',
    difficulty: 'Easy',
    timeRequired: '4–12 hours',
    bestFoods: ['Fruits', 'Vegetables', 'Herbs', 'Mushrooms', 'Jerky'],
    steps: [
      'Wash and prepare food — slice uniformly for even drying (⅛ to ¼ inch thick).',
      'Pretreat fruits: dip in lemon juice to prevent browning.',
      'Blanch vegetables briefly to preserve color and speed drying.',
      'Arrange in a single layer on dehydrator trays without overlapping.',
      'Set dehydrator to appropriate temperature: 125°F for fruits, 135°F for vegetables.',
      'Dry until leathery and pliable (fruits) or crisp and brittle (vegetables).',
      'Cool completely before storing to prevent condensation.',
      'Store in airtight containers away from light and heat.',
    ],
    equipment: ['Food dehydrator or oven', 'Mandoline slicer', 'Airtight containers', 'Parchment paper'],
    proTips: [
      'Oven-dry at lowest setting (170°F) with door slightly ajar if no dehydrator.',
      'Properly dried foods last 6–12 months at room temperature.',
      'Vacuum seal for even longer shelf life.',
    ],
    emoji: '☀️',
  },
  {
    id: 'lacto-fermentation',
    title: 'Lacto-Fermentation',
    description: 'Harness beneficial bacteria to ferment vegetables naturally, creating probiotic-rich foods with complex flavors.',
    category: 'fermenting',
    difficulty: 'Medium',
    timeRequired: '3–7 days',
    bestFoods: ['Cabbage', 'Carrots', 'Beets', 'Garlic', 'Green Beans'],
    steps: [
      'Shred or chop vegetables finely.',
      'Weigh vegetables and calculate 2% of their weight in salt.',
      'Massage salt into vegetables until they release liquid (10–15 minutes).',
      'Pack tightly into a clean jar, pressing down until liquid covers vegetables.',
      'Leave 1–2 inches headspace — vegetables will expand.',
      'Cover loosely (not airtight) to allow CO₂ to escape.',
      'Keep at room temperature (65–75°F) for 3–7 days.',
      'Taste daily — move to fridge when desired sourness is reached.',
    ],
    equipment: ['Wide-mouth glass jar', 'Kitchen scale', 'Non-iodized salt', 'Fermentation weight (optional)'],
    proTips: [
      'Use non-iodized salt — iodine inhibits fermentation.',
      'Vegetables must stay submerged under brine to prevent mold.',
      'Fermented vegetables last months in the refrigerator.',
    ],
    emoji: '🧫',
  },
  {
    id: 'vacuum-sealing',
    title: 'Vacuum Sealing',
    description: 'Remove air from packaging to dramatically extend shelf life for both refrigerated and frozen foods.',
    category: 'vacuum_sealing',
    difficulty: 'Easy',
    timeRequired: '5–15 min',
    bestFoods: ['Meat', 'Cheese', 'Nuts', 'Coffee', 'Dried Foods'],
    steps: [
      'Ensure food is clean, dry, and at the right temperature.',
      'Cut vacuum seal bag to appropriate size, leaving 3 inches above food.',
      'Place food inside bag in a single layer when possible.',
      'For liquids or moist foods, freeze first before vacuum sealing.',
      'Insert open end into vacuum sealer.',
      'Run the vacuum and seal cycle according to machine instructions.',
      'Check seal is complete and airtight.',
      'Label with contents and date before storing.',
    ],
    equipment: ['Vacuum sealer machine', 'Vacuum seal bags or rolls', 'Permanent marker'],
    proTips: [
      'Vacuum-sealed frozen meat lasts 2–3 years vs. 6 months in regular bags.',
      'Add a paper towel inside the bag to absorb excess moisture.',
      'Vacuum-sealed dry goods last 3–5 times longer than regular storage.',
    ],
    emoji: '🔒',
  },
  {
    id: 'cold-smoking',
    title: 'Cold Smoking',
    description: 'Infuse foods with smoky flavor and natural preservatives at low temperatures without cooking.',
    category: 'smoking',
    difficulty: 'Hard',
    timeRequired: '2–24 hours',
    bestFoods: ['Salmon', 'Cheese', 'Nuts', 'Salt', 'Butter'],
    steps: [
      'Cure food first with salt or brine for 12–24 hours.',
      'Rinse and pat dry, then air-dry in refrigerator until surface is tacky (pellicle forms).',
      'Set up cold smoker — temperature must stay below 90°F (32°C).',
      'Choose wood chips: alder for fish, apple for cheese, hickory for meat.',
      'Place food in smoker away from direct heat source.',
      'Smoke for 2–4 hours for mild flavor, up to 24 hours for intense smoke.',
      'Wrap in butcher paper and refrigerate for 24 hours to allow smoke to mellow.',
      'Store in refrigerator or vacuum seal for longer storage.',
    ],
    equipment: ['Cold smoker or smoke generator', 'Wood chips', 'Thermometer', 'Butcher paper'],
    proTips: [
      'Cold smoking does not cook food — always cure or cook before consuming.',
      'Smoked salmon lasts 2–3 weeks refrigerated or 3 months frozen.',
      'Start with cheese — it is the easiest cold-smoking project.',
    ],
    emoji: '💨',
  },
  {
    id: 'root-cellaring',
    title: 'Root Cellaring',
    description: 'Store root vegetables and fruits in cool, humid conditions to extend their natural shelf life through winter.',
    category: 'drying',
    difficulty: 'Easy',
    timeRequired: '30 min setup',
    bestFoods: ['Potatoes', 'Carrots', 'Beets', 'Apples', 'Cabbage'],
    steps: [
      'Choose a cool (32–40°F), humid (85–95% humidity) location.',
      'Inspect all produce — remove any damaged or bruised items.',
      'Do not wash produce before storing — leave soil on root vegetables.',
      'Pack root vegetables in boxes with damp sand, sawdust, or straw.',
      'Store apples and pears separately — they emit ethylene gas.',
      'Check stored produce monthly and remove any that show signs of rot.',
      'Keep records of what is stored and when.',
    ],
    equipment: ['Wooden crates or boxes', 'Damp sand or sawdust', 'Thermometer', 'Hygrometer'],
    proTips: [
      'Potatoes need darkness — light causes them to turn green and produce solanine.',
      'Apples stored with potatoes will cause potatoes to sprout faster.',
      'Properly stored root vegetables can last 4–6 months.',
    ],
    emoji: '🥕',
  },
];

export const FOOD_STORAGE_TIPS: Record<string, string[]> = {
  default: [
    'Store in an airtight container to prevent moisture and odors.',
    'Keep away from direct sunlight and heat sources.',
    'Check regularly for signs of spoilage.',
  ],
  fridge: [
    'Keep your fridge at 35–38°F (1.7–3.3°C) for optimal freshness.',
    'Store raw meat on the bottom shelf to prevent cross-contamination.',
    'Keep fruits and vegetables in separate crisper drawers.',
  ],
  freezer: [
    'Maintain freezer at 0°F (-18°C) or below.',
    'Label all items with name and date before freezing.',
    'Use within recommended timeframes for best quality.',
  ],
  pantry: [
    'Store in a cool, dry place away from heat and light.',
    'Use FIFO (First In, First Out) — use older items before newer ones.',
    'Keep in original packaging or airtight containers.',
  ],
  cellar: [
    'Maintain cool temperature (50–60°F / 10–15°C) and high humidity.',
    'Check stored items monthly for signs of spoilage.',
    'Keep good ventilation to prevent mold growth.',
  ],
};

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const diffDays = getDaysRemaining(expiryDate);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring_soon';
  return 'fresh';
}

export function getDaysRemaining(expiryDate: string): number {
  const todayStr = new Date().toISOString().split('T')[0];
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [ey, em, ed] = expiryDate.split('-').map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const expiryMs = Date.UTC(ey, em - 1, ed);
  return Math.round((expiryMs - todayMs) / (1000 * 60 * 60 * 24));
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `${days} days left`;
}

export function getStatusColor(status: ExpiryStatus, colors: { success: string; warning: string; error: string }): string {
  switch (status) {
    case 'fresh': return colors.success;
    case 'expiring_soon': return colors.warning;
    case 'expired': return colors.error;
  }
}

export function getFoodEmoji(name: string): string {
  const suggestion = FOOD_SUGGESTIONS.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (suggestion) return suggestion.emoji;
  const lower = name.toLowerCase();
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('chicken') || lower.includes('poultry')) return '🍗';
  if (lower.includes('beef') || lower.includes('steak')) return '🥩';
  if (lower.includes('fish') || lower.includes('salmon')) return '🐟';
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('bread')) return '🍞';
  if (lower.includes('cheese')) return '🧀';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('carrot')) return '🥕';
  if (lower.includes('broccoli')) return '🥦';
  if (lower.includes('lemon')) return '🍋';
  if (lower.includes('orange')) return '🍊';
  if (lower.includes('grape')) return '🍇';
  if (lower.includes('strawberr')) return '🍓';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('rice')) return '🍚';
  if (lower.includes('pasta')) return '🍝';
  if (lower.includes('oil')) return '🫒';
  if (lower.includes('honey')) return '🍯';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('yogurt')) return '🫙';
  return '🥫';
}

// ─── Barcode Lookup Table ─────────────────────────────────────────────────────
// Maps common product barcodes to food suggestions
export const BARCODE_LOOKUP: Record<string, { name: string; emoji: string; defaultDays: number; category: StorageLocation }> = {
  // Common EAN-13 / UPC barcodes (sample set for demo purposes)
  '5000112637922': { name: 'Coca-Cola', emoji: '🥤', defaultDays: 365, category: 'pantry' },
  '5449000000996': { name: 'Coca-Cola Zero', emoji: '🥤', defaultDays: 365, category: 'pantry' },
  '5000112548167': { name: 'Sprite', emoji: '🥤', defaultDays: 365, category: 'pantry' },
  '4006381333931': { name: 'Haribo Gummies', emoji: '🍬', defaultDays: 180, category: 'pantry' },
  '0016000275287': { name: 'Cheerios', emoji: '🥣', defaultDays: 270, category: 'pantry' },
  '0038000845024': { name: 'Kellogg\'s Corn Flakes', emoji: '🥣', defaultDays: 270, category: 'pantry' },
  '0041196898818': { name: 'Orange Juice', emoji: '🍊', defaultDays: 7, category: 'fridge' },
  '0070470003016': { name: 'Whole Milk', emoji: '🥛', defaultDays: 7, category: 'fridge' },
  '0011110038364': { name: 'Greek Yogurt', emoji: '🫙', defaultDays: 14, category: 'fridge' },
  '0052100004396': { name: 'Cheddar Cheese', emoji: '🧀', defaultDays: 30, category: 'fridge' },
  '0021130126026': { name: 'Sliced Bread', emoji: '🍞', defaultDays: 7, category: 'pantry' },
  '0041415014529': { name: 'Peanut Butter', emoji: '🥜', defaultDays: 365, category: 'pantry' },
  '0041196897132': { name: 'Apple Juice', emoji: '🍎', defaultDays: 7, category: 'fridge' },
  '5010477348428': { name: 'Heinz Baked Beans', emoji: '🫘', defaultDays: 730, category: 'pantry' },
  '5000157024466': { name: 'Heinz Tomato Ketchup', emoji: '🍅', defaultDays: 365, category: 'pantry' },
};

// ─── Meal Recipes for "Use It Up" ─────────────────────────────────────────────
export interface MealRecipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  keyIngredients: string[]; // ingredient names that trigger this recipe
  allIngredients: string[];
  steps: string[];
  tips: string;
  tags: string[];
}

export const MEAL_RECIPES: MealRecipe[] = [
  {
    id: 'stir-fry',
    name: 'Quick Veggie Stir-Fry',
    emoji: '🥘',
    description: 'A fast and flavorful stir-fry perfect for using up vegetables before they go bad.',
    prepTime: '15 min',
    difficulty: 'Easy',
    servings: 2,
    keyIngredients: ['Broccoli', 'Carrots', 'Bell Pepper', 'Spinach', 'Onions', 'Garlic'],
    allIngredients: ['2 cups mixed vegetables', '2 cloves garlic', '2 tbsp soy sauce', '1 tbsp olive oil', '1 tsp ginger', 'Rice or noodles to serve'],
    steps: [
      'Heat oil in a wok or large pan over high heat.',
      'Add garlic and ginger, stir for 30 seconds until fragrant.',
      'Add harder vegetables (carrots, broccoli) first and stir-fry for 3 minutes.',
      'Add softer vegetables (bell pepper, spinach) and stir-fry for 2 more minutes.',
      'Add soy sauce and toss to combine.',
      'Serve immediately over rice or noodles.',
    ],
    tips: 'Keep the heat high and keep everything moving for the best texture.',
    tags: ['vegetarian', 'quick', 'healthy'],
  },
  {
    id: 'frittata',
    name: 'Leftover Frittata',
    emoji: '🍳',
    description: 'A versatile egg dish that works with almost any vegetables or cheese you have on hand.',
    prepTime: '20 min',
    difficulty: 'Easy',
    servings: 4,
    keyIngredients: ['Eggs', 'Cheese', 'Spinach', 'Tomatoes', 'Bell Pepper', 'Onions'],
    allIngredients: ['6 eggs', '1/4 cup milk', '1 cup mixed vegetables', '1/2 cup cheese', 'Salt and pepper', '1 tbsp olive oil'],
    steps: [
      'Preheat oven to 375°F (190°C).',
      'Whisk eggs with milk, salt, and pepper in a bowl.',
      'Heat oil in an oven-safe skillet over medium heat.',
      'Sauté vegetables until softened, about 5 minutes.',
      'Pour egg mixture over vegetables and cook until edges set, 3-4 minutes.',
      'Sprinkle cheese on top and transfer to oven.',
      'Bake for 10-12 minutes until fully set and golden.',
    ],
    tips: 'Any combination of vegetables works — this is the perfect clean-out-the-fridge meal.',
    tags: ['vegetarian', 'protein', 'brunch'],
  },
  {
    id: 'banana-bread',
    name: 'Overripe Banana Bread',
    emoji: '🍌',
    description: 'The best use for bananas that are too ripe to eat — they make the sweetest, moistest bread.',
    prepTime: '65 min',
    difficulty: 'Easy',
    servings: 8,
    keyIngredients: ['Bananas'],
    allIngredients: ['3 very ripe bananas', '1/3 cup melted butter', '3/4 cup sugar', '1 egg', '1 tsp vanilla', '1 tsp baking soda', '1.5 cups flour'],
    steps: [
      'Preheat oven to 350°F (175°C). Grease a loaf pan.',
      'Mash bananas in a large bowl until smooth.',
      'Mix in melted butter, sugar, egg, and vanilla.',
      'Stir in baking soda and a pinch of salt.',
      'Fold in flour until just combined — do not overmix.',
      'Pour into loaf pan and bake for 55-65 minutes.',
      'Cool for 10 minutes before slicing.',
    ],
    tips: 'The blacker the banana, the sweeter and more flavorful the bread.',
    tags: ['baking', 'sweet', 'snack'],
  },
  {
    id: 'chicken-soup',
    name: 'Simple Chicken Soup',
    emoji: '🍲',
    description: 'A comforting soup that makes the most of chicken and any vegetables you have.',
    prepTime: '40 min',
    difficulty: 'Easy',
    servings: 4,
    keyIngredients: ['Chicken Breast', 'Carrots', 'Onions', 'Garlic', 'Potatoes'],
    allIngredients: ['500g chicken breast', '2 carrots, sliced', '2 stalks celery', '1 onion, diced', '3 cloves garlic', '1L chicken broth', 'Salt, pepper, herbs'],
    steps: [
      'Dice chicken into bite-sized pieces.',
      'Sauté onion and garlic in a large pot until soft.',
      'Add chicken and cook until no longer pink, about 5 minutes.',
      'Add carrots, celery, and broth. Bring to a boil.',
      'Reduce heat and simmer for 20 minutes.',
      'Season with salt, pepper, and herbs to taste.',
      'Serve with crusty bread.',
    ],
    tips: 'Add noodles or rice in the last 10 minutes for a heartier meal.',
    tags: ['protein', 'comfort', 'winter'],
  },
  {
    id: 'berry-smoothie',
    name: 'Berry Preservation Smoothie',
    emoji: '🫐',
    description: 'Blend up berries that are about to go bad into a delicious smoothie or freeze for later.',
    prepTime: '5 min',
    difficulty: 'Easy',
    servings: 2,
    keyIngredients: ['Strawberries', 'Blueberries', 'Bananas', 'Grapes'],
    allIngredients: ['2 cups mixed berries', '1 banana', '1 cup yogurt or milk', '1 tbsp honey', 'Ice cubes'],
    steps: [
      'Wash and hull berries.',
      'Add all ingredients to a blender.',
      'Blend on high until smooth.',
      'Taste and adjust sweetness with honey.',
      'Serve immediately or pour into ice cube trays to freeze for later.',
    ],
    tips: 'Freeze the smoothie in ice cube trays — pop them out and blend for a quick frozen treat later.',
    tags: ['healthy', 'quick', 'vegan'],
  },
  {
    id: 'tomato-sauce',
    name: 'Fresh Tomato Sauce',
    emoji: '🍅',
    description: 'Transform ripe or overripe tomatoes into a rich pasta sauce that can be frozen for months.',
    prepTime: '45 min',
    difficulty: 'Easy',
    servings: 6,
    keyIngredients: ['Tomatoes', 'Garlic', 'Onions'],
    allIngredients: ['1kg ripe tomatoes', '4 cloves garlic', '1 onion', '2 tbsp olive oil', 'Fresh basil', 'Salt and pepper', '1 tsp sugar'],
    steps: [
      'Score tomatoes with an X and blanch in boiling water for 30 seconds.',
      'Peel, deseed, and roughly chop the tomatoes.',
      'Sauté onion and garlic in olive oil until soft.',
      'Add tomatoes and bring to a simmer.',
      'Cook for 30 minutes, stirring occasionally, until thickened.',
      'Add fresh basil, season with salt, pepper, and sugar.',
      'Use immediately or freeze in portions for up to 3 months.',
    ],
    tips: 'This sauce freezes beautifully — make a big batch when tomatoes are plentiful.',
    tags: ['vegan', 'freezable', 'Italian'],
  },
  {
    id: 'fried-rice',
    name: 'Leftover Fried Rice',
    emoji: '🍚',
    description: 'Day-old rice is actually perfect for fried rice — it fries up crispier than fresh rice.',
    prepTime: '15 min',
    difficulty: 'Easy',
    servings: 3,
    keyIngredients: ['Rice', 'Eggs', 'Carrots', 'Onions', 'Garlic'],
    allIngredients: ['3 cups cooked rice (day-old)', '2 eggs', '1 cup mixed vegetables', '3 tbsp soy sauce', '2 cloves garlic', '2 tbsp sesame oil'],
    steps: [
      'Heat oil in a wok or large skillet over high heat.',
      'Add garlic and stir-fry for 30 seconds.',
      'Add vegetables and cook for 2-3 minutes.',
      'Push everything to the side and scramble eggs in the pan.',
      'Add rice and break up any clumps.',
      'Add soy sauce and sesame oil, toss everything together.',
      'Cook for 3-4 minutes until rice is heated through and slightly crispy.',
    ],
    tips: 'The key to great fried rice is high heat and not stirring too much — let it get a little crispy.',
    tags: ['quick', 'Asian', 'budget'],
  },
  {
    id: 'bread-pudding',
    name: 'Stale Bread Pudding',
    emoji: '🍞',
    description: 'Transform stale bread into a rich, custardy dessert that tastes like it took all day.',
    prepTime: '55 min',
    difficulty: 'Medium',
    servings: 6,
    keyIngredients: ['Bread', 'Eggs', 'Milk', 'Butter'],
    allIngredients: ['6 slices stale bread', '3 eggs', '2 cups milk', '1/4 cup sugar', '2 tbsp butter', '1 tsp vanilla', '1 tsp cinnamon'],
    steps: [
      'Preheat oven to 350°F (175°C). Butter a baking dish.',
      'Tear bread into chunks and place in the baking dish.',
      'Whisk eggs, milk, sugar, vanilla, and cinnamon together.',
      'Pour custard mixture over bread and press down gently.',
      'Let soak for 15 minutes.',
      'Dot with butter and bake for 35-40 minutes until golden and set.',
      'Serve warm with cream or ice cream.',
    ],
    tips: 'The staler the bread, the better it absorbs the custard. Day-old croissants make an incredible version.',
    tags: ['dessert', 'baking', 'comfort'],
  },
];

// Get recipes that match expiring food items
export function getMatchingRecipes(expiringFoodNames: string[]): MealRecipe[] {
  if (expiringFoodNames.length === 0) return [];
  const lowerNames = expiringFoodNames.map(n => n.toLowerCase());
  return MEAL_RECIPES.filter(recipe =>
    recipe.keyIngredients.some(ingredient =>
      lowerNames.some(name =>
        name.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(name)
      )
    )
  );
}

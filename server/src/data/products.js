// category|name|brand|price|discountPrice|stock|weight|unit|flags(featured,bestSeller,newArrival)|description|imageUrl(optional)
const RAW = `Rice|Premium Miniket Rice|Pran|620|590|40|5|kg|110|Fine-grain miniket rice, polished and ready for daily cooking.|https://i.ibb.co.com/4RPmPzM6/Natural-Miniket-Rice.jpg
Rice|Basmati Rice|Kohinoor|780|0|35|5|kg|100|Long-grain aromatic basmati rice, ideal for biryani and pulao.
Rice|Chinigura Rice|ACI|190|0|50|1|kg|001|Fragrant short-grain rice, perfect for polao and payesh.
Flour & Atta|Whole Wheat Atta|Fresh|150|140|60|2|kg|010|Whole wheat atta, stone-ground for soft rotis every time.
Flour & Atta|All-Purpose Maida|Teer|70|0|55|1|kg|000|Fine refined flour for parathas, naan and baking.
Flour & Atta|Fine Suji|Fresh|75|0|45|1|kg|000|Fine roasted suji, perfect for halwa and breakfast dishes.
Lentils|Red Lentils (Masoor Dal)|Pran|135|0|70|1|kg|110|Cleaned split red lentils, quick-cooking and protein-rich.
Lentils|Yellow Split Peas (Motor Dal)|Teer|110|0|40|1|kg|000|Hulled yellow split peas for hearty everyday dal.
Lentils|Black Gram (Kalai Dal)|ACI|160|0|30|1|kg|001|Whole black gram lentils for traditional dishes.
Cooking Oil|Soybean Cooking Oil|Rupchanda|990|950|80|5|l|110|Refined soybean oil, light and suitable for daily cooking.
Cooking Oil|Mustard Oil|Radhuni|230|0|45|1|l|000|Cold-pressed mustard oil with a bold, authentic aroma.
Cooking Oil|Sunflower Oil|Teer|850|0|25|5|l|001|Light sunflower oil, ideal for frying and everyday cooking.
Ghee|Pure Cow Ghee|Aarong|520|0|30|500|g|100|Traditional clarified butter ghee, rich in flavour.
Ghee|Vegetable Ghee|Fresh|340|0|40|500|g|000|Blended vegetable ghee for everyday cooking.
Ghee|Premium Desi Ghee|Milk Vita|610|580|20|1|kg|010|Slow-simmered desi ghee with a rich aroma.
Salt|Iodized Salt|ACI Pure|40|0|100|1|kg|000|Fine iodized salt for everyday cooking needs.
Salt|Rock Salt|Radhuni|60|0|35|500|g|000|Natural rock salt for special dishes.
Salt|Table Salt Fine|Fresh|35|0|90|1|kg|001|Free-flowing fine table salt.
Sugar|White Sugar|Fresh|130|0|100|1|kg|010|Refined granulated sugar, clean and free-flowing.
Sugar|Brown Sugar|Pran|150|0|40|1|kg|000|Unrefined brown sugar with a natural molasses note.
Sugar|Icing Sugar|ACI|110|0|25|500|g|001|Fine icing sugar for baking and desserts.
Spices|Turmeric Powder|Radhuni|70|0|60|200|g|000|Pure ground turmeric with vibrant colour and aroma.
Spices|Red Chili Powder|Pran|85|0|60|200|g|010|Finely ground red chili for a spicy kick.
Spices|Mixed Whole Spices (Garam Masala)|Radhuni|180|0|40|200|g|100|A blend of whole spices for authentic home cooking.
Spices|Cumin Powder|ACI|95|0|35|200|g|001|Aromatic roasted cumin powder.
Tea|Premium Black Tea|Ispahani|260|0|70|400|g|110|Strong, aromatic black tea leaves for the perfect cup.
Tea|Green Tea Bags|Ispahani Mirzapore|220|200|30|100|pcs|001|Light, refreshing green tea bags.
Tea|CTC Tea Dust|Danish|210|0|45|400|g|000|Bold CTC tea dust for a strong morning cup.
Coffee|Instant Coffee|Nescafe|340|0|50|100|g|100|Smooth instant coffee granules, ready in seconds.
Coffee|Ground Coffee|Tasty|380|350|25|200|g|001|Medium roast ground coffee for filter brewing.
Coffee|3-in-1 Coffee Mix|Nescafe|260|0|60|10|pack|010|Convenient 3-in-1 coffee, milk and sugar mix.
Milk Powder|Full Cream Milk Powder|Marks|480|0|55|500|g|100|Full-cream milk powder, easy to mix for daily use.
Milk Powder|Instant Milk Powder|Diploma|900|850|30|1|kg|010|Instant full-cream milk powder for the whole family.
Milk Powder|Skimmed Milk Powder|Fresh|420|0|20|500|g|001|Low-fat skimmed milk powder.
Beverages|Mixed Fruit Juice|Pran Frutika|150|0|60|1|l|010|Refreshing mixed fruit juice with no added preservatives.
Beverages|Mango Juice|Pran|140|0|65|1|l|100|Rich, sweet mango juice made from real pulp.
Beverages|Energy Drink|Speed|60|0|80|250|ml|001|Refreshing energy drink for an instant boost.
Soft Drinks|Cola Soft Drink|Coca-Cola|110|0|90|1.5|l|110|Classic fizzy cola, chilled and ready to serve.
Soft Drinks|Lemon Lime Soda|Sprite|100|0|70|1.5|l|000|Crisp, refreshing lemon-lime soda.
Soft Drinks|Orange Soda|Mirinda|100|0|65|1.5|l|001|Fizzy orange-flavoured soft drink.
Mineral Water|Mineral Water|Mum|30|0|200|1.5|l|010|Purified mineral water, safe and refreshing.
Mineral Water|Mineral Water 5L Jar|Aquafina|90|0|60|5|l|000|Large 5L jar of purified drinking water.
Mineral Water|Sparkling Water|Mojo|45|0|40|500|ml|001|Lightly carbonated mineral water.
Biscuits|Cream Biscuits|Olympic|60|0|100|200|g|010|Crunchy cream-filled biscuits, great with tea.
Biscuits|Digestive Biscuits|Nabisco|130|120|45|300|g|100|Wholesome digestive biscuits, lightly sweetened.
Biscuits|Glucose Biscuits|Pran|40|0|120|200|g|000|Classic glucose biscuits for a quick energy snack.
Snacks|Potato Chips|Lays|90|0|90|150|g|100|Crispy salted potato chips, lightly seasoned.
Snacks|Spicy Chanachur|Bombay Sweets|80|0|75|200|g|010|Crunchy, spicy mixture snack.
Snacks|Roasted Peanuts|Pran|70|0|55|200|g|001|Lightly salted roasted peanuts.
Noodles|Instant Noodles (5-pack)|Mama|110|0|100|5|pack|110|Quick-cook instant noodles with rich masala flavour.
Noodles|Chow Mein Noodles|Mr. Noodles|95|0|50|300|g|000|Stir-fry style noodles for a quick chow mein.
Noodles|Rice Noodles|Kokoyo|120|0|30|300|g|001|Thin rice noodles for soups and stir-fries.
Breakfast Items|Corn Flakes|Kellogg's|320|300|40|375|g|100|Crispy corn flakes for a light breakfast.
Breakfast Items|Muesli|Pran|280|0|25|400|g|001|Wholesome muesli with fruit and grains.
Breakfast Items|Vermicelli (Shemai)|Kajal|65|0|60|200|g|000|Fine roasted vermicelli for festive breakfasts.
Honey|Natural Honey|Apis|420|0|35|400|g|110|Pure, raw honey sourced from local apiaries.
Honey|Sundarban Honey|Shamuk|550|500|20|500|g|001|Wild forest honey from the Sundarbans.
Dates|Ajwa Dates|Al Madinah|650|0|25|500|g|100|Premium Ajwa dates from Madinah.|https://kommodo.ai/i/dAGR94o9R86fmRqY54h3
Dates|Mariam Dates|Al Madinah|480|450|30|500|g|010|Soft, sweet Mariam dates.
Dates|Dried Dates (Khejur)|Fresh|220|0|45|500|g|000|Everyday dried dates, naturally sweet.
Dry Fruits|Cashew Nuts|Kiam|780|0|30|500|g|100|Premium whole cashew nuts.
Dry Fruits|Almonds|Kiam|720|690|30|500|g|010|California almonds, rich in nutrients.
Dry Fruits|Raisins|Fresh|220|0|45|250|g|001|Sweet seedless raisins.
Seeds|Chia Seeds|NutriLife|350|0|25|250|g|001|Nutrient-dense chia seeds for smoothies and puddings.|https://i.ibb.co.com/x83P8RtZ/Chia-Seeds.jpg
Seeds|Flax Seeds|NutriLife|180|0|30|250|g|000|Ground flax seeds, high in fibre.
Oats|Rolled Oats|Quaker|260|0|40|400|g|110|Wholesome rolled oats for a hearty breakfast.
Oats|Instant Oats|PranUp|210|0|35|400|g|000|Quick-cook instant oats, ready in minutes.
Peanut Butter|Smooth Peanut Butter|Pufito|320|0|35|340|g|010|Creamy smooth peanut butter.
Peanut Butter|Crunchy Peanut Butter|Pufito|330|300|30|340|g|100|Crunchy peanut butter with real peanut bits.
Jam|Mixed Fruit Jam|Pran|150|0|45|400|g|000|Sweet mixed fruit jam for toast and paratha.
Jam|Strawberry Jam|Kissan|180|0|30|400|g|010|Classic strawberry jam.
Jelly|Mixed Fruit Jelly Cups|Pran|90|0|50|12|pcs|001|Fun fruit jelly cups for kids.
Jelly|Guava Jelly|Pran|130|0|25|400|g|000|Traditional guava jelly preserve.
Pickles|Mixed Vegetable Pickle|Pran|160|0|40|400|g|100|Traditional tangy-spicy mixed vegetable pickle.
Pickles|Mango Pickle|Pran|150|0|35|400|g|010|Classic spicy mango pickle.
Sauces|Soy Sauce|Pran|120|0|45|300|ml|000|Savoury soy sauce for stir-fries and marinades.
Sauces|Chili Sauce|Pran|110|0|55|300|ml|010|Spicy chili sauce for everyday meals.
Tomato Ketchup|Tomato Ketchup|Pran|140|0|60|500|g|110|Rich, tangy tomato ketchup made from ripe tomatoes.
Tomato Ketchup|Tomato Ketchup Squeeze Bottle|Heinz|320|300|25|700|g|001|Premium tomato ketchup in a squeeze bottle.
Mayonnaise|Classic Mayonnaise|Pran|210|0|35|300|g|000|Creamy classic mayonnaise for sandwiches and salads.
Mayonnaise|Garlic Mayonnaise|Kraft|260|0|20|300|g|001|Mayonnaise with a bold garlic kick.
Frozen Food|Frozen Paratha (10-pack)|Golden Harvest|220|0|40|10|pack|100|Ready-to-cook layered parathas, straight from freezer to pan.
Frozen Food|Frozen Chicken Nuggets|Kazi Farms|320|300|30|400|g|010|Crispy breaded chicken nuggets.
Frozen Food|Frozen Samosa (12-pack)|Golden Harvest|180|0|35|12|pack|001|Ready-to-fry vegetable samosas.
Eggs|Farm Fresh Eggs (12-pack)|Kazi Farms|140|0|90|1|dozen|110|Farm fresh eggs, carefully selected and packed.
Eggs|Duck Eggs (6-pack)|Fresh|110|0|30|6|pcs|000|Rich, flavourful duck eggs.
Baby Food|Infant Formula Stage 1|Nestle Lactogen|950|900|25|400|g|100|Infant formula milk for stage 1 feeding.
Baby Food|Baby Rice Cereal|Cerelac|420|0|30|400|g|010|Iron-fortified rice cereal for babies.
Instant Food|Instant Khichuri Mix|Pran|130|0|40|400|g|001|Ready-to-cook khichuri mix for a quick meal.
Instant Food|Instant Cup Soup|Knorr|60|0|55|1|pcs|000|Quick and easy instant cup soup.
Tissue|Facial Tissue Box|Fresh|70|0|80|1|pcs|000|Soft, absorbent facial tissues for everyday use.
Tissue|Toilet Tissue Roll (4-pack)|Softex|160|150|60|4|pack|110|Soft, strong toilet tissue rolls.
Soap|Bathing Soap Bar|Lux|45|0|100|100|g|000|Gentle everyday bathing soap for the whole family.
Soap|Antibacterial Soap|Lifebuoy|50|0|90|100|g|110|Antibacterial soap for extra protection.
Shampoo|Herbal Shampoo|Sunsilk|190|0|45|200|ml|000|Nourishing herbal shampoo for everyday hair care.
Shampoo|Anti-Dandruff Shampoo|Head & Shoulders|260|240|35|200|ml|101|Effective anti-dandruff shampoo.
Toothpaste|Fluoride Toothpaste|Colgate|95|0|100|150|g|010|Fluoride toothpaste for daily cavity protection.|/products/Fluoride%20Toothpast%20Colgate.png
Toothpaste|Whitening Toothpaste|Pepsodent|110|0|60|150|g|000|Whitening toothpaste for a brighter smile.
Dish Wash|Dish Washing Liquid|Vim|130|0|55|500|ml|100|Powerful grease-cutting dish washing liquid.
Dish Wash|Dish Washing Bar|Vim|30|0|90|200|g|010|Economical dish washing bar for everyday use.
Detergent|Laundry Detergent Powder|Wheel|190|0|70|1|kg|110|Powerful detergent powder for bright, clean laundry.
Detergent|Liquid Detergent|Surf Excel|320|300|30|1|l|001|Concentrated liquid detergent for tough stains.
Cleaning Supplies|Floor Cleaner|Harpic|150|0|45|1|l|000|Disinfecting floor cleaner with a fresh scent.
Cleaning Supplies|Toilet Cleaner|Harpic|140|0|55|500|ml|100|Powerful toilet cleaner that kills germs.
Cleaning Supplies|Glass Cleaner|Colin|130|0|30|500|ml|001|Streak-free glass and window cleaner.`;

const slug = (n) => n.toLowerCase().replace(/\s+/g, '-');

export default RAW.split('\n').map((line, i) => {
  const [category, name, brand, price, discountPrice, stock, weight, unit, flags, description, image] = line.split('|');
  return {
    category, name, brand, description, unit,
    price: +price, discountPrice: +discountPrice, stock: +stock, weight: +weight,
    sku: `MB-${category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
    // Put your own photos in client/public/products/<product-name>.jpg, or upload them in Admin > Product.
    images: [image || `/products/${slug(name)}.jpg`],
    isFeatured: flags[0] === '1', isBestSeller: flags[1] === '1', isNewArrival: flags[2] === '1',
    rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
    numReviews: Math.floor(Math.random() * 40),
  };
});

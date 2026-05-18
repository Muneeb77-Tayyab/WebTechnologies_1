require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/improved-ecommerce';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB for seeding...');

    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ─────────────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    await User.create([
      { name: 'Admin User',    email: 'admin@tissot.com',  password, role: 'admin' },
      { name: 'John Horton',   email: 'john@example.com',  password, role: 'customer' },
      { name: 'Sarah Winters', email: 'sarah@example.com', password, role: 'customer' }
    ]);
    console.log('👥 Users created');

    // ── Watch Categories ──────────────────────────────────────────────────────
    const [luxury, sport, classic, smart, fashion] = await Promise.all([
      Category.create({ name: 'Luxury',   description: 'Premium dress watches for every occasion' }),
      Category.create({ name: 'Sport',    description: 'Durable sport and diving watches' }),
      Category.create({ name: 'Classic',  description: 'Timeless vintage-inspired timepieces' }),
      Category.create({ name: 'Smart',    description: 'Modern smartwatches with health tracking' }),
      Category.create({ name: 'Fashion',  description: 'Trendy and affordable fashion watches' })
    ]);
    console.log('📂 Watch categories created');

    // ── 25 Watch Products (5 per category) ────────────────────────────────────
    await Product.create([

      // ── LUXURY (5) ──────────────────────────────────────────────────────────
      {
        name: 'Grand Tourbillon Prestige',
        description: 'Swiss-made tourbillon movement in an 18k rose gold case. A masterpiece of horological art.',
        price: 12999.99, rating: 4.9, stock: 5,
        category: luxury._id,
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop'
      },
      {
        name: 'Perpetual Calendar Moonphase',
        description: 'Platinum case with perpetual calendar and moonphase complication. Sapphire crystal.',
        price: 8499.99, rating: 4.8, stock: 8,
        category: luxury._id,
        image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop'
      },
      {
        name: 'Minute Repeater Gold Edition',
        description: 'Yellow gold case with minute repeater complication. Hand-wound mechanical movement.',
        price: 15999.99, rating: 4.9, stock: 3,
        category: luxury._id,
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&auto=format&fit=crop'
      },
      {
        name: 'Skeleton Openwork Automatic',
        description: 'Exhibition case back and dial revealing the intricate automatic movement. Alligator strap.',
        price: 5499.99, rating: 4.7, stock: 12,
        category: luxury._id,
        image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&auto=format&fit=crop'
      },
      {
        name: 'Diamond Bezel Prestige',
        description: 'Stainless steel case set with 60 brilliant-cut diamonds. Mother-of-pearl dial.',
        price: 9999.99, rating: 4.8, stock: 6,
        category: luxury._id,
        image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&auto=format&fit=crop'
      },

      // ── SPORT (5) ──────────────────────────────────────────────────────────
      {
        name: 'ProDiver 600M Automatic',
        description: '600m water resistance, helium escape valve, unidirectional rotating bezel. ISO 6425 certified.',
        price: 899.99, rating: 4.8, stock: 40,
        category: sport._id,
        image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600&auto=format&fit=crop'
      },
      {
        name: 'Chronograph Racing Edition',
        description: 'Tachymeter bezel, flyback chronograph, red and black racing-inspired dial.',
        price: 1249.99, rating: 4.7, stock: 25,
        category: sport._id,
        image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&auto=format&fit=crop'
      },
      {
        name: 'Aviator Pilot GMT',
        description: 'GMT complication for tracking two time zones. Large Arabic numerals for cockpit legibility.',
        price: 1099.99, rating: 4.6, stock: 30,
        category: sport._id,
        image: 'https://images.unsplash.com/photo-1619134778706-7015533a6150?w=600&auto=format&fit=crop'
      },
      {
        name: 'Expedition Field Watch',
        description: 'Anti-magnetic, shock resistant field watch built for exploration. Luminous hands.',
        price: 549.99, rating: 4.5, stock: 55,
        category: sport._id,
        image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&auto=format&fit=crop'
      },
      {
        name: 'Solar Sailing Regatta',
        description: 'Solar-powered sailing watch with regatta countdown timer and tide graph.',
        price: 749.99, rating: 4.6, stock: 35,
        category: sport._id,
        image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&auto=format&fit=crop'
      },

      // ── CLASSIC (5) ───────────────────────────────────────────────────────
      {
        name: 'Heritage Dress Watch 1957',
        description: 'Re-edition of a 1957 classic. Slim profile, sector dial, manually wound movement.',
        price: 1899.99, rating: 4.8, stock: 18,
        category: classic._id,
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop'
      },
      {
        name: 'Vintage Cushion Automatic',
        description: 'Cushion-shaped case inspired by 1940s designs. Exhibition caseback, domed crystal.',
        price: 1299.99, rating: 4.7, stock: 22,
        category: classic._id,
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop'
      },
      {
        name: 'Classic Roman Numeral',
        description: 'Elegant Roman numeral dial on a silver case. Swiss quartz movement, leather strap.',
        price: 349.99, rating: 4.5, stock: 60,
        category: classic._id,
        image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop'
      },
      {
        name: 'Pocket Watch Revival',
        description: 'Pocket-watch inspired wristwatch with hunter case design. Engraved back.',
        price: 599.99, rating: 4.6, stock: 28,
        category: classic._id,
        image: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=600&auto=format&fit=crop'
      },
      {
        name: 'Art Deco Tank Collection',
        description: 'Rectangular Art Deco case with guilloche dial. Premium French calfskin strap.',
        price: 849.99, rating: 4.7, stock: 20,
        category: classic._id,
        image: 'https://images.unsplash.com/photo-1511370235399-1802cae1b297?w=600&auto=format&fit=crop'
      },

      // ── SMART (5) ─────────────────────────────────────────────────────────
      {
        name: 'Apex Health Pro Watch',
        description: 'ECG, SpO2, sleep tracking, GPS. AMOLED display, 7-day battery. Swim-proof.',
        price: 449.99, rating: 4.7, stock: 80,
        category: smart._id,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop'
      },
      {
        name: 'Hybrid Smart Classic',
        description: 'Traditional watch look with smart features. Activity tracking, silent alarm, phone notifications.',
        price: 299.99, rating: 4.5, stock: 65,
        category: smart._id,
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop'
      },
      {
        name: 'Ultra Sport Fitness Band',
        description: 'Advanced VO2 max, training load, recovery advisor. Titanium bezel. 14-day battery.',
        price: 549.99, rating: 4.8, stock: 50,
        category: smart._id,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop'
      },
      {
        name: 'Smart Luxe Edition',
        description: 'Premium stainless steel smartwatch. Sapphire screen, leather strap. Contactless payments.',
        price: 699.99, rating: 4.6, stock: 35,
        category: smart._id,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop'
      },
      {
        name: 'Kids Adventure Smart Watch',
        description: 'GPS tracking, SOS call, step counter. Durable rubber strap. Perfect for active kids.',
        price: 149.99, rating: 4.4, stock: 100,
        category: smart._id,
        image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop'
      },

      // ── FASHION (5) ──────────────────────────────────────────────────────
      {
        name: 'Rose Gold Mesh Bracelet',
        description: 'Chic rose gold case with mesh bracelet. Minimalist sunray dial. Perfect everyday wear.',
        price: 129.99, rating: 4.4, stock: 120,
        category: fashion._id,
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop'
      },
      {
        name: 'Marble Dial Statement Watch',
        description: 'Unique genuine marble dial, each piece one-of-a-kind. Gold plated case.',
        price: 189.99, rating: 4.5, stock: 45,
        category: fashion._id,
        image: 'https://images.unsplash.com/photo-1529946179074-a574386a01e8?w=600&auto=format&fit=crop'
      },
      {
        name: 'Minimalist Nato Strap',
        description: 'Ultra-thin case with colourful interchangeable NATO straps. 5 straps included.',
        price: 89.99, rating: 4.3, stock: 150,
        category: fashion._id,
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&auto=format&fit=crop'
      },
      {
        name: 'Chronograph Steel Fashion',
        description: 'Fashion-forward chronograph with coloured subdials. Stainless steel bracelet.',
        price: 219.99, rating: 4.5, stock: 70,
        category: fashion._id,
        image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&auto=format&fit=crop'
      },
      {
        name: 'Leather Strap Duo Pack',
        description: 'Classic watch with two interchangeable leather straps (brown & black). Gift-box included.',
        price: 159.99, rating: 4.4, stock: 90,
        category: fashion._id,
        image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d783c?w=600&auto=format&fit=crop'
      }

    ]);

    console.log('⌚ 25 Watches created across 5 categories');
    console.log('\n✅ Database seeded successfully!');
    console.log('──────────────────────────────────────────────');
    console.log('  Admin login : admin@tissot.com  / password123');
    console.log('  User login  : john@example.com  / password123');
    console.log('──────────────────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

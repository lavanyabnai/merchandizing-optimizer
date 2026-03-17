import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {
  customers,
  locations
} from '@/db/schema';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_CUSTOMERS = [
  {
    name: 'Customer 1',
    inclusionType: 'Include',
    icon: 'default_icon'
  },
  {
    name: 'Customer 2',
    inclusionType: 'Include',
    icon: 'default_icon'
  }
];

const SEED_LOCATIONS = [
  { name: 'Location 1', country: 'USA' },
  { name: 'Location 2', country: 'USA' }
];

const main = async () => {
  try {
    // Reset database
    await db.delete(customers).execute();
    await db.delete(locations).execute();
    
    // Seed locations and get their IDs
    const insertedLocations = await db.insert(locations).values(SEED_LOCATIONS).returning({ id: locations.id }).execute();
    
    // Seed customers with correct location IDs
    const customersWithLocations = SEED_CUSTOMERS.map((customer, index) => ({
      ...customer,
      locationId: insertedLocations[index].id,
      locationName: SEED_LOCATIONS[index].name,
    }));
    await db.insert(customers).values(customersWithLocations).execute();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
};

main();

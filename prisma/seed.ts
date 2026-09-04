import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/utils";
import {
  Role,
  ListingType,
  PropertyType,
  PropertyStatus,
} from "../src/lib/enums";

const prisma = new PrismaClient();

// Curated Unsplash property image URLs (reliable, evergreen IDs)
const IMG = {
  house:
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  modern:
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  villa:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  condo:
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  townhouse:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  white:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  green:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  luxury:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  pool:
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  interior:
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  blue:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
};

const agents = [
  {
    name: "Sarah Mitchell",
    email: "sarah@dreamhome.com",
    phone: "+1 555-0101",
    bio: "Specializing in luxury waterfront properties for over 12 years.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "James Carter",
    email: "james@dreamhome.com",
    phone: "+1 555-0102",
    bio: "Residential sales expert focused on family neighborhoods.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Emily Zhang",
    email: "emily@dreamhome.com",
    phone: "+1 555-0103",
    bio: "Rental market specialist and property management consultant.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "David Okafor",
    email: "david@dreamhome.com",
    phone: "+1 555-0104",
    bio: "Commercial and investment property advisor.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

const properties = [
  {
    title: "Modern Family House in Brooklyn",
    description:
      "Beautifully maintained family home featuring an open-concept living space, updated kitchen with granite countertops, and a spacious backyard perfect for entertaining. Located in a quiet, family-friendly neighborhood with excellent schools nearby.",
    price: 485000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    address: "452 Elm Street",
    city: "New York",
    state: "NY",
    country: "USA",
    latitude: 40.6782,
    longitude: -73.9442,
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    yearBuilt: 2008,
    furnished: false,
    parking: 2,
    featured: true,
    images: [IMG.house, IMG.interior, IMG.pool],
    amenities: ["Garden", "Parking", "Garage", "Heating", "Security"],
  },
  {
    title: "Luxury Downtown Apartment",
    description:
      "Stylish corner apartment with panoramic city views, floor-to-ceiling windows, in-unit laundry, and access to premium amenities including a rooftop pool, fitness center, and 24-hour concierge.",
    price: 1200,
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    address: "88 Park Avenue",
    city: "New York",
    state: "NY",
    country: "USA",
    latitude: 40.7505,
    longitude: -73.9734,
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    yearBuilt: 2019,
    furnished: true,
    parking: 1,
    featured: true,
    images: [IMG.apartment, IMG.interior, IMG.white],
    amenities: ["Gym", "Furnished", "Air Conditioning", "Elevator", "Laundry"],
  },
  {
    title: "Beachfront Villa",
    description:
      "Stunning beachfront villa with private pool, direct beach access, chef's kitchen, and breathtaking ocean views from every room. The perfect luxury retreat with modern amenities and tropical landscaping.",
    price: 1250000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.VILLA,
    address: "12 Ocean Drive",
    city: "Miami",
    state: "FL",
    country: "USA",
    latitude: 25.7907,
    longitude: -80.13,
    bedrooms: 5,
    bathrooms: 4,
    area: 3800,
    yearBuilt: 2016,
    furnished: true,
    parking: 3,
    featured: true,
    images: [IMG.villa, IMG.pool, IMG.luxury],
    amenities: ["Pool", "Waterfront", "Garage", "Security", "Air Conditioning"],
  },
  {
    title: "Cozy Studio Apartment",
    description:
      "Bright and cozy studio in the heart of downtown. Walking distance to cafes, restaurants, and public transit. Features modern finishes, stainless steel appliances, and a sunny private balcony.",
    price: 850,
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    address: "310 Michigan Ave",
    city: "Chicago",
    state: "IL",
    country: "USA",
    latitude: 41.8826,
    longitude: -87.6246,
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    yearBuilt: 2012,
    furnished: true,
    parking: 0,
    featured: false,
    images: [IMG.blue, IMG.interior],
    amenities: ["Furnished", "Air Conditioning", "Internet", "Laundry"],
  },
  {
    title: "Classic Colonial Home",
    description:
      "Charming colonial-style home with hardwood floors throughout, a formal dining room, and a renovated gourmet kitchen. Set on a generous lot with a lush garden and detached garage.",
    price: 620000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    address: "78 Maple Street",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    latitude: 34.0522,
    longitude: -118.2437,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    yearBuilt: 1998,
    furnished: false,
    parking: 2,
    featured: true,
    images: [IMG.green, IMG.house, IMG.modern],
    amenities: ["Garden", "Garage", "Fireplace", "Heating"],
  },
  {
    title: "Penthouse Condo",
    description:
      "Luxurious penthouse condo with skyline views, private terrace, and high-end finishes. Building offers valet parking, a spa, and a rooftop lounge. Premium location near shopping and dining.",
    price: 950,
    listingType: ListingType.RENT,
    propertyType: PropertyType.CONDO,
    address: "500 Bay Street",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    latitude: 37.7749,
    longitude: -122.4194,
    bedrooms: 3,
    bathrooms: 2,
    area: 1900,
    yearBuilt: 2020,
    furnished: true,
    parking: 1,
    featured: false,
    images: [IMG.condo, IMG.white, IMG.apartment],
    amenities: ["Gym", "Furnished", "Elevator", "Parking", "Security"],
  },
  {
    title: "Suburban Starter Home",
    description:
      "Perfect starter home in a quiet suburban neighborhood. Updated bathrooms, new roof, fenced yard, and a finished basement. Great schools and parks just minutes away.",
    price: 320000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    address: "221 Oak Lane",
    city: "Chicago",
    state: "IL",
    country: "USA",
    latitude: 41.7637,
    longitude: -88.18,
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    yearBuilt: 2000,
    furnished: false,
    parking: 2,
    featured: false,
    images: [IMG.modern, IMG.interior],
    amenities: ["Garden", "Parking", "Heating"],
  },
  {
    title: "Modern City Condo",
    description:
      "Contemporary condo with open views, luxury amenities, and prime location steps from subway access. Features smart home technology, gym, and residents-only lounge.",
    price: 675000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.CONDO,
    address: "14 Financial District",
    city: "New York",
    state: "NY",
    country: "USA",
    latitude: 40.7075,
    longitude: -74.0113,
    bedrooms: 2,
    bathrooms: 2,
    area: 1300,
    yearBuilt: 2018,
    furnished: false,
    parking: 0,
    featured: true,
    images: [IMG.white, IMG.condo, IMG.apartment],
    amenities: ["Gym", "Elevator", "Smart Home", "Security"],
  },
  {
    title: "Tropical Garden Villa",
    description:
      "Tropical villa surrounded by lush gardens with a private pool and outdoor entertaining area. Bright, airy interiors with Spanish-style architecture and modern updates throughout.",
    price: 850,
    listingType: ListingType.RENT,
    propertyType: PropertyType.VILLA,
    address: "7 Palm Court",
    city: "Miami",
    state: "FL",
    country: "USA",
    latitude: 25.7479,
    longitude: -80.27,
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    yearBuilt: 2014,
    furnished: true,
    parking: 2,
    featured: false,
    images: [IMG.pool, IMG.green, IMG.villa],
    amenities: ["Pool", "Garden", "Furnished", "Air Conditioning"],
  },
  {
    title: "Elegant Waterfront Estate",
    description:
      "One-of-a-kind waterfront estate with 180-degree ocean views, infinity pool, home theater, wine cellar, and resort-style grounds. The ultimate in coastal luxury living.",
    price: 2400000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.VILLA,
    address: "1 Harbor View Rd",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    latitude: 34.0259,
    longitude: -118.7798,
    bedrooms: 6,
    bathrooms: 5,
    area: 5200,
    yearBuilt: 2015,
    furnished: true,
    parking: 4,
    featured: true,
    images: [IMG.luxury, IMG.pool, IMG.white],
    amenities: ["Pool", "Waterfront", "Gym", "Garage", "Security", "Smart Home"],
  },
  {
    title: "Affordable Loft Studio",
    description:
      "Industrial-style loft with high ceilings, exposed brick, and large windows. Excellent location with easy access to tech hubs, arts district, and public transportation.",
    price: 1100,
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    address: "230 Mission Street",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    latitude: 37.787,
    longitude: -122.402,
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    yearBuilt: 2010,
    furnished: false,
    parking: 0,
    featured: false,
    images: [IMG.blue, IMG.interior],
    amenities: ["Internet", "Heating", "Pets Allowed"],
  },
  {
    title: "Garden Townhouse",
    description:
      "Bright townhouse with private garden, updated interiors, and a modern kitchen with island. Features include a rooftop terrace, one-car garage, and pet-friendly community.",
    price: 540000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.TOWNHOUSE,
    address: "45 Hibiscus St",
    city: "Miami",
    state: "FL",
    country: "USA",
    latitude: 25.7617,
    longitude: -80.1918,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    yearBuilt: 2017,
    furnished: false,
    parking: 1,
    featured: false,
    images: [IMG.townhouse, IMG.modern, IMG.green],
    amenities: ["Garden", "Garage", "Pets Allowed", "Air Conditioning"],
  },
  {
    title: "Executive Office Space",
    description:
      "Premium commercial office space with modern fit-out, conference rooms, and flexible lease terms. Includes on-site management, high-speed internet, and ample parking.",
    price: 7500,
    listingType: ListingType.RENT,
    propertyType: PropertyType.OFFICE,
    address: "900 Congress Ave",
    city: "Austin",
    state: "TX",
    country: "USA",
    latitude: 30.2672,
    longitude: -97.7431,
    bedrooms: 0,
    bathrooms: 2,
    area: 3200,
    yearBuilt: 2018,
    furnished: true,
    parking: 5,
    featured: false,
    images: [IMG.white, IMG.condo],
    amenities: ["Furnished", "Internet", "Parking", "Security", "Gym"],
  },
  {
    title: "Downtown Retail Storefront",
    description:
      "High-visibility ground-floor retail space on a busy commercial street. Large storefront windows, loading dock, and generous foot traffic. Ideal for retail or restaurant use.",
    price: 4200,
    listingType: ListingType.RENT,
    propertyType: PropertyType.COMMERCIAL,
    address: "12 Main Street",
    city: "Denver",
    state: "CO",
    country: "USA",
    latitude: 39.7392,
    longitude: -104.9903,
    bedrooms: 0,
    bathrooms: 1,
    area: 1800,
    yearBuilt: 2005,
    furnished: false,
    parking: 2,
    featured: false,
    images: [IMG.modern, IMG.townhouse],
    amenities: ["Parking", "Security", "Heating"],
  },
  {
    title: "Prime Residential Land",
    description:
      "Rare vacant residential lot in a sought-after neighborhood. Utilities available at the street, flat buildable terrain, and zoning approved for single-family homes.",
    price: 190000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.LAND,
    address: "Lot 45, Cedar Ridge",
    city: "Austin",
    state: "TX",
    country: "USA",
    latitude: 30.3,
    longitude: -97.7,
    bedrooms: 0,
    bathrooms: 0,
    area: 7500,
    yearBuilt: null,
    furnished: false,
    parking: 0,
    featured: false,
    images: [IMG.green, IMG.interior],
    amenities: [],
  },
  {
    title: "Downtown High-Rise Condo",
    description:
      "Stunning high-rise condo with floor-to-ceiling windows, gourmet kitchen, and a spacious balcony. Building amenities include pool, gym, concierge, and rooftop terrace.",
    price: 720000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.CONDO,
    address: "77 Dearborn St",
    city: "Chicago",
    state: "IL",
    country: "USA",
    latitude: 41.885,
    longitude: -87.6298,
    bedrooms: 2,
    bathrooms: 2,
    area: 1450,
    yearBuilt: 2021,
    furnished: false,
    parking: 1,
    featured: true,
    images: [IMG.condo, IMG.white, IMG.blue],
    amenities: ["Gym", "Pool", "Elevator", "Security", "Air Conditioning"],
  },
  {
    title: "Charming Craftsman Bungalow",
    description:
      "Beautifully restored craftsman bungalow with original details, modern kitchen, and a lovely front porch. Located in a tree-lined neighborhood close to downtown.",
    price: 455000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    address: "19 Birchwood Ave",
    city: "Seattle",
    state: "WA",
    country: "USA",
    latitude: 47.6062,
    longitude: -122.3321,
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    yearBuilt: 1925,
    furnished: false,
    parking: 1,
    featured: false,
    images: [IMG.green, IMG.house, IMG.modern],
    amenities: ["Fireplace", "Garden", "Heating"],
  },
  {
    title: "Luxury Downtown Penthouse",
    description:
      "Breathtaking penthouse on the top floor with 360-degree views, chef's kitchen, private elevator access, and a wrap-around terrace. True five-star living.",
    price: 1800,
    listingType: ListingType.RENT,
    propertyType: PropertyType.CONDO,
    address: "2 Beacon Hill",
    city: "Boston",
    state: "MA",
    country: "USA",
    latitude: 42.3601,
    longitude: -71.0589,
    bedrooms: 3,
    bathrooms: 3,
    area: 2400,
    yearBuilt: 2019,
    furnished: true,
    parking: 2,
    featured: true,
    images: [IMG.luxury, IMG.white, IMG.apartment],
    amenities: ["Gym", "Furnished", "Elevator", "Smart Home", "Security"],
  },
  {
    title: "Suburban Family Home",
    description:
      "Spacious family home in a quiet cul-de-sac with a large backyard, two-car garage, and a recently remodeled kitchen. Great schools and community parks nearby.",
    price: 360000,
    listingType: ListingType.SALE,
    propertyType: PropertyType.HOUSE,
    address: "38 Hillcrest Dr",
    city: "Denver",
    state: "CO",
    country: "USA",
    latitude: 39.76,
    longitude: -104.88,
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    yearBuilt: 2003,
    furnished: false,
    parking: 2,
    featured: false,
    images: [IMG.modern, IMG.townhouse, IMG.house],
    amenities: ["Garden", "Garage", "Heating", "Pets Allowed"],
  },
  {
    title: "Modern Smart Apartment",
    description:
      "Fully equipped smart apartment with voice-controlled lighting, automated climate, and high-speed fiber internet. Walking distance to dining, shopping, and transit.",
    price: 2000,
    listingType: ListingType.RENT,
    propertyType: PropertyType.APARTMENT,
    address: "77 Peachtree St",
    city: "Atlanta",
    state: "GA",
    country: "USA",
    latitude: 33.749,
    longitude: -84.388,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    yearBuilt: 2022,
    furnished: true,
    parking: 1,
    featured: false,
    images: [IMG.white, IMG.interior, IMG.blue],
    amenities: ["Smart Home", "Gym", "Furnished", "Air Conditioning"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (development) - order matters for FK constraints
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.viewing.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ===== Admin & Users =====
  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@dreamhome.com",
      password: passwordHash,
      role: Role.ADMIN,
      phone: "+1 555-0000",
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@dreamhome.com",
      password: passwordHash,
      role: Role.USER,
      phone: "+1 555-1111",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    },
  });

  // ===== Agents =====
  const agentRecords = [];
  for (const agent of agents) {
    const a = await prisma.user.create({
      data: {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        password: passwordHash,
        role: Role.AGENT,
        bio: agent.bio,
        avatar: agent.avatar,
        isAgentApproved: true,
      },
    });
    agentRecords.push(a);
  }

  // ===== Amenities =====
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities))
  );
  const amenityRecords = new Map();
  for (const name of allAmenities) {
    const a = await prisma.amenity.create({ data: { name } });
    amenityRecords.set(name, a);
  }

  // ===== Properties (distribute across agents) =====
  let index = 0;
  for (const data of properties) {
    const agent = agentRecords[index % agentRecords.length];
    index++;

    const status =
      index % 12 === 0 ? PropertyStatus.PENDING :
      index % 20 === 0 ? PropertyStatus.REJECTED :
      PropertyStatus.ACTIVE;

    const property = await prisma.property.create({
      data: {
        title: data.title,
        slug: `${slugify(data.title)}-${index}`,
        description: data.description,
        price: data.price,
        listingType: data.listingType,
        propertyType: data.propertyType,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        yearBuilt: data.yearBuilt,
        furnished: data.furnished,
        parking: data.parking,
        status,
        featured: data.featured,
        featuredAt: data.featured ? new Date() : null,
        viewCount: Math.floor(Math.random() * 1000) + 10,
        agentId: agent.id,
        images: {
          create: data.images.map((url, i) => ({
            url,
            sortOrder: i,
          })),
        },
        amenities: {
          create: data.amenities.map((name) => ({
            amenity: { connect: { id: amenityRecords.get(name)!.id } },
          })),
        },
      },
    });

    // Create a few inquiries for realism
    if (index % 3 === 0) {
      await prisma.inquiry.create({
        data: {
          propertyId: property.id,
          agentId: property.agentId,
          name: "Interested Buyer",
          email: "buyer@example.com",
          phone: "+1 555-2222",
          message:
            "Hi, I'm very interested in this property. Could you tell me more about the area and schedule a viewing?",
          status: "NEW",
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log("------------------------------------");
  console.log("Credentials (password: Password123!)");
  console.log("  Admin: admin@dreamhome.com");
  console.log("  Agent: sarah@dreamhome.com");
  console.log("  User:  user@dreamhome.com");
  console.log("------------------------------------");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

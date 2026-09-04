import { prisma } from "@/lib/prisma";
import { createSlug } from "@/services/properties";
import type { PropertyInput } from "@/lib/validations";

export async function createProperty(agentId: string, data: PropertyInput) {
  const slug = await createSlug(data.title);

  // Ensure all amenity names exist
  await ensureAmenities(data.amenities);

  const property = await prisma.property.create({
    data: {
      title: data.title,
      slug,
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
      status: "PENDING",
      agentId,
      images: {
        create: data.images.map((url, i) => ({ url, sortOrder: i })),
      },
      amenities: {
        create: data.amenities.map((name) => ({
          amenity: { connect: { name } },
        })),
      },
    },
    include: {
      images: true,
      amenities: { include: { amenity: true } },
    },
  });

  return property;
}

export async function updateProperty(
  agentId: string,
  propertyId: string,
  data: PropertyInput
) {
  const existing = await prisma.property.findFirst({
    where: { id: propertyId, agentId },
  });
  if (!existing) throw new Error("Property not found or not yours");

  await ensureAmenities(data.amenities);

  const property = await prisma.$transaction(async (tx) => {
    await tx.propertyAmenity.deleteMany({ where: { propertyId } });
    await tx.propertyImage.deleteMany({ where: { propertyId } });

    return tx.property.update({
      where: { id: propertyId },
      data: {
        title: data.title,
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
        status: "PENDING",
        images: {
          create: data.images.map((url, i) => ({ url, sortOrder: i })),
        },
        amenities: {
          create: data.amenities.map((name) => ({
            amenity: { connect: { name } },
          })),
        },
      },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
      },
    });
  });

  return property;
}

export async function deleteProperty(agentId: string, propertyId: string) {
  const existing = await prisma.property.findFirst({
    where: { id: propertyId, agentId },
    select: { id: true },
  });
  if (!existing) throw new Error("Property not found or not yours");

  await prisma.property.delete({ where: { id: propertyId } });
}

async function ensureAmenities(names: string[]) {
  for (const name of names) {
    await prisma.amenity.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

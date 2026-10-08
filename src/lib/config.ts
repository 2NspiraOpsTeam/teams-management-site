/**
 * Teams Management - Configuration
 * Development values - replace with environment variables in production
 */

// Import real building addresses from client specification
import { realBuildings } from './seed-data-real-buildings';

export const config = {
  app: {
    name: 'Teams Management',
    tagline: 'The Property Steward',
    description: 'Premium property management and portfolio services in New York City'
  },
  
  // Development: use provided building addresses (15 properties from client)
  // Production: query from D1 database
  buildings: {
    realAddresses: realBuildings,
    developmentMode: true, // Set false when ready for production content
    seedEnabled: true      // Use seed data until admin replaces with real content
  },

  features: {
    tenantServices: 'development', // development|staging|production
    analyticsOptOut: false,
    reducedMotionSupported: true
  }
};


import { customers, employees, measurements, orders } from "@/data/sampleData";
import { add, getAll, STORES, openDatabase } from "@/lib/indexedDb";

// Check if data needs to be seeded
export const checkAndSeedData = async () => {
  try {
    // Check if this is the first run by looking for a flag in localStorage
    const isSeeded = localStorage.getItem("tailor-shop-seeded");
    
    if (isSeeded === "true") {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    console.log("First run detected, seeding database...");
    
    // Open database connection
    await openDatabase();
    
    // Check if customers store is empty
    const existingCustomers = await getAll(STORES.CUSTOMERS);
    
    if (existingCustomers.length === 0) {
      // Seed customers
      for (const customer of customers) {
        await add(STORES.CUSTOMERS, customer);
      }
      console.log(`Seeded ${customers.length} customers`);
      
      // Seed employees
      for (const employee of employees) {
        await add(STORES.EMPLOYEES, employee);
      }
      console.log(`Seeded ${employees.length} employees`);
      
      // Seed measurements
      for (const measurement of measurements) {
        await add(STORES.MEASUREMENTS, measurement);
      }
      console.log(`Seeded ${measurements.length} measurements`);
      
      // Seed orders
      for (const order of orders) {
        await add(STORES.ORDERS, order);
      }
      console.log(`Seeded ${orders.length} orders`);
      
      // Mark as seeded
      localStorage.setItem("tailor-shop-seeded", "true");
      console.log("Database seeding complete!");
    } else {
      console.log("Data already exists, skipping seed");
      localStorage.setItem("tailor-shop-seeded", "true");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

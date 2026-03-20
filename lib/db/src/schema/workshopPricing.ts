import { pgTable, serial, integer, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { workshopsTable } from "./workshops";
import { packagesTable } from "./packages";

export const workshopPricingTable = pgTable("workshop_pricing", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").notNull().references(() => workshopsTable.id),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  fee: numeric("fee", { precision: 10, scale: 2 }).notNull().default("0"),
}, (t) => [
  uniqueIndex("uniq_workshop_pkg").on(t.workshopId, t.packageId),
]);

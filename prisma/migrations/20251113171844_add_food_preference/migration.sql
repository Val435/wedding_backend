-- CreateEnum
CREATE TYPE "FoodPreference" AS ENUM ('pasta', 'carne');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "foodPreference" "FoodPreference";

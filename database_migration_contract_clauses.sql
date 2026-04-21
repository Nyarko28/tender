-- Add structured contract clause fields
ALTER TABLE `contracts`
  ADD COLUMN `contract_date` DATE NULL AFTER `end_date`,
  ADD COLUMN `effective_date` DATE NULL AFTER `contract_date`,
  ADD COLUMN `buyer_name_address` TEXT NULL AFTER `effective_date`,
  ADD COLUMN `supplier_name_address` TEXT NULL AFTER `buyer_name_address`,
  ADD COLUMN `specification_of_goods` TEXT NULL AFTER `supplier_name_address`,
  ADD COLUMN `payment_terms_methods` TEXT NULL AFTER `specification_of_goods`,
  ADD COLUMN `warranty_terms` TEXT NULL AFTER `payment_terms_methods`,
  ADD COLUMN `breach_and_remedies` TEXT NULL AFTER `warranty_terms`,
  ADD COLUMN `delivery_terms` TEXT NULL AFTER `breach_and_remedies`,
  ADD COLUMN `price_terms` TEXT NULL AFTER `delivery_terms`,
  ADD COLUMN `price_adjustment_terms` TEXT NULL AFTER `price_terms`,
  ADD COLUMN `termination_terms` TEXT NULL AFTER `price_adjustment_terms`;


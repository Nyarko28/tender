-- Add supplier rejection tracking for contracts
ALTER TABLE `contracts`
  ADD COLUMN `supplier_rejected` TINYINT(1) NOT NULL DEFAULT 0 AFTER `signed_by_supplier`,
  ADD COLUMN `supplier_rejected_at` DATETIME DEFAULT NULL AFTER `supplier_signed_at`,
  ADD COLUMN `supplier_rejection_reason` TEXT DEFAULT NULL AFTER `supplier_rejected_at`;


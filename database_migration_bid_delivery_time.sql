-- Add delivery time/timeline to bids
-- Run once on your DB (phpMyAdmin): supplier_eval database

ALTER TABLE `bids`
  ADD COLUMN `delivery_time` varchar(100) DEFAULT NULL AFTER `technical_proposal`;


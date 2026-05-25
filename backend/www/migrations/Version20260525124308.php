<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260525124308 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation ADD is_active TINYINT DEFAULT 1 NOT NULL');
        $this->addSql('ALTER TABLE `order` CHANGE weight_total weight_total NUMERIC(5, 2) DEFAULT NULL, CHANGE shipping_label_url shipping_label_url VARCHAR(255) DEFAULT NULL, CHANGE tracking_number tracking_number VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE product ADD type VARCHAR(50) DEFAULT NULL, ADD size VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD refresh_token VARCHAR(255) DEFAULT NULL, ADD refresh_token_expired_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation DROP is_active');
        $this->addSql('ALTER TABLE `order` CHANGE weight_total weight_total NUMERIC(5, 2) NOT NULL, CHANGE shipping_label_url shipping_label_url VARCHAR(255) NOT NULL, CHANGE tracking_number tracking_number VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE product DROP type, DROP size');
        $this->addSql('ALTER TABLE `user` DROP refresh_token, DROP refresh_token_expired_at');
    }
}

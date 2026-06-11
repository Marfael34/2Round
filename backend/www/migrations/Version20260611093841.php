<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260611093841 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adress ADD is_active TINYINT DEFAULT 1 NOT NULL');
        $this->addSql('ALTER TABLE `order` ADD buyer_id INT DEFAULT NULL, ADD address_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F52993986C755722 FOREIGN KEY (buyer_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F5299398F5B7AF75 FOREIGN KEY (address_id) REFERENCES adress (id)');
        $this->addSql('CREATE INDEX IDX_F52993986C755722 ON `order` (buyer_id)');
        $this->addSql('CREATE INDEX IDX_F5299398F5B7AF75 ON `order` (address_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adress DROP is_active');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F52993986C755722');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F5299398F5B7AF75');
        $this->addSql('DROP INDEX IDX_F52993986C755722 ON `order`');
        $this->addSql('DROP INDEX IDX_F5299398F5B7AF75 ON `order`');
        $this->addSql('ALTER TABLE `order` DROP buyer_id, DROP address_id');
    }
}

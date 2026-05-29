<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260529140001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE wallet (id INT AUTO_INCREMENT NOT NULL, balance NUMERIC(10, 2) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_7C68921FA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE wallet ADD CONSTRAINT FK_7C68921FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user DROP wallet_balance');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE wallet DROP FOREIGN KEY FK_7C68921FA76ED395');
        $this->addSql('DROP TABLE wallet');
        $this->addSql('ALTER TABLE `user` ADD wallet_balance NUMERIC(10, 2) DEFAULT NULL');
    }
}

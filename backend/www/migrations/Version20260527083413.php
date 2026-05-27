<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260527083413 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE sanction (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(50) NOT NULL, reason LONGTEXT NOT NULL, created_at DATETIME NOT NULL, target_user_id INT NOT NULL, INDEX IDX_6D6491AF6C066AFE (target_user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE sanction ADD CONSTRAINT FK_6D6491AF6C066AFE FOREIGN KEY (target_user_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE sanction DROP FOREIGN KEY FK_6D6491AF6C066AFE');
        $this->addSql('DROP TABLE sanction');
    }
}

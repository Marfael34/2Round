<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260608091728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY `FK_BF5476CAA76ED395`');
        $this->addSql('DROP INDEX IDX_BF5476CAA76ED395 ON notification');
        $this->addSql('ALTER TABLE notification ADD title VARCHAR(255) NOT NULL, ADD link VARCHAR(255) DEFAULT NULL, DROP user_id, DROP metadata, CHANGE type type VARCHAR(50) NOT NULL, CHANGE content message LONGTEXT NOT NULL, CHANGE related_id recipient_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAE92F8F78 FOREIGN KEY (recipient_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_BF5476CAE92F8F78 ON notification (recipient_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAE92F8F78');
        $this->addSql('DROP INDEX IDX_BF5476CAE92F8F78 ON notification');
        $this->addSql('ALTER TABLE notification ADD user_id INT NOT NULL, ADD metadata JSON DEFAULT NULL, DROP title, DROP link, CHANGE type type VARCHAR(255) NOT NULL, CHANGE message content LONGTEXT NOT NULL, CHANGE recipient_id related_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT `FK_BF5476CAA76ED395` FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_BF5476CAA76ED395 ON notification (user_id)');
    }
}

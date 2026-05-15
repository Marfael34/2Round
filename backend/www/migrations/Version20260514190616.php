<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260514190616 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY `FK_8A8E26E919B116D8`');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY `FK_8A8E26E9DE18E50B`');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY `FK_8A8E26E9DF4C85EA`');
        $this->addSql('DROP INDEX IDX_8A8E26E9DF4C85EA ON conversation');
        $this->addSql('DROP INDEX IDX_8A8E26E9DE18E50B ON conversation');
        $this->addSql('DROP INDEX IDX_8A8E26E919B116D8 ON conversation');
        $this->addSql('ALTER TABLE conversation ADD buyer_id INT DEFAULT NULL, ADD seller_id INT DEFAULT NULL, ADD product_id INT DEFAULT NULL, DROP buyerid_id, DROP seller_id_id, DROP product_id_id');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E96C755722 FOREIGN KEY (buyer_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E98DE820D9 FOREIGN KEY (seller_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E94584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E96C755722 ON conversation (buyer_id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E98DE820D9 ON conversation (seller_id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E94584665A ON conversation (product_id)');
        $this->addSql('ALTER TABLE product ADD is_highlighted TINYINT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E96C755722');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E98DE820D9');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E94584665A');
        $this->addSql('DROP INDEX IDX_8A8E26E96C755722 ON conversation');
        $this->addSql('DROP INDEX IDX_8A8E26E98DE820D9 ON conversation');
        $this->addSql('DROP INDEX IDX_8A8E26E94584665A ON conversation');
        $this->addSql('ALTER TABLE conversation ADD buyerid_id INT DEFAULT NULL, ADD seller_id_id INT DEFAULT NULL, ADD product_id_id INT DEFAULT NULL, DROP buyer_id, DROP seller_id, DROP product_id');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT `FK_8A8E26E919B116D8` FOREIGN KEY (buyerid_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT `FK_8A8E26E9DE18E50B` FOREIGN KEY (product_id_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT `FK_8A8E26E9DF4C85EA` FOREIGN KEY (seller_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E9DF4C85EA ON conversation (seller_id_id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E9DE18E50B ON conversation (product_id_id)');
        $this->addSql('CREATE INDEX IDX_8A8E26E919B116D8 ON conversation (buyerid_id)');
        $this->addSql('ALTER TABLE product DROP is_highlighted');
    }
}

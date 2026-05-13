<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260513072116 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE adress (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, street_number VARCHAR(10) NOT NULL, street_name VARCHAR(255) NOT NULL, postal_code VARCHAR(5) NOT NULL, city VARCHAR(100) NOT NULL, country VARCHAR(50) NOT NULL, latitude NUMERIC(10, 8) NOT NULL, longitude NUMERIC(11, 8) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE boxe (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE color (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE conversation (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, buyer_id INT DEFAULT NULL, seller_id INT DEFAULT NULL, product_id INT DEFAULT NULL, INDEX IDX_8A8E26E96C755722 (buyer_id), INDEX IDX_8A8E26E98DE820D9 (seller_id), INDEX IDX_8A8E26E94584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE etat (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE favorite (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, users_id INT DEFAULT NULL, products_id INT DEFAULT NULL, INDEX IDX_68C58ED967B3B43D (users_id), INDEX IDX_68C58ED96C8A81A9 (products_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE gender (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(20) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE image (id INT AUTO_INCREMENT NOT NULL, path VARCHAR(255) NOT NULL, product_id INT DEFAULT NULL, message_id INT DEFAULT NULL, report_id INT DEFAULT NULL, INDEX IDX_C53D045F4584665A (product_id), INDEX IDX_C53D045F537A1329 (message_id), INDEX IDX_C53D045F4BD2A4C0 (report_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE invoice (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, type VARCHAR(25) NOT NULL, amount NUMERIC(12, 2) NOT NULL, users_id INT DEFAULT NULL, orders_id INT DEFAULT NULL, INDEX IDX_9065174467B3B43D (users_id), INDEX IDX_90651744CFFE9AD6 (orders_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE level (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(25) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, is_read TINYINT NOT NULL, created_at DATETIME NOT NULL, users_id INT DEFAULT NULL, conversation_id INT DEFAULT NULL, offer_id INT DEFAULT NULL, INDEX IDX_B6BD307F67B3B43D (users_id), INDEX IDX_B6BD307F9AC0396 (conversation_id), UNIQUE INDEX UNIQ_B6BD307F53C674EE (offer_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE offer (id INT AUTO_INCREMENT NOT NULL, amount INT NOT NULL, status VARCHAR(25) NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `order` (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(50) NOT NULL, totalprice NUMERIC(12, 2) NOT NULL, shipping_fees INT NOT NULL, services_fees INT NOT NULL, status VARCHAR(25) NOT NULL, created_at DATETIME NOT NULL, stripe_payment_intent_id INT DEFAULT NULL, stripe_tansfer_id INT DEFAULT NULL, weight_total NUMERIC(5, 2) NOT NULL, shipping_label_url VARCHAR(255) NOT NULL, tracking_number VARCHAR(50) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE order_item (id INT AUTO_INCREMENT NOT NULL, price_purchase NUMERIC(12, 2) NOT NULL, orders_id INT DEFAULT NULL, products_id INT DEFAULT NULL, INDEX IDX_52EA1F09CFFE9AD6 (orders_id), INDEX IDX_52EA1F096C8A81A9 (products_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE product (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(150) NOT NULL, brand VARCHAR(100) NOT NULL, description LONGTEXT NOT NULL, price NUMERIC(12, 2) NOT NULL, weight INT NOT NULL, seller_id INT NOT NULL, etat_id INT NOT NULL, INDEX IDX_D34A04AD8DE820D9 (seller_id), INDEX IDX_D34A04ADD5E86FF (etat_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, reason VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, sender_id INT DEFAULT NULL, orderid_id INT DEFAULT NULL, conversation_id INT DEFAULT NULL, message_id INT DEFAULT NULL, INDEX IDX_C42F7784F624B39D (sender_id), INDEX IDX_C42F77846F90D45B (orderid_id), INDEX IDX_C42F77849AC0396 (conversation_id), INDEX IDX_C42F7784537A1329 (message_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, lastname VARCHAR(100) NOT NULL, firstname VARCHAR(100) NOT NULL, pseudo VARCHAR(150) NOT NULL, avatar VARCHAR(255) DEFAULT NULL, birthday_at DATETIME NOT NULL, weight NUMERIC(5, 2) NOT NULL, budget INT NOT NULL, is_active TINYINT NOT NULL, stripe_account_id INT DEFAULT NULL, stripe_customer_id INT DEFAULT NULL, is_onboarding_completed TINYINT NOT NULL, created_at DATETIME NOT NULL, size NUMERIC(3, 2) NOT NULL, boxe_id INT DEFAULT NULL, level_id INT DEFAULT NULL, gender_id INT DEFAULT NULL, INDEX IDX_8D93D64924BD8F20 (boxe_id), INDEX IDX_8D93D6495FB14BA7 (level_id), INDEX IDX_8D93D649708A0E0 (gender_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E96C755722 FOREIGN KEY (buyer_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E98DE820D9 FOREIGN KEY (seller_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E94584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE favorite ADD CONSTRAINT FK_68C58ED967B3B43D FOREIGN KEY (users_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE favorite ADD CONSTRAINT FK_68C58ED96C8A81A9 FOREIGN KEY (products_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE image ADD CONSTRAINT FK_C53D045F4584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE image ADD CONSTRAINT FK_C53D045F537A1329 FOREIGN KEY (message_id) REFERENCES message (id)');
        $this->addSql('ALTER TABLE image ADD CONSTRAINT FK_C53D045F4BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_9065174467B3B43D FOREIGN KEY (users_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE invoice ADD CONSTRAINT FK_90651744CFFE9AD6 FOREIGN KEY (orders_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F67B3B43D FOREIGN KEY (users_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F9AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F53C674EE FOREIGN KEY (offer_id) REFERENCES offer (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09CFFE9AD6 FOREIGN KEY (orders_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F096C8A81A9 FOREIGN KEY (products_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04AD8DE820D9 FOREIGN KEY (seller_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04ADD5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F624B39D FOREIGN KEY (sender_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77846F90D45B FOREIGN KEY (orderid_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77849AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784537A1329 FOREIGN KEY (message_id) REFERENCES message (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D64924BD8F20 FOREIGN KEY (boxe_id) REFERENCES boxe (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D6495FB14BA7 FOREIGN KEY (level_id) REFERENCES level (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D649708A0E0 FOREIGN KEY (gender_id) REFERENCES gender (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E96C755722');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E98DE820D9');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E94584665A');
        $this->addSql('ALTER TABLE favorite DROP FOREIGN KEY FK_68C58ED967B3B43D');
        $this->addSql('ALTER TABLE favorite DROP FOREIGN KEY FK_68C58ED96C8A81A9');
        $this->addSql('ALTER TABLE image DROP FOREIGN KEY FK_C53D045F4584665A');
        $this->addSql('ALTER TABLE image DROP FOREIGN KEY FK_C53D045F537A1329');
        $this->addSql('ALTER TABLE image DROP FOREIGN KEY FK_C53D045F4BD2A4C0');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_9065174467B3B43D');
        $this->addSql('ALTER TABLE invoice DROP FOREIGN KEY FK_90651744CFFE9AD6');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F67B3B43D');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F9AC0396');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307F53C674EE');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F09CFFE9AD6');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F096C8A81A9');
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04AD8DE820D9');
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04ADD5E86FF');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F624B39D');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77846F90D45B');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77849AC0396');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784537A1329');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D64924BD8F20');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D6495FB14BA7');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D649708A0E0');
        $this->addSql('DROP TABLE adress');
        $this->addSql('DROP TABLE boxe');
        $this->addSql('DROP TABLE color');
        $this->addSql('DROP TABLE conversation');
        $this->addSql('DROP TABLE etat');
        $this->addSql('DROP TABLE favorite');
        $this->addSql('DROP TABLE gender');
        $this->addSql('DROP TABLE image');
        $this->addSql('DROP TABLE invoice');
        $this->addSql('DROP TABLE level');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE offer');
        $this->addSql('DROP TABLE `order`');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('DROP TABLE product');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE `user`');
    }
}

<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260612073231 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE adress (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(50) NOT NULL, street_number VARCHAR(10) NOT NULL, street_name VARCHAR(255) NOT NULL, postal_code VARCHAR(5) NOT NULL, city VARCHAR(100) NOT NULL, country VARCHAR(50) NOT NULL, latitude NUMERIC(10, 8) NOT NULL, longitude NUMERIC(11, 8) NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_5CECC7BEA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE conversation (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, buyer_id INT DEFAULT NULL, seller_id INT DEFAULT NULL, product_id INT DEFAULT NULL, INDEX IDX_8A8E26E96C755722 (buyer_id), INDEX IDX_8A8E26E98DE820D9 (seller_id), INDEX IDX_8A8E26E94584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE dictionary (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(50) NOT NULL, label VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE evaluation (id INT AUTO_INCREMENT NOT NULL, rating INT NOT NULL, comment LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, sender_id INT NOT NULL, receiver_id INT NOT NULL, INDEX IDX_1323A575F624B39D (sender_id), INDEX IDX_1323A575CD53EDB6 (receiver_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE favorite (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, users_id INT DEFAULT NULL, products_id INT DEFAULT NULL, INDEX IDX_68C58ED967B3B43D (users_id), INDEX IDX_68C58ED96C8A81A9 (products_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE image (id INT AUTO_INCREMENT NOT NULL, path VARCHAR(255) NOT NULL, product_id INT DEFAULT NULL, message_id INT DEFAULT NULL, report_id INT DEFAULT NULL, INDEX IDX_C53D045F4584665A (product_id), INDEX IDX_C53D045F537A1329 (message_id), INDEX IDX_C53D045F4BD2A4C0 (report_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE invoice (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, type VARCHAR(25) NOT NULL, amount NUMERIC(12, 2) NOT NULL, snapshot JSON DEFAULT NULL, users_id INT DEFAULT NULL, orders_id INT DEFAULT NULL, INDEX IDX_9065174467B3B43D (users_id), INDEX IDX_90651744CFFE9AD6 (orders_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE message (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, is_read TINYINT NOT NULL, created_at DATETIME NOT NULL, users_id INT DEFAULT NULL, conversation_id INT DEFAULT NULL, offer_id INT DEFAULT NULL, INDEX IDX_B6BD307F67B3B43D (users_id), INDEX IDX_B6BD307F9AC0396 (conversation_id), UNIQUE INDEX UNIQ_B6BD307F53C674EE (offer_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, link VARCHAR(255) DEFAULT NULL, is_read TINYINT NOT NULL, created_at DATETIME NOT NULL, type VARCHAR(50) NOT NULL, recipient_id INT DEFAULT NULL, INDEX IDX_BF5476CAE92F8F78 (recipient_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE offer (id INT AUTO_INCREMENT NOT NULL, amount INT NOT NULL, status VARCHAR(25) NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `order` (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(50) NOT NULL, totalprice NUMERIC(12, 2) NOT NULL, shipping_fees INT NOT NULL, services_fees INT NOT NULL, status VARCHAR(25) NOT NULL, created_at DATETIME NOT NULL, stripe_payment_intent_id VARCHAR(255) DEFAULT NULL, stripe_tansfer_id VARCHAR(255) DEFAULT NULL, weight_total NUMERIC(5, 2) DEFAULT NULL, shipping_label_url VARCHAR(255) DEFAULT NULL, tracking_number VARCHAR(50) DEFAULT NULL, buyer_id INT DEFAULT NULL, address_id INT DEFAULT NULL, INDEX IDX_F52993986C755722 (buyer_id), INDEX IDX_F5299398F5B7AF75 (address_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE order_item (id INT AUTO_INCREMENT NOT NULL, price_purchase NUMERIC(12, 2) NOT NULL, orders_id INT DEFAULT NULL, products_id INT DEFAULT NULL, INDEX IDX_52EA1F09CFFE9AD6 (orders_id), INDEX IDX_52EA1F096C8A81A9 (products_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE product (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(150) NOT NULL, brand VARCHAR(100) NOT NULL, description LONGTEXT NOT NULL, price NUMERIC(12, 2) NOT NULL, weight INT NOT NULL, type VARCHAR(50) DEFAULT NULL, size VARCHAR(50) DEFAULT NULL, is_highlighted TINYINT NOT NULL, status VARCHAR(20) DEFAULT \'active\' NOT NULL, suspension_reason LONGTEXT DEFAULT NULL, seller_id INT NOT NULL, etat_id INT NOT NULL, INDEX IDX_D34A04AD8DE820D9 (seller_id), INDEX IDX_D34A04ADD5E86FF (etat_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE product_dictionary (product_id INT NOT NULL, dictionary_id INT NOT NULL, INDEX IDX_8CC7BA0D4584665A (product_id), INDEX IDX_8CC7BA0DAF5E5B3C (dictionary_id), PRIMARY KEY (product_id, dictionary_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, reason VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, status VARCHAR(20) DEFAULT \'pending\' NOT NULL, sender_id INT DEFAULT NULL, order_id INT DEFAULT NULL, conversation_id INT DEFAULT NULL, message_id INT DEFAULT NULL, product_id INT DEFAULT NULL, reported_user_id INT DEFAULT NULL, INDEX IDX_C42F7784F624B39D (sender_id), INDEX IDX_C42F77848D9F6D38 (order_id), INDEX IDX_C42F77849AC0396 (conversation_id), INDEX IDX_C42F7784537A1329 (message_id), INDEX IDX_C42F77844584665A (product_id), INDEX IDX_C42F7784E7566E (reported_user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE sanction (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(50) NOT NULL, reason LONGTEXT NOT NULL, created_at DATETIME NOT NULL, target_user_id INT NOT NULL, INDEX IDX_6D6491AF6C066AFE (target_user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE size_guide (id INT AUTO_INCREMENT NOT NULL, equipment VARCHAR(255) NOT NULL, content JSON NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, lastname VARCHAR(100) NOT NULL, firstname VARCHAR(100) NOT NULL, pseudo VARCHAR(150) NOT NULL, avatar VARCHAR(255) DEFAULT NULL, birthday_at DATETIME DEFAULT NULL, weight NUMERIC(5, 2) DEFAULT NULL, budget INT DEFAULT NULL, is_active TINYINT NOT NULL, stripe_account_id VARCHAR(255) DEFAULT NULL, stripe_customer_id VARCHAR(255) DEFAULT NULL, is_onboarding_completed TINYINT NOT NULL, created_at DATETIME NOT NULL, size INT DEFAULT NULL, refresh_token VARCHAR(255) DEFAULT NULL, refresh_token_expired_at DATETIME DEFAULT NULL, banned_until DATETIME DEFAULT NULL, boxe_id INT DEFAULT NULL, level_id INT DEFAULT NULL, gender_id INT DEFAULT NULL, INDEX IDX_8D93D64924BD8F20 (boxe_id), INDEX IDX_8D93D6495FB14BA7 (level_id), INDEX IDX_8D93D649708A0E0 (gender_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE wallet (id INT AUTO_INCREMENT NOT NULL, balance NUMERIC(10, 2) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_7C68921FA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE wallet_transaction (id INT AUTO_INCREMENT NOT NULL, amount NUMERIC(10, 2) NOT NULL, type VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, reference VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_7DAF972A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE adress ADD CONSTRAINT FK_5CECC7BEA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E96C755722 FOREIGN KEY (buyer_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E98DE820D9 FOREIGN KEY (seller_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E94584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE evaluation ADD CONSTRAINT FK_1323A575F624B39D FOREIGN KEY (sender_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE evaluation ADD CONSTRAINT FK_1323A575CD53EDB6 FOREIGN KEY (receiver_id) REFERENCES `user` (id)');
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
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAE92F8F78 FOREIGN KEY (recipient_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F52993986C755722 FOREIGN KEY (buyer_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F5299398F5B7AF75 FOREIGN KEY (address_id) REFERENCES adress (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09CFFE9AD6 FOREIGN KEY (orders_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F096C8A81A9 FOREIGN KEY (products_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04AD8DE820D9 FOREIGN KEY (seller_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE product ADD CONSTRAINT FK_D34A04ADD5E86FF FOREIGN KEY (etat_id) REFERENCES dictionary (id)');
        $this->addSql('ALTER TABLE product_dictionary ADD CONSTRAINT FK_8CC7BA0D4584665A FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE product_dictionary ADD CONSTRAINT FK_8CC7BA0DAF5E5B3C FOREIGN KEY (dictionary_id) REFERENCES dictionary (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F624B39D FOREIGN KEY (sender_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77848D9F6D38 FOREIGN KEY (order_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77849AC0396 FOREIGN KEY (conversation_id) REFERENCES conversation (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784537A1329 FOREIGN KEY (message_id) REFERENCES message (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77844584665A FOREIGN KEY (product_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784E7566E FOREIGN KEY (reported_user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE sanction ADD CONSTRAINT FK_6D6491AF6C066AFE FOREIGN KEY (target_user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D64924BD8F20 FOREIGN KEY (boxe_id) REFERENCES dictionary (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D6495FB14BA7 FOREIGN KEY (level_id) REFERENCES dictionary (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D649708A0E0 FOREIGN KEY (gender_id) REFERENCES dictionary (id)');
        $this->addSql('ALTER TABLE wallet ADD CONSTRAINT FK_7C68921FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE wallet_transaction ADD CONSTRAINT FK_7DAF972A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adress DROP FOREIGN KEY FK_5CECC7BEA76ED395');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E96C755722');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E98DE820D9');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_8A8E26E94584665A');
        $this->addSql('ALTER TABLE evaluation DROP FOREIGN KEY FK_1323A575F624B39D');
        $this->addSql('ALTER TABLE evaluation DROP FOREIGN KEY FK_1323A575CD53EDB6');
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
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAE92F8F78');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F52993986C755722');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F5299398F5B7AF75');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F09CFFE9AD6');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F096C8A81A9');
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04AD8DE820D9');
        $this->addSql('ALTER TABLE product DROP FOREIGN KEY FK_D34A04ADD5E86FF');
        $this->addSql('ALTER TABLE product_dictionary DROP FOREIGN KEY FK_8CC7BA0D4584665A');
        $this->addSql('ALTER TABLE product_dictionary DROP FOREIGN KEY FK_8CC7BA0DAF5E5B3C');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F624B39D');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77848D9F6D38');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77849AC0396');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784537A1329');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77844584665A');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784E7566E');
        $this->addSql('ALTER TABLE sanction DROP FOREIGN KEY FK_6D6491AF6C066AFE');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D64924BD8F20');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D6495FB14BA7');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D649708A0E0');
        $this->addSql('ALTER TABLE wallet DROP FOREIGN KEY FK_7C68921FA76ED395');
        $this->addSql('ALTER TABLE wallet_transaction DROP FOREIGN KEY FK_7DAF972A76ED395');
        $this->addSql('DROP TABLE adress');
        $this->addSql('DROP TABLE conversation');
        $this->addSql('DROP TABLE dictionary');
        $this->addSql('DROP TABLE evaluation');
        $this->addSql('DROP TABLE favorite');
        $this->addSql('DROP TABLE image');
        $this->addSql('DROP TABLE invoice');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE offer');
        $this->addSql('DROP TABLE `order`');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('DROP TABLE product');
        $this->addSql('DROP TABLE product_dictionary');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE sanction');
        $this->addSql('DROP TABLE size_guide');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE wallet');
        $this->addSql('DROP TABLE wallet_transaction');
    }
}

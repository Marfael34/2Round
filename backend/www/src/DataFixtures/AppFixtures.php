<?php

namespace App\DataFixtures;

use App\Entity\Boxe;
use App\Entity\Etat;
use App\Entity\Gender;
use App\Entity\Level;
use App\Entity\Image;
use App\Entity\Product;
use App\Entity\User;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private readonly UserPasswordHasherInterface $passwordHasher) {}

    public function load(ObjectManager $manager): void
    {
        $this->loadBoxe($manager);
        $this->loadLevel($manager);
        $this->loadGender($manager);
        $this->loadEtat($manager);
        $this->loadUser($manager);
        $this->loadProduct($manager);

        $manager->flush();
    }

    public function loadGender(ObjectManager $manager)
    {
        $genders = [
            'Homme',
            'Femme',
            'Autre'
        ];

        foreach ($genders as $key => $label) {
            $gender = new Gender();
            $gender->setLabel($label);
            
            $manager->persist($gender);
            $this->addReference('gender_' . $key, $gender);
        }
    }

    public function loadLevel(ObjectManager $manager)
    {
        $levels = [
            'Débutant',
            'Intermédiaire',
            'Avancé',
            'Compétiteur'
        ];

        foreach ($levels as $key => $label) {
            $level = new Level();
            $level->setLabel($label);
            
            $manager->persist($level);
            $this->addReference('level_' . $key, $level);
        }
    }

    public function loadBoxe(ObjectManager $manager)
    {
        $boxes = [
            'Boxe anglaise',
            'Boxe française (Savate)',
            'Boxe thaï (Muay-thaï)',
            'Kick-boxing',
            'MMA (Arts martiaux mixtes)'
        ];

        foreach ($boxes as $key => $label) {
            $boxe = new Boxe();
            $boxe->setLabel($label);
            
            $manager->persist($boxe);
            $this->addReference('boxe_' . $key, $boxe);
        }
    }
    
    public function loadUser(ObjectManager $manager)
    {
        // L'admin ne compte pas comme un utilisateur vendeur classique
        $admin = new User();
        $admin->setEmail('admin@admin.com');
        $admin->setFirstname("Admin");
        $admin->setLastname("Admin");
        $admin->setPseudo('Admin');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin'));
        $admin->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $admin->setBirthdayAt(new \DateTime('2026-03-20'));
        $admin->setCreatedAt(new DateTime());
        $admin->setIsActive(true);
        $admin->setWeight('75.00');
        $admin->setSize('1.80');
        $admin->setBudget(0);
        $admin->setIsOnboardingCompleted(true);
        $admin->setAvatar('https://i.pravatar.cc/150?u=admin');
        $admin->setBoxeId($this->getReference('boxe_0', Boxe::class));
        $admin->setLevelId($this->getReference('level_3', Level::class));
        $admin->setGenderId($this->getReference('gender_0', Gender::class));

        $manager->persist($admin);

        // Ajout de plus d'utilisateurs pour avoir de la variété dans les vendeurs
        $arrayUser = [
            ['prenom' => 'Léna', 'nom' => 'Bertrand', 'email' => 'l.bertrand.crea@gmail.com', 'pseudo' => 'PixelArtiste_92', 'birthday' => '1992-05-14', 'phone' => '06.11.22.33.44', 'weight' => '62.50', 'size' => '1.65', 'budget' => 200, 'gender' => 1],
            ['prenom' => 'Julien', 'nom' => 'Masson', 'email' => 'j-masson-85@gmail.com', 'pseudo' => 'JulesLeRandonneur', 'birthday' => '1985-11-03', 'phone' => '07.99.88.77.66', 'weight' => '80.00', 'size' => '1.82', 'budget' => 150, 'gender' => 0],
            ['prenom' => 'Inès', 'nom' => 'Belkacem', 'email' => 'belkacem.ines@gmail.com', 'pseudo' => 'CyberInes_XP', 'birthday' => '2001-08-22', 'phone' => '06.55.44.33.22', 'weight' => '55.00', 'size' => '1.58', 'budget' => 300, 'gender' => 1],
            ['prenom' => 'Marc', 'nom' => 'Dubois', 'email' => 'marc.dubois.boxe@gmail.com', 'pseudo' => 'MarcoBoxing', 'birthday' => '1990-02-10', 'phone' => '06.12.34.56.78', 'weight' => '90.00', 'size' => '1.88', 'budget' => 50, 'gender' => 0],
            ['prenom' => 'Sophie', 'nom' => 'Laurent', 'email' => 'sophie.l@gmail.com', 'pseudo' => 'SosoFight', 'birthday' => '1995-07-30', 'phone' => '07.88.99.00.11', 'weight' => '68.00', 'size' => '1.70', 'budget' => 120, 'gender' => 1],
        ];

        foreach ($arrayUser as $key => $value) {
            $user = new User();
            $user->setFirstname($value['prenom']);
            $user->setLastname($value['nom']);
            $user->setEmail($value['email']);
            $user->setPseudo($value['pseudo']);
            $user->setBirthdayAt(new \DateTime($value['birthday']));
            $user->setPassword($this->passwordHasher->hashPassword($user, 'user'));
            $user->setRoles(['ROLE_USER']);
            $user->setCreatedAt(new DateTime());
            $user->setIsActive(true);
            $user->setWeight($value['weight']);
            $user->setSize($value['size']);
            $user->setBudget($value['budget']);
            $user->setIsOnboardingCompleted(true);
            $user->setAvatar('https://i.pravatar.cc/150?u=' . $value['pseudo']);
            $user->setBoxeId($this->getReference('boxe_' . rand(0, 4), Boxe::class));
            $user->setLevelId($this->getReference('level_' . rand(0, 3), Level::class));
            $user->setGenderId($this->getReference('gender_' . $value['gender'], Gender::class));

            $manager->persist($user);

            // user_0, user_1, user_2, user_3, user_4
            $this->addReference('user_' . $key, $user);
        }
    }

    public function loadEtat(ObjectManager $manager)
    {
        $etats = [
            'Neuf avec étiquette',
            'Neuf sans étiquette',
            'Très bon état',
            'Bon état',
            'Satisfaisant'
        ];

        foreach ($etats as $key => $label) {
            $etat = new Etat();
            $etat->setLabel($label);
            
            $manager->persist($etat);
            $this->addReference('etat_' . $key, $etat);
        }
    }

    public function loadProduct(ObjectManager $manager)
    {
        $products = [
            [
                'title' => 'Gants de boxe Venum Challenger 3.0',
                'brand' => 'Venum',
                'description' => 'Gants de boxe 14oz très peu servis. Idéal pour l\'entraînement au sac ou sparring léger. Quelques légères traces d\'usure sur le pouce mais mousse intacte.',
                'price' => '35.00',
                'weight' => 800
            ],
            [
                'title' => 'Casque de protection Everlast',
                'brand' => 'Everlast',
                'description' => 'Casque intégral avec protection pommettes. Taille M. Porté une dizaine de fois, désinfecté après chaque usage. Attache velcro en parfait état.',
                'price' => '25.50',
                'weight' => 450
            ],
            [
                'title' => 'Sac de frappe 120cm Metal Boxe + Fixation',
                'brand' => 'Metal Boxe',
                'description' => 'Sac lourd (environ 30kg) idéal pour travailler la puissance. Vendu avec la chaîne et l\'attache plafond. Très robuste, cuir synthétique impeccable.',
                'price' => '60.00',
                'weight' => 30000
            ],
            [
                'title' => 'Chaussures de boxe anglaise Adidas',
                'brand' => 'Adidas',
                'description' => 'Modèle Box Hog 3, pointure 42. Super légères et respirantes. La semelle accroche encore parfaitement sur le ring. Un peu grisées sur le bout mais encore bonnes.',
                'price' => '40.00',
                'weight' => 600
            ],
            [
                'title' => 'Bandes de maintien 4m (Lot de 2 paires)',
                'brand' => 'Outshock',
                'description' => 'Deux paires de bandes rouges et noires pour protéger vos articulations. Lavées en machine, ne sont plus élastiques comme au premier jour mais font le job.',
                'price' => '5.00',
                'weight' => 150
            ]
        ];

        foreach ($products as $key => $data) {
            $product = new Product();
            $product->setTitle($data['title']);
            $product->setBrand($data['brand']);
            $product->setDescription($data['description']);
            $product->setPrice($data['price']);
            $product->setWeight($data['weight']);

            // Liaison avec un Vendeur (User) unique et aléatoire (entre user_0 et user_4)
            // On exclut l'admin car il n'est pas dans la liste des références "user_X"
            $randomUserId = rand(0, 4);
            $product->setSeller($this->getReference('user_' . $randomUserId, User::class));

            // Liaison avec un État aléatoire
            $randomEtatId = rand(0, 4);
            $product->setEtat($this->getReference('etat_' . $randomEtatId, Etat::class));

            // Ajout de 1 à 3 images aléatoires pour ce produit
            $nbImages = rand(1, 3);
            for ($i = 1; $i <= $nbImages; $i++) {
                $image = new Image();
                // Utilisation d'une URL d'image de placeholder réaliste pour l'intégration front
                $image->setPath('https://picsum.photos/seed/product_' . $key . '_' . $i . '/600/400');
                $image->setProduct($product);
                $manager->persist($image);
            }

            $manager->persist($product);
        }
    }
}
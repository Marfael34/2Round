<?php

namespace App\DataFixtures;

use App\Entity\Dictionary;
use App\Entity\Image;
use App\Entity\Product;
use App\Entity\User;
use App\Entity\SizeGuide;
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
        $this->loadColor($manager);
        $this->loadProduct($manager);
        $this->loadSizeGuide($manager);

        $manager->flush();
    }

    public function loadColor(ObjectManager $manager)
    {
        $colors = [
            'noir', 'rouge', 'bleu', 'blanc', 'jaune', 'vert', 'or', 'argent', 'rose', 'marron', 'gris', 
            'violet', 'orange', 'kaki', 'beige', 'bordeaux', 'multicolore', 'cyan', 'magenta', 'turquoise', 
            'corail', 'indigo', 'saumon', 'fuchsia', 'olive', 'prune', 'moutarde', 'lilas', 'menthe', 
            'lavande', 'ocre', 'anthracite', 'pourpre', 'émeraude', 'bronze', 'cuivre'
        ];

        foreach ($colors as $key => $colorLabel) {
            $color = new Dictionary();
            $color->setType('color');
            $color->setLabel($colorLabel);
            $manager->persist($color);
            $this->addReference('color_' . $colorLabel, $color);
        }
    }

    public function loadGender(ObjectManager $manager)
    {
        $genders = [
            'Homme',
            'Femme',
            'Autre'
        ];

        foreach ($genders as $key => $label) {
            $gender = new Dictionary();
            $gender->setType('gender');
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
            $level = new Dictionary();
            $level->setType('level');
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
            $boxe = new Dictionary();
            $boxe->setType('boxe');
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
        $admin->setSize('180');
        $admin->setBudget(0);
        $admin->setIsOnboardingCompleted(true);
        $admin->setAvatar('/images/Logo.png');
        $admin->setBoxe($this->getReference('boxe_0', Dictionary::class));
        $admin->setLevel($this->getReference('level_3', Dictionary::class));
        $admin->setGender($this->getReference('gender_0', Dictionary::class));

        $manager->persist($admin);

        // Ajout de plus d'utilisateurs pour avoir de la variété dans les vendeurs
        $arrayUser = [
            ['prenom' => 'Léna', 'nom' => 'Bertrand', 'email' => 'l.bertrand.crea@gmail.com', 'pseudo' => 'PixelArtiste_92', 'birthday' => '1992-05-14', 'phone' => '06.11.22.33.44', 'weight' => '62.50', 'size' => '165', 'budget' => 200, 'gender' => 1],
            ['prenom' => 'Julien', 'nom' => 'Masson', 'email' => 'j-masson-85@gmail.com', 'pseudo' => 'JulesLeRandonneur', 'birthday' => '1985-11-03', 'phone' => '07.99.88.77.66', 'weight' => '80.00', 'size' => '182', 'budget' => 150, 'gender' => 0],
            ['prenom' => 'Inès', 'nom' => 'Belkacem', 'email' => 'belkacem.ines@gmail.com', 'pseudo' => 'CyberInes_XP', 'birthday' => '2001-08-22', 'phone' => '06.55.44.33.22', 'weight' => '55.00', 'size' => '158', 'budget' => 300, 'gender' => 1],
            ['prenom' => 'Marc', 'nom' => 'Dubois', 'email' => 'marc.dubois.boxe@gmail.com', 'pseudo' => 'MarcoBoxing', 'birthday' => '1990-02-10', 'phone' => '06.12.34.56.78', 'weight' => '90.00', 'size' => '188', 'budget' => 50, 'gender' => 0],
            ['prenom' => 'Sophie', 'nom' => 'Laurent', 'email' => 'sophie.l@gmail.com', 'pseudo' => 'SosoFight', 'birthday' => '1995-07-30', 'phone' => '07.88.99.00.11', 'weight' => '68.00', 'size' => '170', 'budget' => 120, 'gender' => 1],
            ['prenom' => 'Thomas', 'nom' => 'Roux', 'email' => 'thomas.roux@gmail.com', 'pseudo' => 'TomTomBoxe', 'birthday' => '1998-12-05', 'phone' => '06.12.98.34.76', 'weight' => '72.00', 'size' => '175', 'budget' => 90, 'gender' => 0],
            ['prenom' => 'Clara', 'nom' => 'Moreau', 'email' => 'claramoreau@mail.com', 'pseudo' => 'ClaraPunch', 'birthday' => '2000-03-15', 'phone' => '07.45.67.89.01', 'weight' => '60.00', 'size' => '168', 'budget' => 250, 'gender' => 1],
            ['prenom' => 'Hugo', 'nom' => 'Blanc', 'email' => 'hugo.b@gmail.com', 'pseudo' => 'HugoFighter', 'birthday' => '1993-09-22', 'phone' => '06.87.65.43.21', 'weight' => '85.00', 'size' => '185', 'budget' => 110, 'gender' => 0],
            ['prenom' => 'Emma', 'nom' => 'Petit', 'email' => 'emma.petit@gmail.com', 'pseudo' => 'EmmaBox', 'birthday' => '1997-01-11', 'phone' => '07.12.34.56.78', 'weight' => '58.00', 'size' => '162', 'budget' => 180, 'gender' => 1],
            ['prenom' => 'Lucas', 'nom' => 'Garnier', 'email' => 'lucas.g@gmail.com', 'pseudo' => 'LucK_O', 'birthday' => '1996-06-18', 'phone' => '06.99.88.77.11', 'weight' => '78.00', 'size' => '179', 'budget' => 140, 'gender' => 0],
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
            $avatarId = ($key % 5) + 1;
            $user->setAvatar('/images/Profile/pdp_' . $avatarId . '.webp');
            $user->setBoxe($this->getReference('boxe_' . rand(0, 4), Dictionary::class));
            $user->setLevel($this->getReference('level_' . rand(0, 3), Dictionary::class));
            $user->setGender($this->getReference('gender_' . $value['gender'], Dictionary::class));

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
            $etat = new Dictionary();
            $etat->setType('etat');
            $etat->setLabel($label);
            
            $manager->persist($etat);
            $this->addReference('etat_' . $key, $etat);
        }
    }

    public function loadProduct(ObjectManager $manager)
    {
        $products = [
            // 1 à 10 : Produits d'origine
            [
                'title' => 'Gants de boxe Venum Challenger 3.0',
                'brand' => 'Venum',
                'description' => 'Gants de boxe 14oz très peu servis. Idéal pour l\'entraînement au sac ou sparring léger. Quelques légères traces d\'usure sur le pouce mais mousse intacte.',
                'price' => '35.00',
                'weight' => 800,
                'images' => ['gloves.webp'],
                'type' => 'Gants de boxe',
                'size' => '14 oz',
                'colors' => ['noir']
            ],
            [
                'title' => 'Casque de protection Everlast',
                'brand' => 'Everlast',
                'description' => 'Casque intégral avec protection pommettes. Taille M. Porté une dizaine de fois, désinfecté après chaque usage. Attache velcro en parfait état.',
                'price' => '25.50',
                'weight' => 450,
                'images' => ['helmet.webp'],
                'type' => 'Casques',
                'size' => 'M',
                'colors' => ['noir']
            ],
            [
                'title' => 'Sac de frappe 120cm Metal Boxe + Fixation',
                'brand' => 'Metal Boxe',
                'description' => 'Sac lourd (environ 30kg) idéal pour travailler la puissance. Vendu avec la chaîne et l\'attache plafond. Très robuste, cuir synthétique impeccable.',
                'price' => '60.00',
                'weight' => 30000,
                'images' => ['punching bag_1.webp', 'punching bag_2.webp'],
                'type' => 'Sacs de frappe',
                'size' => '120 cm',
                'colors' => ['noir']
            ],
            [
                'title' => 'Chaussures de boxe anglaise Adidas',
                'brand' => 'Adidas',
                'description' => 'Modèle Box Hog 3, pointure 42. Super légères et respirantes. La semelle accroche encore parfaitement sur le ring. Un peu grisées sur le bout mais encore bonnes.',
                'price' => '40.00',
                'weight' => 600,
                'images' => ['shoes.webp'],
                'type' => 'Chaussures',
                'size' => '42',
                'colors' => ['noir']
            ],
            [
                'title' => 'Bandes de maintien 4m (Lot de 2 paires)',
                'brand' => 'Outshock',
                'description' => 'Deux paires de bandes rouges et noires pour protéger vos articulations. Lavées en machine, ne sont plus élastiques comme au premier jour mais font le job.',
                'price' => '5.00',
                'weight' => 150,
                'images' => ['strips_2.webp'],
                'type' => 'Accessoires',
                'size' => '4 m',
                'colors' => ['vert', 'violet']
            ],
            [
                'title' => 'Gants de boxe Cleto Reyes',
                'brand' => 'Cleto Reyes',
                'description' => 'Gants professionnels 12oz. Très bonne qualité de cuir. Portés pour quelques combats seulement.',
                'price' => '120.00',
                'weight' => 700,
                'images' => ['gloves_2.webp'],
                'type' => 'Gants de boxe',
                'size' => '12 oz',
                'colors' => ['rouge']
            ],
            [
                'title' => 'Short de boxe thaï Fairtex',
                'brand' => 'Fairtex',
                'description' => 'Short Muay Thaï taille L, très confortable. Rouge et or.',
                'price' => '25.00',
                'weight' => 200,
                'images' => ['short.webp'],
                'type' => 'Vêtements',
                'size' => 'L',
                'colors' => ['rouge', 'or']
            ],
            [
                'title' => 'Protège-tibias Venum',
                'brand' => 'Venum',
                'description' => 'Protège-tibias taille M. Bon état, scratch qui tient bien.',
                'price' => '30.00',
                'weight' => 500,
                'images' => ['shin_guard.webp'],
                'type' => 'Protections',
                'size' => 'M',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Corde à sauter rapide',
                'brand' => 'Everlast',
                'description' => 'Corde à sauter en acier, idéale pour le double under.',
                'price' => '10.00',
                'weight' => 150,
                'images' => ['skipping_rope.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['noir']
            ],
            [
                'title' => 'Coquille de protection',
                'brand' => 'Shock Doctor',
                'description' => 'Coquille homme taille L. Lavée et désinfectée.',
                'price' => '15.00',
                'weight' => 200,
                'images' => ['protective_shell.webp'],
                'type' => 'Protections',
                'size' => 'L',
                'colors' => ['blanc', 'gris']
            ],
            [
                'title' => 'Gants d\'entraînement Adidas Speed 50',
                'brand' => 'Adidas',
                'description' => 'Gants 10oz parfaits pour l\'initiation et la frappe sur sac. Simili cuir robuste. Très peu portés, aspect comme neuf.',
                'price' => '22.00',
                'weight' => 600,
                'images' => ['gloves_3.webp'],
                'type' => 'Gants de boxe',
                'size' => '10 oz',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Short de Muay Thaï Twins Special',
                'brand' => 'Twins Special',
                'description' => 'Short traditionnel thaïlandais, taille M. Tissu satiné bleu avec motifs brodés. Léger accroc sur le côté droit mais ne gêne en rien.',
                'price' => '28.00',
                'weight' => 180,
                'images' => ['short_2.webp'],
                'type' => 'Vêtements',
                'size' => 'M',
                'colors' => ['bleu', 'or']
            ],
            [
                'title' => 'Protège-dents Venum Challenger',
                'brand' => 'Venum',
                'description' => 'Neuf, jamais moulé. Dans sa boîte d\'origine avec la notice de thermoformage. Idéal pour tous sports de combat.',
                'price' => '12.00',
                'weight' => 80,
                'images' => ['mouthguard.webp'],
                'type' => 'Protections',
                'size' => 'Unique',
                'colors' => ['noir', 'rouge']
            ],
            [
                'title' => 'Bandes de boxe Meister 4.5m',
                'brand' => 'Meister',
                'description' => 'Paire de bandes élastiques de 4.5 mètres, excellentes pour un maintien optimal du poignet. Lavées 2 fois.',
                'price' => '7.00',
                'weight' => 120,
                'images' => ['strips_3.webp'],
                'type' => 'Accessoires',
                'size' => '4.5 m',
                'colors' => ['noir']
            ],
            [
                'title' => 'Sac de frappe sur pied Century BOB',
                'brand' => 'Century',
                'description' => 'Mannequin de frappe BOB. La base est à remplir d\'eau ou de sable. Le torse en latex est en excellent état. Idéal pour la précision.',
                'price' => '250.00',
                'weight' => 15000,
                'images' => ['test_dummy.webp'],
                'type' => 'Sacs de frappe',
                'size' => 'Unique',
                'colors' => ['beige', 'noir']
            ],
            [
                'title' => 'Chaussures Nike Machomai 2',
                'brand' => 'Nike',
                'description' => 'Pointure 44. Chaussures très légères pour un jeu de jambes rapide. Légère usure sur la pointe du pied gauche.',
                'price' => '55.00',
                'weight' => 500,
                'images' => ['shoes_2.webp'],
                'type' => 'Chaussures',
                'size' => '44',
                'colors' => ['blanc', 'or']
            ],
            [
                'title' => 'Casque intégral Rival Boxing',
                'brand' => 'Rival',
                'description' => 'Casque avec barre de protection faciale. Modèle pro en taille L. Mousse D3O. Protège parfaitement le nez lors des gros sparrings.',
                'price' => '85.00',
                'weight' => 600,
                'images' => ['helmet_2.webp'],
                'type' => 'Casques',
                'size' => 'L',
                'colors' => ['noir']
            ],
            [
                'title' => 'Gants de sac Hayabusa T3',
                'brand' => 'Hayabusa',
                'description' => 'Gants 12oz conçus spécifiquement pour le travail au sac et aux pattes d\'ours. Double velcro de fermeture. Cuir premium.',
                'price' => '90.00',
                'weight' => 700,
                'images' => ['gloves_4.webp'],
                'type' => 'Gants de boxe',
                'size' => '12 oz',
                'colors' => ['noir', 'gris']
            ],
            [
                'title' => 'Protège-tibias Fairtex SP5',
                'brand' => 'Fairtex',
                'description' => 'Taille L. Modèle sans protection du pied amovible. Très léger et ne tourne pas pendant les kicks. État neuf.',
                'price' => '65.00',
                'weight' => 800,
                'images' => ['shin_guard_2.webp'],
                'type' => 'Protections',
                'size' => 'L',
                'colors' => ['bleu']
            ],
            [
                'title' => 'T-shirt de compression Under Armour',
                'brand' => 'Under Armour',
                'description' => 'Rashguard manches courtes taille M. Évacue très bien la transpiration. Idéal sous les gants de boxe ou en MMA.',
                'price' => '20.00',
                'weight' => 150,
                'images' => ['tshirt.webp'],
                'type' => 'Vêtements',
                'size' => 'M',
                'colors' => ['noir']
            ],
            [
                'title' => 'Corde à sauter lourde (1kg)',
                'brand' => 'Metal Boxe',
                'description' => 'Corde lestée pour un travail des épaules et du cardio intense. Poignées en mousse pour une bonne prise en main.',
                'price' => '18.00',
                'weight' => 1000,
                'images' => ['skipping_rope_2.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['noir', 'rouge']
            ],
            [
                'title' => 'Bouclier de frappe Metal Boxe',
                'brand' => 'Metal Boxe',
                'description' => 'Pao de frappe courbé pour l\'entraînement aux coups de pied et genoux. Vendu à l\'unité. Cuir PU très résistant.',
                'price' => '35.00',
                'weight' => 1200,
                'images' => ['strikeShield.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['noir']
            ],
            [
                'title' => 'Gants de boxe Leone 1947',
                'brand' => 'Leone 1947',
                'description' => 'Gants 16oz modèle "Il Tecnico". Un classique italien, mousse très absorbante. Ont fait une saison complète.',
                'price' => '45.00',
                'weight' => 900,
                'images' => ['gloves_5.webp'],
                'type' => 'Gants de boxe',
                'size' => '16 oz',
                'colors' => ['vert', 'or']
            ],
              
            [
                'title' => 'Short de MMA Venum Gladiator',
                'brand' => 'Venum',
                'description' => 'Taille S. Short de combat ultra résistant avec fentes latérales pour une liberté de mouvement maximale au sol.',
                'price' => '32.00',
                'weight' => 200,
                'images' => ['short_3.webp'],
                'type' => 'Vêtements',
                'size' => 'S',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Chaussures Everlast Elite',
                'brand' => 'Everlast',
                'description' => 'Pointure 39. Modèle mi-montant offrant un bon maintien de la cheville. La semelle Michelin assure un bon grip.',
                'price' => '60.00',
                'weight' => 550,
                'images' => ['shoes_3.webp'],
                'type' => 'Chaussures',
                'size' => '39',
                'colors' => ['rouge', 'noir']
            ],
            [
                'title' => 'Casque ouvert Cleto Reyes',
                'brand' => 'Cleto Reyes',
                'description' => 'Casque pro mexicain en cuir véritable. Taille M. Dégage bien la vue tout en protégeant les tempes et sourcils.',
                'price' => '110.00',
                'weight' => 400,
                'images' => ['helmet_3.webp'],
                'type' => 'Casques',
                'size' => 'M',
                'colors' => ['rouge']
            ],
            [
                'title' => 'Pattes d\'ours courbées Title Boxing',
                'brand' => 'Title Boxing',
                'description' => 'Paire de pattes d\'ours en cuir pour le travail de précision du coach. Légères et ergonomiques. Bon état.',
                'price' => '40.00',
                'weight' => 500,
                'images' => ['bearsPaw.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Protège-poitrine femme',
                'brand' => 'Outshock',
                'description' => 'Brassière de protection avec coques amovibles. Taille M. Portée quelques fois, lavée avec soin.',
                'price' => '15.00',
                'weight' => 150,
                'images' => ['brassiere.webp'],
                'type' => 'Protections',
                'size' => 'M',
                'colors' => ['blanc']
            ],
            [
                'title' => 'Sac de frappe uppercut 90cm',
                'brand' => 'RDX',
                'description' => 'Sac forme poire pour travailler les uppercuts et crochets. Poids 25kg. Cuir synthétique Maya Hide très durable.',
                'price' => '70.00',
                'weight' => 25000,
                'images' => ['Uppercutpunching_bag.webp'],
                'type' => 'Sacs de frappe',
                'size' => '90 cm',
                'colors' => ['noir', 'rouge']
            ],
            [
                'title' => 'Bandes gel sous-gants',
                'brand' => 'Venum',
                'description' => 'Alternative rapide aux bandes classiques. Mitaines avec gel de protection pour les phalanges. Lavables. Taille L/XL.',
                'price' => '14.00',
                'weight' => 100,
                'images' => ['strips_4.webp'],
                'type' => 'Accessoires',
                'size' => 'L',
                'colors' => ['noir']
            ],
            
            [
                'title' => 'Gants de boxe Winning 16oz',
                'brand' => 'Winning',
                'description' => 'Le saint graal des gants de sparring. Mousse incroyablement protectrice. Cuir impeccable. Un investissement pour la vie.',
                'price' => '300.00',
                'weight' => 900,
                'images' => ['gloves_6.webp'],
                'type' => 'Gants de boxe',
                'size' => '16 oz',
                'colors' => ['bleu']
            ],
            [
                'title' => 'Débardeur de boxe anglaise',
                'brand' => 'Adidas',
                'description' => 'Débardeur réversible rouge/bleu pour la compétition amateur. Taille L. Matière technique très légère.',
                'price' => '18.00',
                'weight' => 120,
                'images' => ['tshirt_2.webp'],
                'type' => 'Vêtements',
                'size' => 'L',
                'colors' => ['rouge', 'bleu']
            ],
            [
                'title' => 'Coquille pro thaï en métal',
                'brand' => 'Twins Special',
                'description' => 'La vraie coquille thaï avec lacets traditionnels. Protection ultime. Taille adulte standard.',
                'price' => '25.00',
                'weight' => 300,
                'images' => ['protective_shell_2.webp'],
                'type' => 'Protections',
                'size' => 'Unique',
                'colors' => ['argent', 'rouge']
            ],
            [
                'title' => 'Chaussures Rival RSX-Genesis',
                'brand' => 'Rival',
                'description' => 'Pointure 43. Bottines de boxe très confortables avec semelle renforcée. Très bon état général, lacets neufs.',
                'price' => '65.00',
                'weight' => 580,
                'images' => ['shoes_4.webp'],
                'type' => 'Chaussures',
                'size' => '43',
                'colors' => ['noir', 'argent']
            ],
            
            [
                'title' => 'Poire de vitesse en cuir',
                'brand' => 'Everlast',
                'description' => 'Speed bag taille M en cuir de vache. Excellent pour la coordination oeil-main. Livrée sans le plateau rotatif.',
                'price' => '22.00',
                'weight' => 200,
                'images' => ['SpeedBulb.webp'],
                'type' => 'Sacs de frappe',
                'size' => 'M',
                'colors' => ['marron']
            ],
            [
                'title' => 'Casque à barre RDX',
                'brand' => 'RDX',
                'description' => 'Casque de protection avec barre frontale en PVC. Bon compromis sécurité/prix. Taille XL.',
                'price' => '35.00',
                'weight' => 550,
                'images' => ['helmet_4.webp'],
                'type' => 'Casques',
                'size' => 'XL',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Chevillères de maintien (Paire)',
                'brand' => 'Fairtex',
                'description' => 'Chevillères élastiques en coton pour le Muay Thaï. Taille M. Protègent des frottements sur le tatami.',
                'price' => '8.00',
                'weight' => 100,
                'images' => ['AnkleSupports.webp'],
                'type' => 'Protections',
                'size' => 'M',
                'colors' => ['rouge']
            ],
            [
                'title' => 'Corde à sauter vitesse aluminium',
                'brand' => 'Crossrope',
                'description' => 'Corde à roulement à billes ultra fluide. Poignées en alu, câble en acier remplaçable. Utilisée pour l\'échauffement rapide.',
                'price' => '28.00',
                'weight' => 200,
                'images' => ['skipping_rope_3.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['argent', 'noir']
            ],
            [
                'title' => 'Ensemble Survêtement Sudation',
                'brand' => 'RDX',
                'description' => 'Survêtement sauna complet (veste + pantalon). Taille L. Idéal pour les coupes de poids (weight cut).',
                'price' => '30.00',
                'weight' => 400,
                'images' => ['SudationTracksuit.webp', 'SudationTracksuit_2.webp', 'SudationTracksuit_3.webp'],
                'type' => 'Vêtements',
                'size' => 'L',
                'colors' => ['noir', 'gris']
            ],
            [
                'title' => 'Gants de boxe Venum Giant 3.0',
                'brand' => 'Venum',
                'description' => 'Gants 16oz en cuir Nappa véritable. Mousse quadruple densité. État presque irréprochable, cuir nourri régulièrement.',
                'price' => '85.00',
                'weight' => 900,
                'images' => ['gloves_7.webp'],
                'type' => 'Gants de boxe',
                'size' => '16 oz',
                'colors' => ['noir', 'or']
            ],
            [
                'title' => 'Plastron de frappe entraîneur',
                'brand' => 'Metal Boxe',
                'description' => 'Protège-ventre pour recevoir les coups de pied et genoux. Rembourrage très épais. Taille réglable.',
                'price' => '50.00',
                'weight' => 1500,
                'images' => ['TrainingStriking.webp', 'TrainingStriking_2.webp'],
                'type' => 'Protections',
                'size' => 'Unique',
                'colors' => ['noir']
            ],
            [
                'title' => 'Bandes mexicaines 4m',
                'brand' => 'Title Boxing',
                'description' => 'Style mexicain (légèrement élastiques) pour un contour parfait du poing. Neuves sous blister.',
                'price' => '9.00',
                'weight' => 150,
                'images' => ['strips_4.webp'],
                'type' => 'Accessoires',
                'size' => '4 m',
                'colors' => ['jaune']
            ],
            [
                'title' => 'Casque intégral enfant',
                'brand' => 'Outshock',
                'description' => 'Idéal pour l\'initiation des 8-12 ans. Mousse souple et protection des pommettes. Très léger.',
                'price' => '12.00',
                'weight' => 300,
                'images' => ['helmet_5.webp'],
                'type' => 'Casques',
                'size' => 'S',
                'colors' => ['bleu', 'blanc']
            ],
            [
                'title' => 'Chaussures de boxe Nike Hyperko 1',
                'brand' => 'Nike',
                'description' => 'Modèle légendaire introuvable, pointure 42.5. Technologie flywire. Usure normale de la semelle après 1 an de pratique.',
                'price' => '150.00',
                'weight' => 450,
                'images' => ['shoes_5.webp'],
                'type' => 'Chaussures',
                'size' => '42',
                'colors' => ['noir', 'argent']
            ],
            [
                'title' => 'Gants de sac Metal Boxe PB480',
                'brand' => 'Metal Boxe',
                'description' => 'Gants légers type mitaines fermées pour le travail au sac lourd. Pouce ouvert.',
                'price' => '15.00',
                'weight' => 300,
                'images' => ['gloves_8.webp'],
                'type' => 'Gants de boxe',
                'size' => 'M',
                'colors' => ['noir']
            ],
            [
                'title' => 'Sacoche de sport "Boxing Club"',
                'brand' => 'Sans marque',
                'description' => 'Sac de sport spacieux avec compartiment aéré pour les gants et chaussures. Bandoulière solide.',
                'price' => '20.00',
                'weight' => 800,
                'images' => ['bag.webp'],
                'type' => 'Accessoires',
                'size' => 'Unique',
                'colors' => ['gris', 'noir']
            ],
            [
                'title' => 'Protège-dents OPRO Gold',
                'brand' => 'OPRO',
                'description' => 'Protège-dents thermoformable haut de gamme. Jamais utilisé, erreur de commande (trop petit pour moi).',
                'price' => '18.00',
                'weight' => 80,
                'images' => ['mouthguard_2.webp'],
                'type' => 'Protections',
                'size' => 'M',
                'colors' => ['or', 'noir']
            ],
            [
                'title' => 'Short Boxe Anglaise Lonsdale',
                'brand' => 'Lonsdale',
                'description' => 'Style rétro avec large bande élastique à la taille. Coupe ample descendant au genou. Taille XL.',
                'price' => '22.00',
                'weight' => 250,
                'images' => ['short_4.webp'],
                'type' => 'Vêtements',
                'size' => 'XL',
                'colors' => ['noir', 'blanc']
            ],
            [
                'title' => 'Genouillères rembourrées',
                'brand' => 'Venum',
                'description' => 'Idéales pour le MMA et le grappling, protègent la rotule lors des passages au sol. Lavées en machine.',
                'price' => '16.00',
                'weight' => 200,
                'images' => ['KneePads.webp'],
                'type' => 'Protections',
                'size' => 'L',
                'colors' => ['noir']
            ],
            ///
            [
                'title' => 'Gants d\'entraînement Reebok',
                'brand' => 'Reebok',
                'description' => 'Gants 12oz parfaits pour les cours de cardio-boxing/fitness. Mesh aéré au niveau de la paume.',
                'price' => '25.00',
                'weight' => 700,
                'images' => ['gloves_9.webp'],
                'type' => 'Gants de boxe',
                'size' => '12 oz',
                'colors' => ['noir', 'rouge']
            ]
        ];

        for ($i = 0; $i < 40; $i++) {
            $data = $products[$i % count($products)];
            
            $product = new Product();
            // On ajoute un suffixe si on dépasse la liste de base pour les différencier
            $titleSuffix = $i >= count($products) ? ' (#' . ($i + 1) . ')' : '';
            $product->setTitle($data['title'] . $titleSuffix);
            $product->setBrand($data['brand']);
            $product->setDescription($data['description']);
            
            // On varie légèrement le prix pour plus de réalisme
            $basePrice = (float) $data['price'];
            $variation = rand(-10, 15);
            $newPrice = max(5, $basePrice + $variation); // Prix minimum de 5€
            $product->setPrice(number_format($newPrice, 2, '.', ''));
            
            $product->setWeight($data['weight']);
            $product->setStatus($data['active'] ?? 'active');
            $product->setType($data['type']);
            if (isset($data['size'])) {
                $product->setSize($data['size']);
            }
            if (isset($data['colors'])) {
                foreach ($data['colors'] as $colorLabel) {
                    $colorRefName = 'color_' . $colorLabel;
                    if ($this->hasReference($colorRefName, Dictionary::class)) {
                        $color = $this->getReference($colorRefName, Dictionary::class);
                        $product->addColor($color);
                    }
                }
            }

            // Liaison avec un Vendeur (User) unique et aléatoire (entre user_0 et user_9)
            // On exclut l'admin car il n'est pas dans la liste des références "user_X"
            $randomUserId = rand(0, 9);
            $product->setSeller($this->getReference('user_' . $randomUserId, User::class));

            // Liaison avec un État aléatoire
            $randomEtatId = rand(0, 4);
            $product->setEtat($this->getReference('etat_' . $randomEtatId, Dictionary::class));

            // Ajout des images pour ce produit
            foreach ($data['images'] as $imageName) {
                $image = new Image();
                $image->setPath('/images/Product/' . $imageName);
                $image->setProduct($product);
                $manager->persist($image);
            }

            // Mettre en avant les 3 premiers produits
            if ($i < 3) {
                $product->setIsHighlighted(true);
            } else {
                $product->setIsHighlighted(false);
            }

            $manager->persist($product);
        }
    }

    public function loadSizeGuide(ObjectManager $manager)
    {
        $guides = [
            [
                'equipment' => 'GANTS',
                'content' => [
                    'type' => 'gendered',
                    'homme' => [
                        ['<50', '8 oz', '10 oz'],
                        ['51-63', '10 oz', '12 oz'],
                        ['64-74', '12 oz', '14 oz'],
                        ['75-90', '14 oz', '16 oz'],
                        ['>90', '16 oz', '16 oz'],
                    ],
                    'femme' => [
                        ['<45', '8 oz', '10 oz'],
                        ['45-50', '10 oz', '12 oz'],
                        ['50-60', '12 oz', '14 oz'],
                        ['60-70', '14 oz', '16 oz'],
                        ['>70', '16 oz', '16 oz'],
                    ],
                    'headers' => ['POIDS (en KG)', 'ENTRAINEMENT', 'SPARRING'],
                    'imgHomme' => '/images/guide/gant_homme.webp',
                    'imgFemme' => '/images/guide/gant_femme.webp'
                ]
            ],
            [
                'equipment' => 'BANDES',
                'content' => [
                    'type' => 'standard',
                    'data' => [
                        ['Enfants / Petites mains', '2.5 m', 'Loisir / Sac'],
                        ['Adultes / Mains moyennes', '3.5 m', 'Entraînement régulier'],
                        ['Grandes mains / Boxe Thaï', '4.0 m - 4.5 m', 'Sparring / Intensif'],
                        ['Pro / Bandage dur', '5.0 m', 'Combat pro'],
                    ],
                    'headers' => ['PROFIL', 'LONGUEUR', 'UTILISATION'],
                    'img' => '/images/guide/bandes.webp'
                ]
            ],
            [
                'equipment' => 'CASQUE',
                'content' => [
                    'type' => 'standard',
                    'data' => [
                        ['< 53 cm', 'S', 'Enfant / Petit'],
                        ['54 - 56 cm', 'M', 'Moyen / Standard Femme'],
                        ['57 - 59 cm', 'L', 'Standard Homme'],
                        ['> 60 cm', 'XL', 'Grand'],
                    ],
                    'headers' => ['TOUR DE TÊTE', 'TAILLE', 'PROFIL'],
                    'img' => '/images/guide/casque.webp'
                ]
            ],
            [
                'equipment' => 'CHAUSSURES',
                'content' => [
                    'type' => 'gendered',
                    'homme' => [
                        ['39', '24.5 cm', '5.5'],
                        ['40', '25 cm', '6.5'],
                        ['41', '26 cm', '7.5'],
                        ['42', '26.5 cm', '8'],
                        ['43', '27.5 cm', '9'],
                        ['44', '28 cm', '9.5'],
                    ],
                    'femme' => [
                        ['36', '22.5 cm', '3.5'],
                        ['37', '23.5 cm', '4.5'],
                        ['38', '24 cm', '5'],
                        ['39', '25 cm', '6'],
                        ['40', '25.5 cm', '6.5'],
                        ['41', '26.5 cm', '7.5'],
                    ],
                    'headers' => ['POINTURE (EU)', 'LONGUEUR PIED', 'POINTURE (UK)'],
                    'imgHomme' => '/images/guide/chaussure_homme.webp',
                    'imgFemme' => '/images/guide/chaussure_femme.webp'
                ]
            ]
        ];

        foreach ($guides as $guideData) {
            $guide = new SizeGuide();
            $guide->setEquipment($guideData['equipment']);
            $guide->setContent($guideData['content']);
            $manager->persist($guide);
        }
    }
}
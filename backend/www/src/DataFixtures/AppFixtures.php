<?php

namespace App\DataFixtures;

use App\Entity\Boxe;
use App\Entity\Etat;
use App\Entity\Gender;
use App\Entity\Level;
use App\Entity\Image;
use App\Entity\Product;
use App\Entity\User;
use App\Entity\SizeGuide;
use App\Entity\Color;
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
            $color = new Color();
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
        $admin->setSize('180');
        $admin->setBudget(0);
        $admin->setIsOnboardingCompleted(true);
        $admin->setAvatar('/images/Logo.png');
        $admin->setBoxeId($this->getReference('boxe_0', Boxe::class));
        $admin->setLevelId($this->getReference('level_3', Level::class));
        $admin->setGenderId($this->getReference('gender_0', Gender::class));

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
                'weight' => 800,
                'images' => ['glove.webp'],
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
                'images' => ['choose.webp'],
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
            ]
        ];

        foreach ($products as $key => $data) {
            $product = new Product();
            $product->setTitle($data['title']);
            $product->setBrand($data['brand']);
            $product->setDescription($data['description']);
            $product->setPrice($data['price']);
            $product->setWeight($data['weight']);
            $product->setStatus($data['active'] ?? 'active');
            $product->setType($data['type']);
            if (isset($data['size'])) {
                $product->setSize($data['size']);
            }
            if (isset($data['colors'])) {
                foreach ($data['colors'] as $colorLabel) {
                    $colorRefName = 'color_' . $colorLabel;
                    if ($this->hasReference($colorRefName, Color::class)) {
                        $color = $this->getReference($colorRefName, Color::class);
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
            $product->setEtat($this->getReference('etat_' . $randomEtatId, Etat::class));

            // Ajout des images pour ce produit
            foreach ($data['images'] as $imageName) {
                $image = new Image();
                $image->setPath('/images/Product/' . $imageName);
                $image->setProduct($product);
                $manager->persist($image);
            }

            // Mettre en avant les 3 premiers produits
            if ($key < 3) {
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
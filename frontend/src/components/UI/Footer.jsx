import { Link } from 'react-router-dom';
import { IMG_LOGO } from "../../constants/appConstante";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 text-gray-400 font-inter mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src={IMG_LOGO} alt="2Round Logo" className="h-10 w-auto" />
              
            </div>
            <div className="flex flex-col space-y-2">
                <Link to="/register"><span className="uppercase font-bold font-inter text-white ">Créer mon profil</span></Link>
                <Link to="/resale"><span className="uppercase font-bold font-inter text-white">Commencer a vendre</span></Link>
            </div>
          </div>
          <div className="my-6 h-px w-full bg-gray-300 md:hidden"></div>
          {/* Links */}
            <div className="flex flex-col gap-5 md:flex-row md:gap-20 mt-10 lg:mt-0">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase md:whitespace-nowrap">Navigation</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link to="/marketplace" className="text-sm hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link to="/conversation" className="text-sm hover:text-white transition-colors">Messages</Link></li>
                  <li><Link to="/guide" className="text-sm hover:text-white transition-colors">Guides</Link></li>
                </ul>
              </div>
              <div className='mt-2'>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase md:whitespace-nowrap">Mon round Perso</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link to="/mycustomised" className="text-sm hover:text-white transition-colors">Favoris</Link></li>
                </ul>
              </div>
              <div className='mt-2'>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase md:whitespace-nowrap">Mon Vestiaire</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link to="/my-locker" className="text-sm hover:text-white transition-colors">Articles</Link></li>
                  <li><Link to="/my-locker?tab=evaluations" className="text-sm hover:text-white transition-colors">Évaluations</Link></li>
                </ul>
              </div>
              <div className="my-6 h-px w-full bg-gray-300 md:hidden"></div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase md:whitespace-nowrap">Légal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link to="/cgv" className="text-sm hover:text-white transition-colors">CGV</Link></li>
                  <li><Link to="/mentions-legales" className="text-sm hover:text-white transition-colors">Mentions légales</Link></li>
                  <li><Link to="/confidentialite" className="text-sm hover:text-white transition-colors">Confidentialité</Link></li>
                </ul>
              </div>
            </div>
          </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/5 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-xs leading-5 text-gray-500">&copy; 2026 2ROUND. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
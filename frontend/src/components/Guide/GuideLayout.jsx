import { IMG_BGRAYURE } from '../../constants/appConstante';
import { IMAGE_URL } from '../../constants/apiConstante';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';

const GuideLayout = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <>
    {/* Guide */}
    {/* Image cachée pour écouter l'événement de chargement */}
            <img 
              src={IMG_BGRAYURE} 
              alt="preload" 
              className="hidden" 
              onLoad={() => setIsLoaded(true)} 
            />
            
          <div className=
          {
            `w-full bg-boxe bg-blend-multiply relative transition-opacity duration-500 max-w-[1800px] mx-auto text-white
            ${isLoaded ? 'opacity-100' : 'opacity-0'} py-10 md:py-20`}
            style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}
          >

            <div className="flex justify-start p-10 max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold font-bebas uppercase tracking-wide mb-1 md:text-7xl ">Un coup de poing ?</h1>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 px-5 max-w-7xl mx-auto">
              <Link to='/guidesize' className="flex-1 max-w-sm mx-auto md:max-w-none w-full flex">
                <div className="flex flex-col items-center bg-gray-dark p-8 w-full justify-center">
                  <img src={`${IMAGE_URL}/icons/tape_measure.png`} alt="" className='w-20 mb-4 md:w-40'/>
                  <span className="uppercase font-inter font-bold md:text-2xl">Les tailles</span>
                  <span className="font-inter font-extralight text-center px-5 pt-3 md:text-xl">Trouver la bonne taille selon son corps.</span>
                </div>
              </Link>

              <Link to='/guidestuff' className="flex-1 max-w-sm mx-auto md:max-w-none w-full flex">
                <div className="flex flex-col items-center bg-gray-dark p-8 w-full justify-center">
                  <img src={`${IMAGE_URL}/icons/dumbbell.png`} alt="" className='w-20 mb-4 md:w-40'/>
                  <span className="uppercase font-inter font-bold md:text-2xl">Les équipements</span>
                  <span className="font-inter font-extralight text-center px-5 pt-3 md:text-xl">Comprendre chaque équipement et à quoi il sert.</span>
                </div>
              </Link>

              <Link to='/guideadvice' className="flex-1 max-w-sm mx-auto md:max-w-none w-full flex">
                <div className="flex flex-col items-center bg-gray-dark p-8 w-full justify-center">
                  <img src={`${IMAGE_URL}/icons/heart.png`} alt="" className='w-20 mb-4 md:w-40'/>
                  <span className="uppercase font-inter font-bold md:text-2xl">Bien débuter</span>
                  <span className="font-inter font-extralight text-center px-5 pt-3 md:text-xl">Conseil sécurité et entrainement.</span>
                </div>
              </Link>
            </div>
            {/* Lien Voir tous les guides */}
              <div className="text-right mt-12 mr-5  md:pr-15 md:pt-10">
                <Link to="/guide" className="text-red font-inter font-bold uppercase md:text-4xl hover:text-red/80 transition-colors inline-flex items-center gap-2">
                  Voir les guides
                  <FaArrowRight />
                </Link>
              </div>
          </div> 
    </>
    

  )
}

export default GuideLayout
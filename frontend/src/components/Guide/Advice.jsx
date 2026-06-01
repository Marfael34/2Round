import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Shield,
  ShieldCheck,
  Sword,
  User,
  Play,
  Activity,
  AlertTriangle,
  X,
} from "lucide-react";

const adviceGuides = [
  {
    title: "Les Bases de la Posture",
    tips: [
      "Écartez vos pieds à la largeur des épaules pour plus de stabilité.",
      "Gardez les genoux légèrement fléchis (ne jamais les bloquer).",
      "Levez vos mains à hauteur des pommettes.",
      "Rentrez légèrement le menton vers votre poitrine pour le protéger.",
    ],
    icon: <User className="w-6 h-6 text-red-500" />,
  },
  {
    title: "L'Équipement Essentiel",
    tips: [
      "Bandes (4m ou +) : Indispensables pour le maintien des poignets.",
      "Gants d'entraînement : Préférez du 14oz ou 16oz pour bien protéger vos mains.",
      "Protège-dents : À toujours porter lors des sparrings ou exercices à deux.",
      "Chaussures : Optez pour des semelles fines afin de pivoter facilement.",
    ],
    icon: <Shield className="w-6 h-6 text-red-500" />,
  },
  {
    title: "Sécurité et Prévention",
    tips: [
      "L'échauffement est obligatoire (10-15 min de corde à sauter ou shadow).",
      "Hydratez-vous régulièrement avant, pendant et après l'entraînement.",
      "Ne frappez jamais un sac lourd sans vos bandes et vos gants.",
      "Écoutez vos articulations : la douleur aiguë n'est jamais normale.",
    ],
    icon: <Activity className="w-6 h-6 text-red-500" />,
  },
  {
    title: "Techniques de Défense",
    tips: [
      "Ne fermez jamais les yeux lorsqu'un coup s'approche de vous.",
      "Gardez vos coudes bien collés contre vos côtes pour protéger le corps.",
      "Bougez votre tête avant et après avoir lancé une combinaison.",
      "Le pas de retrait (step back) est l'une des meilleures défenses de base.",
    ],
    icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
  },
];

const videoCategories = [
  {
    id: "posture",
    label: "Posture & Garde",
    icon: <User className="w-4 h-4 mr-2" />,
  },
  {
    id: "safety",
    label: "Sécurité & Prévention",
    icon: <AlertTriangle className="w-4 h-4 mr-2" />,
  },
  {
    id: "defense",
    label: "Techniques de Défense",
    icon: <Sword className="w-4 h-4 mr-2" />,
  },
];

// Liens directs vers YouTube
const videos = {
  posture: [
    {
      title: "La position de boxe: Un guide étape par étape pour les débutants",
      url: "https://www.youtube.com/watch?v=7G-MWsjC6xE",
      channel: "Boxing Ready",
    },
  ],
  safety: [
    {
      title: "How to Wrap Hands (The Best Way)",
      url: "https://www.youtube.com/watch?v=CMS_ni5lEs4",
      channel: "Tony Jeffries",
    },
  ],
  defense: [
    {
      title: "Boxing Defense 101",
      url: "https://www.youtube.com/watch?v=0XpEc7Qk9bk",
      channel: "BOWING FACTORY TV",
    },
  ],
};

export default function Advice() {
  const [activeTab, setActiveTab] = useState("posture");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8 font-inter relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-28 right-6 sm:right-12 md:right-20 lg:right-32 text-gray-400 hover:text-white transition-colors z-50"
      >
        <X strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      {/* Hero Section */}
      <div className="max-w-[960px] mx-auto text-center mb-24 mt-8">
        <h1 className="font-bebas text-6xl md:text-8xl uppercase tracking-widest text-white mb-10">
          Guide de <span className="text-red-600">Démarrage</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg font-light text-gray-400">
          Maîtrisez les fondamentaux, apprenez à vous protéger et progressez en
          toute sécurité grâce à nos ressources pour débutants.
        </p>
      </div>

      <div className="max-w-[960px] mx-auto space-y-28">
        {/* Conseils Essentiels */}
        <section>
          <div className="flex items-center space-x-4 mb-10 pb-4 border-b border-white/10">
            <BookOpen className="w-8 h-8 text-red-600" />
            <h2 className="font-bebas text-4xl tracking-wider text-white uppercase">
              Conseils Essentiels
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adviceGuides.map((guide, idx) => (
              <div
                key={idx}
                className="group relative bg-[#111] border border-white/10 p-8 hover:border-red-600/50 transition-all duration-300 flex flex-col"
              >
                <div className="mb-6 flex items-center justify-center w-14 h-14 bg-black border border-white/10 rounded-sm group-hover:border-red-600/50 transition-colors">
                  {guide.icon}
                </div>
                <h3 className="font-bebas text-3xl tracking-wide text-white mb-5 uppercase">
                  {guide.title}
                </h3>
                <ul className="space-y-3 grow">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1 text-xs">■</span>
                      <span className="text-gray-400 text-sm font-light leading-relaxed">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Liens Vidéo */}
        <section className="pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/10 gap-6">
            <div className="flex items-center space-x-4">
              <Play className="w-8 h-8 text-red-600" />
              <h2 className="font-bebas text-4xl tracking-wider text-white uppercase">
                Ressources Vidéo
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {videoCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center px-4 py-2 font-bebas tracking-widest uppercase transition-all duration-200 border ${
                    activeTab === cat.id
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-black border-white/20 text-gray-400 hover:text-white hover:border-white/50"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos[activeTab].map((video, idx) => (
              <a
                key={idx}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111] border border-white/10 p-6 group flex flex-col hover:border-red-600/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bebas text-2xl tracking-wide text-white uppercase group-hover:text-red-500 transition-colors pr-4">
                    {video.title}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
                    <Play className="w-4 h-4 text-red-500 group-hover:text-white transition-colors ml-1" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-light mt-auto">
                  Source : {video.channel}
                </p>
                <div className="text-red-500 text-xs font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Visionner sur YouTube &rarr;
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

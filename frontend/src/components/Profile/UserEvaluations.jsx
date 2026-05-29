import { FaStar } from "react-icons/fa6";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Il y a moins d'une minute";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `Il y a ${mins} minute${mins > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 86400) {
    const hrs = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hrs} heure${hrs > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Il y a ${months} mois`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `Il y a ${years} an${years > 1 ? 's' : ''}`;
};

const UserEvaluations = ({ evaluations }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="pt-4">
        <p className="text-gray-400 font-inter italic">Vous n'avez reçu aucune évaluation.</p>
      </div>
    );
  }

  const averageRating = evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length;

  return (
    <div className="pt-4 pb-8">
      {/* Top Section: Average Rating */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <span className="text-5xl font-bebas text-white tracking-wider">
            {averageRating.toFixed(1).replace('.0', '')} / 5
          </span>
          <div className="flex gap-1.5 text-2xl">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.round(averageRating) ? "text-red-600" : "text-white"} />
            ))}
          </div>
        </div>
        <span className="text-gray-400 text-[13px] font-inter tracking-widest mt-2 block uppercase">
          {evaluations.length} Évaluation{evaluations.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Evaluations List */}
      <div className="space-y-8">
        {evaluations.map((evaluation, index) => {
          const senderPseudo = evaluation.sender?.pseudo || "Utilisateur supprimé";

          return (
            <div key={evaluation.id} className={`flex gap-6 ${index !== evaluations.length - 1 ? 'border-b border-white/10 pb-8' : ''}`}>
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#1A1A1A] border border-white/5">
                {evaluation.sender?.avatar ? (
                  <img src={evaluation.sender.avatar} alt={senderPseudo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bebas text-2xl uppercase">
                    {senderPseudo.slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col pt-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bebas text-2xl tracking-wider uppercase text-white leading-none">
                    {senderPseudo}
                  </span>
                  <span className="text-gray-500 text-[11px] font-inter">
                    {timeAgo(evaluation.createdAt)}
                  </span>
                </div>
                
                {evaluation.comment && (
                  <p className="text-gray-400 font-inter text-sm mb-2 font-light">
                    {evaluation.comment}
                  </p>
                )}

                <div className="flex gap-1 text-[15px] mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < evaluation.rating ? "text-red-600" : "text-white"} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserEvaluations;

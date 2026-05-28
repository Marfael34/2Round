import { FaStar } from "react-icons/fa6";

const UserEvaluations = ({ evaluations }) => {
  return (
    <div>
      {evaluations.length > 0 ? (
        <div className="space-y-4">
          {evaluations.map(evaluation => {
            const senderPseudo = evaluation.sender?.pseudo || "Utilisateur supprimé";
            const dateStr = evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }) : "";

            return (
              <div key={evaluation.id} className="bg-[#151515] border border-white/10 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="font-bebas text-xl text-white tracking-wider uppercase">{senderPseudo}</span>
                    {dateStr && <span className="text-gray-500 text-xs font-inter mt-0.5">{dateStr}</span>}
                  </div>
                  <div className="flex gap-1 text-base">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < evaluation.rating ? "text-red-600" : "text-gray-700"} />
                    ))}
                  </div>
                </div>
                {evaluation.comment && (
                  <p className="text-gray-300 font-inter text-sm italic border-l-2 border-red-600 pl-3 py-1">"{evaluation.comment}"</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 font-inter italic">Vous n'avez reçu aucune évaluation.</p>
      )}
    </div>
  );
};

export default UserEvaluations;

import React from 'react';

const UserEvaluations = ({ evaluations }) => {
  return (
    <div>
      {evaluations.length > 0 ? (
        <div className="space-y-4">
          {evaluations.map(evaluation => (
            <div key={evaluation.id} className="bg-[#1A1A1A] border border-white/10 p-4">
              <div className="flex gap-1 text-red-600 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < evaluation.rating ? "text-red-600" : "text-gray-600"}>★</span>
                ))}
              </div>
              <p className="text-white">{evaluation.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Vous n'avez reçu aucune évaluation.</p>
      )}
    </div>
  );
};

export default UserEvaluations;

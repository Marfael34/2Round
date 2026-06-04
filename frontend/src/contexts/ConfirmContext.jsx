import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null,
    isAlert: false,
  });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        isAlert: false,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const alert = useCallback((message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        isAlert: true,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: null
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {modalState.isAlert ? "Information" : "Confirmation"}
            </h3>
            <p className="text-gray-300 text-center mb-8 leading-relaxed">
              {modalState.message}
            </p>
            <div className={`flex gap-3 ${modalState.isAlert ? 'justify-center' : 'justify-end'}`}>
              {!modalState.isAlert && (
                <button
                  onClick={modalState.onCancel}
                  className="px-5 py-2.5 bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-medium flex-1"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={modalState.onConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium flex-1"
              >
                {modalState.isAlert ? "OK" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

const FinalReview = ({ config, onConfirm }) => {
    return (
      <div className="text-white text-center">
        <h2 className="text-xl font-bold mb-4">Riepilogo Configurazione</h2>
        <p><strong>Nome:</strong> {config.hotelName}</p>
        <p><strong>Indirizzo:</strong> {config.hotelAddress}</p>
        <p><strong>Voce:</strong> {config.voice}</p>
        {config.avatar && <img src={URL.createObjectURL(config.avatar)} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mt-4" />}
        <button className="mt-6 bg-purple-500 px-6 py-3 rounded-lg" onClick={onConfirm}>
          Conferma Configurazione
        </button>
      </div>
    );
  };
  
  export default FinalReview;
  
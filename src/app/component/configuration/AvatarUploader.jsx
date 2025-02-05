import { useState } from "react";
import { useBotConfigStore } from "../../../../store/useBotConfigStore";

const AvatarUploader = () => {
  const { setBotConfig, nextStep } = useBotConfigStore();
  const [avatar, setAvatar] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      setBotConfig({ avatar: file });
    }
  };

  return (
    <div className="flex flex-col items-start space-y-6">
      <label className="cursor-pointer bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-xl hover:scale-110 transition-all hover:shadow-[0_0_15px_rgba(128,0,255,0.6)]">
        Carica Avatar
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
      {avatar && (
        <img
          src={avatar}
          alt="Avatar"
          className="w-40 h-40 rounded-full border-4 border-purple-500 shadow-lg hover:scale-110 transition-transform hover:shadow-purple-500"
        />
      )}
      <button
        onClick={nextStep}
        className="mt-4 bg-purple-500 px-6 py-3 rounded-lg hover:scale-110 transition-transform hover:shadow-purple-500 shadow-lg"
      >
        Avanti
      </button>
    </div>
  );
};

export default AvatarUploader;

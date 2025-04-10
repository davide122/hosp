"use client"
import { useState } from 'react';

export default function ActivityForm() {
  // Stato per i campi principali dell'attività
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    menu: '',
    prices: '',
    address: '',
    phone_number: '',
    website: '',
    description: '',
    category: ''
  });

  // Stato per gestire le immagini (array di oggetti)
  const [images, setImages] = useState([]);
  // Stato per messaggi di successo/errore
  const [message, setMessage] = useState('');

  // Gestione modifiche nei campi principali
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestione delle modifiche per ogni immagine
  const handleImageChange = (index, field, value) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setImages(updatedImages);
  };

  // Aggiunge un nuovo blocco per immagine
  const addImage = () => {
    setImages(prev => [...prev, { image_url: '', description: '', is_main: false }]);
  };

  // Rimuove una immagine dall'array
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Gestione del submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, images };

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Attività creata con successo! ID: ${data.activityId}`);
        // Reset del form dopo l'invio
        setFormData({
          name: '',
          email: '',
          menu: '',
          prices: '',
          address: '',
          phone_number: '',
          website: '',
          description: '',
          category: ''
        });
        setImages([]);
      } else {
        setMessage(`Errore: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Errore: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Nuova Attività</h1>
      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
            required
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
            required
          />
        </div>
        {/* Menu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Menu:
          </label>
          <textarea
            name="menu"
            value={formData.menu}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Prezzi */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prezzi:
          </label>
          <textarea
            name="prices"
            value={formData.prices}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Indirizzo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Indirizzo:
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Telefono */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telefono:
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Sito Web */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sito Web:
          </label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Descrizione */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrizione:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categoria:
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-300 my-4"></div>

        <h2 className="text-xl font-semibold mb-4">Immagini (opzionali)</h2>
        {images.map((img, idx) => (
          <div key={idx} className="border border-gray-300 p-4 rounded mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                URL Immagine:
              </label>
              <input
                type="text"
                value={img.image_url}
                onChange={(e) =>
                  handleImageChange(idx, 'image_url', e.target.value)
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Descrizione Immagine:
              </label>
              <textarea
                value={img.description}
                onChange={(e) =>
                  handleImageChange(idx, 'description', e.target.value)
                }
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={img.is_main}
                  onChange={(e) =>
                    handleImageChange(idx, 'is_main', e.target.checked)
                  }
                  className="mr-2"
                />
                Principale
              </label>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-red-600 hover:underline"
              >
                Rimuovi immagine
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addImage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Aggiungi immagine
        </button>
        <button
          type="submit"
          className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Invia Attività
        </button>
      </form>
    </div>
  );
}

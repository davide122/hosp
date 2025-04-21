"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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

  // Gestione delle modifiche dei campi principali
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

  // Aggiunge un nuovo oggetto immagine
  const addImage = () => {
    setImages(prev => [...prev, { image_url: '', description: '', is_main: false }]);
  };

  // Rimuove un'immagine dall'array
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Gestione del submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      const payload = { ...formData, images };
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
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
        
        // Reindirizza alla lista dopo 2 secondi
        setTimeout(() => {
          router.push('/backoffice/activities');
        }, 2000);
      } else {
        setError(data.message || 'Errore durante il salvataggio dell\'attività');
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      setError('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">Nuova Attività</h1>
          <Link href="/backoffice/activities" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
            Torna alla lista
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 text-white p-4 rounded-md mb-6">
            Attività creata con successo! Reindirizzamento in corso...
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Categoria
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              {/* Indirizzo */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                  Indirizzo
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              {/* Telefono */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300 mb-1">
                  Telefono
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
              
              {/* Sito Web */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                  Sito Web
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
              </div>
            </div>
            
            {/* Menu */}
            <div>
              <label htmlFor="menu" className="block text-sm font-medium text-gray-300 mb-1">
                Menu
              </label>
              <textarea
                id="menu"
                name="menu"
                rows="4"
                value={formData.menu}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>
            
            {/* Prezzi */}
            <div>
              <label htmlFor="prices" className="block text-sm font-medium text-gray-300 mb-1">
                Prezzi
              </label>
              <textarea
                id="prices"
                name="prices"
                rows="4"
                value={formData.prices}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>
            
            {/* Descrizione */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Descrizione
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>
            
            {/* Sezione Immagini */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold mb-4">Immagini</h3>
              
              {images.map((img, idx) => (
                <div key={idx} className="mb-6 p-4 border border-gray-700 rounded-md bg-gray-750">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">Immagine {idx + 1}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Rimuovi
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* URL Immagine */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        URL Immagine *
                      </label>
                      <input
                        type="text"
                        value={img.image_url}
                        onChange={(e) => handleImageChange(idx, 'image_url', e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    
                    {/* Descrizione Immagine */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Descrizione Immagine
                      </label>
                      <input
                        type="text"
                        value={img.description || ''}
                        onChange={(e) => handleImageChange(idx, 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Immagine Principale */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={img.is_main || false}
                        onChange={(e) => handleImageChange(idx, 'is_main', e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">Immagine principale</span>
                    </label>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
              >
                Aggiungi Immagine
              </button>
            </div>
            
            <div className="pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Salvataggio in corso...' : 'Salva Attività'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
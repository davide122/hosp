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
  // Stato per mostrare eventuali messaggi di successo/errore
  const [message, setMessage] = useState('');

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
        // Eventualmente, reset del form dopo l'invio
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
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h1>Nuova Attività</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nome:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Menu:
            <textarea
              name="menu"
              value={formData.menu}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Prezzi:
            <textarea
              name="prices"
              value={formData.prices}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Indirizzo:
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Telefono:
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Sito Web:
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Descrizione:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Categoria:
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </label>
        </div>
        
        <hr />
        <h3>Immagini (opzionali)</h3>
        {images.map((img, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
            <div>
              <label>
                URL Immagine:
                <input
                  type="text"
                  value={img.image_url}
                  onChange={(e) => handleImageChange(idx, 'image_url', e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Descrizione Immagine:
                <textarea
                  value={img.description}
                  onChange={(e) => handleImageChange(idx, 'description', e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Principale:
                <input
                  type="checkbox"
                  checked={img.is_main}
                  onChange={(e) => handleImageChange(idx, 'is_main', e.target.checked)}
                />
              </label>
            </div>
            <button type="button" onClick={() => removeImage(idx)}>
              Rimuovi immagine
            </button>
          </div>
        ))}
        <button type="button" onClick={addImage}>
          Aggiungi immagine
        </button>
        <br />
        <br />
        <button type="submit">Invia Attività</button>
      </form>
    </div>
  );
}

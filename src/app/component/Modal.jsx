// Modal.js
"use client";
import React from "react";

const Modal = ({ pdfLink, onClose }) => {
  return (
    <div className="modal">
      <h2>Prenotazione Completata</h2>
      <p>La tua prenotazione è stata completata con successo!</p>
      <a href={pdfLink} target="_blank" rel="noopener noreferrer">Scarica il PDF della prenotazione</a>
      <button onClick={onClose}>Chiudi</button>
    </div>
  );
};

export default Modal;

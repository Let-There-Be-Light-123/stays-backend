import React, { useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

const createPDF = () => {
  return (
    <>
      <h1>Kadu Booking App</h1>
      <h2>Hello React</h2> 
    </>
  )
};

const PdfGenerator = () => {
  useEffect(() => {
    createPDF();
  }, []);

  return (
    <div>
      <p>Generating PDF...</p>
    </div>
  );
};

export default PdfGenerator;
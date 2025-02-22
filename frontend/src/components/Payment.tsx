import React, { useState, useEffect } from "react";
import { Button, Form, Container, Alert, Image } from "react-bootstrap";

const PaymentQRCodeUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // ✅ Load image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem("qrCodeImage");
    if (savedImage) {
      setSelectedImage(savedImage);
    }
  }, []);

  // ✅ Handle image upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];

    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        setError("Please upload a valid image file (JPG, PNG, GIF).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const imageData = e.target.result as string;
          setSelectedImage(imageData);
          localStorage.setItem("qrCodeImage", imageData); // ✅ Save to localStorage
          setError("");
        }
      };
      reader.readAsDataURL(imageFile);
    }
  };

  // ✅ Remove image (also clears from localStorage)
  const handleRemoveImage = () => {
    setSelectedImage(null);
    localStorage.removeItem("qrCodeImage");
    setError("");
  };

  return (
    <Container className="mt-4 text-center">
      <h3 className="mb-3">Upload Your Payment QR Code</h3>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select an image (JPG, PNG, GIF)</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      {selectedImage && (
        <div className="mb-3">
          <h5>QR Code Preview:</h5>
          <Image src={selectedImage} alt="QR Code Preview" fluid className="mb-2 border p-2" style={{ maxWidth: "400px" }} />
          <div>
            <Button variant="danger" onClick={handleRemoveImage} className="me-2">
              Remove
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PaymentQRCodeUpload;

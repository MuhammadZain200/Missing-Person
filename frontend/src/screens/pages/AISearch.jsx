import React, { useState } from "react";
import axios from "axios";

const AISearch = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://localhost:5000/ai-search", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Result from backend:", response.data);
      setResult(response.data);
      setMessage("Match result received.");
    } catch (err) {
      console.error(err);
      setMessage("Search failed. Try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">AI-Powered Facial Search</h2>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
        {preview && (
          <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded border" />
        )}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Search
        </button>
      </form>

      {result && (
        <div className="mt-6">
          <h3 className="font-semibold"> Match Found:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AISearch;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { presentationAPI } from "../services/api";

const CreatePage = () => {
  const navigate = useNavigate();
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);

  const cards = [
    {
      title: "Generate",
      desc: "Create from a one-line prompt in a few seconds",
      img: "/src/assets/generate.png",
      path: "/generate",
    },
  ];

  useEffect(() => {
    const fetchRecents = async () => {
      try {
        const data = await presentationAPI.getRecentPrompts?.();
        if (data) setRecents(data);
      } catch {
        console.warn("No recent data found.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecents();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background:
          "linear-gradient(to bottom right, #f9fafb 0%, #e3eeff 35%, #c9e4ff 100%)",
        color: "#002253",
      }}
    >
      {/* Home Button */}
      <div className="w-full max-w-6xl px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#002253] transition font-medium px-4 py-2 rounded-full shadow-sm border border-gray-200"
        >
          <Home className="w-5 h-5" />
          Home
        </button>
      </div>

      {/* Title */}
      <div className="text-center mt-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold"
          style={{ color: "#002253" }}
        >
          Create with <span style={{ color: "#0000A3" }}>AI</span>
        </motion.h1>
        <p className="mt-3 text-lg" style={{ color: "#000000A3" }}>
          How would you like to get started?
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row justify-center gap-8 mt-14 px-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 w-full max-w-xs cursor-pointer border border-gray-100"
            onClick={() => navigate(card.path)}
          >
            <img
              src={card.img}
              alt={card.title}
              className="w-full rounded-xl mb-4"
            />
            <h3 className="font-semibold text-lg" style={{ color: "#002253" }}>
              {card.title}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "#66666B" }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Prompts */}
      <div className="w-full text-center mt-20 pb-16">
        <h2 className="text-xl font-semibold mb-6" style={{ color: "#002253" }}>
          Your recent prompts
        </h2>

        {loading ? (
          <p style={{ color: "#66666B" }}>Loading recents...</p>
        ) : recents.length > 0 ? (
          <div className="flex flex-col items-center gap-3">
            {recents.map((item, i) => (
              <div
                key={i}
                className="bg-white w-full max-w-lg rounded-xl shadow p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <span className="font-medium" style={{ color: "#002253" }}>
                  {item.title}
                </span>
                <span className="text-sm" style={{ color: "#66666B" }}>
                  Generated · {item.time}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#66666B" }}>No recent prompts yet.</p>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
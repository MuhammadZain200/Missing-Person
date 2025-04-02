import React from "react";
import { Link } from "react-router-dom";

const DashboardCard = ({ title, count, icon, bgColor, to }) => {          
  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-2xl shadow-md p-6 transition transform hover:scale-105 ${bgColor}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{count}</p>
      </div>
      <div className="text-white text-4xl">{icon}</div>
    </Link>
  );
};

export default DashboardCard;

//Reusable components for Dashboard metrics
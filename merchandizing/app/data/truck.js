import React from "react";
import "../styles/clean.css";

const TruckSummary = ({ data }) => {
  const { truck, trips } = data;

  const formattedMileage = (mileage) =>
    `${mileage} Kms/liter - With load: ${truck.mileageWithLoad} Kms/liter - Without load: ${truck.mileageWithoutLoad} Kms/liter`;

  const formattedExpenses = (expenseType) =>
    `${expenseType}: ${truck[expenseType]} INR/${
      expenseType === "km" ? "Km" : "Trip"
    }`;

  return (
    <div className="truck-summary">
      <h2>Truck Summary</h2>
      <div className="summary-row">
        <div className="summary-label">Truck Type:</div>
        <div className="summary-value">{truck.type}</div>
      </div>
      <div className="summary-row">{formattedMileage("Mileage")}</div>
      <div className="summary-row">{formattedExpenses("maintenance")}</div>
      <div className="summary-row">
        <div className="summary-label">Capacity:</div>
        <div className="summary-value">{truck.capacity} Bikes / Truck</div>
      </div>
      <div className="summary-row">{formattedExpenses("annualDistance")}</div>
      <div className="trip-summary">
        <h3>Trip Summary</h3>
        <div className="summary-row">
          <div className="summary-label">Origin:</div>
          <div className="summary-value">{trips[0].origin}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Destination:</div>
          <div className="summary-value">{trips[0].destination}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Distance:</div>
          <div className="summary-value">{trips[0].distance} Kms</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Fixed Cost per Trip:</div>
          <div className="summary-value">{trips[0].fixedCostPerTrip} INR</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Admin Cost per Trip:</div>
          <div className="summary-value">{trips[0].adminCostPerTrip} INR</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Variable Cost per Trip:</div>
          <div className="summary-value">
            {trips[0].variableCostPerTrip} INR
          </div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Cost per Bike:</div>
          <div className="summary-value">{trips[0].costPerBike} INR</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Revenue per Bike:</div>
          <div className="summary-value">{trips[0].revenuePerBike} INR</div>
        </div>
      </div>
    </div>
  );
};

export default TruckSummary;
